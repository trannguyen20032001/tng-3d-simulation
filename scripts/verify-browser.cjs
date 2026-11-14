// Regression check against the saved source using installed headless Chrome.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "source-manifest.json")),
);
for (const file of manifest)
  new vm.Script(fs.readFileSync(path.join(root, file), "utf8"), {
    filename: file,
  });
for (const file of ["index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!/^https?:/.test(asset))
      assert.ok(fs.existsSync(path.join(root, asset)), asset);
  }
}
console.log("Syntax and entry-point asset checks passed.");
const port = 9437;
const chrome = spawn(
  process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(root, ".tmp", "chrome-verification")}`,
    "--window-size=1440,1000",
    "--enable-unsafe-swiftshader",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let socket,
  nextId = 0;
const pending = new Map(),
  errors = [];
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("CDP timeout: " + method));
    }, 15000);
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails)
    throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function load(file, modern) {
  errors.length = 0;
  await send("Page.navigate", {
    url: pathToFileURL(path.join(root, file)).href,
  });
  for (let i = 0; i < 180; i++) {
    if (
      await evaluate(
        modern ? "!!window.TNG?.state?.stats2" : "!!window.__stats2",
      )
    )
      break;
    if (errors.length) throw new Error(file + ": " + errors.join("\n"));
    await delay(250);
    if (i === 179) throw new Error("Page initialization timed out: " + file);
  }
  await delay(2000);
  assert.equal(errors.length, 0, errors.join("\n"));
  const prefix = modern ? "TNG.state." : "window.__";
  return evaluate(`(() => {
    const f1=${prefix}f1, parking=${prefix}cant1;
    f1.scene.updateMatrixWorld(true);
    let vertices=0, instances=0, meshes=0, hash=2166136261;
    const parts=[];
    const mix = n => {const s=String(n);for(let i=0;i<s.length;i++)hash=Math.imul(hash^s.charCodeAt(i),16777619)>>>0};
    f1.scene.traverse(o=>{
      // Original motorcycle parking uses unseeded Math.random(). Its six
      // instanced parts change count/color on every load, even without edits.
      const isAgv=${modern}&&(()=>{for(let node=o;node;node=node.parent)if(node.userData?.role==='agv-system')return true;return false})();
      const isEnvironmentSensor=${modern}&&(()=>{for(let node=o;node;node=node.parent)if(node.userData?.role==='environment-sensors')return true;return false})();
      const isAuxiliary=${modern}&&!!o.userData?.hoverOutline;
      if(!o.isMesh || isAgv || isEnvironmentSensor || isAuxiliary || (o.parent===parking && o.isInstancedMesh))return;
      const previousHash=hash;hash=2166136261;
      meshes++;
      vertices+=o.geometry.attributes.position.count;
      for(const n of o.matrixWorld.elements)mix(n);
      mix(o.geometry.attributes.position.count);
      for(const n of o.geometry.attributes.position.array)mix(n);
      const geometryHash=hash;
      if(o.isInstancedMesh){instances+=o.count;for(const n of o.instanceMatrix.array)mix(n)}
      const matrixHash=hash;
      if(o.instanceColor)for(const n of o.instanceColor.array)mix(n);
      const colorHash=hash;
      mix(o.material.color?.getHex());mix(o.material.opacity);mix(o.material.roughness);mix(o.castShadow);
      parts.push({hash,geometryHash,matrixHash,colorHash,type:o.geometry.type,count:o.count,position:o.position.toArray(),colors:o.instanceColor&&[628,228,492,176,102].includes(o.count)?Array.from(o.instanceColor.array):undefined});
      hash=(previousHash^hash)>>>0;
    });
    return {meshes,vertices,instances,hash,parts,stats:${prefix}stats2,batches:${prefix}batchStats};
  })()`);
}
(async () => {
  try {
    let tabs;
    for (let i = 0; i < 60; i++) {
      try {
        tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        break;
      } catch {
        await delay(250);
      }
    }
    assert.ok(tabs?.length, "Headless Chrome did not start.");
    socket = new WebSocket(
      tabs.find((t) => t.type === "page").webSocketDebuggerUrl,
    );
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    socket.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.id) {
        const request = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) request.reject(new Error(JSON.stringify(msg.error)));
        else request.resolve(msg.result);
      } else if (msg.method === "Runtime.exceptionThrown")
        errors.push(
          msg.params.exceptionDetails.exception?.description ||
            msg.params.exceptionDetails.text,
        );
    };
    socket.onclose = () => {
      for (const request of pending.values())
        request.reject(new Error("Chrome connection closed"));
      pending.clear();
    };
    await send("Runtime.enable");
    await send("Page.enable");
    const original = await load("backups/original.html", false);
    console.log("Original:", { ...original, parts: undefined });
    // Start the refactor comparison from the default toolbar state. The later
    // test below verifies saved preferences separately.
    await evaluate("localStorage.removeItem('tng-viet-duc-3d:toolbar-v1')");
    const current = await load("index.html", true);
    console.log("Refactored:", { ...current, parts: undefined });
    const agvStart = await evaluate(`({
      robots:TNG.state.agv.agents.length,
      robotVisible:TNG.state.agv.robots.visible,
      routesVisible:TNG.state.agv.routes.visible,
      position:TNG.state.agv.agents[0].robot.position.toArray()
    })`);
    assert.equal(agvStart.robots, 5);
    assert.equal(agvStart.robotVisible, true);
    assert.equal(agvStart.routesVisible, true);
    await delay(700);
    const agvEnd = await evaluate(
      "TNG.state.agv.agents[0].robot.position.toArray()",
    );
    assert.notDeepEqual(agvEnd, agvStart.position, "AGV did not move.");
    const popup = await evaluate(`(() => {
      const agent=TNG.state.agv.agents[0];
      TNG.state.agv.select(agent);
      return {
        shown:!document.getElementById('objectInfo').hidden,
        name:document.getElementById('objectInfoName').textContent,
        floor:document.getElementById('objectInfoFloor').textContent,
        load:document.getElementById('objectInfoLoad').textContent,
        speed:document.getElementById('objectInfoSpeed').textContent
      };
    })()`);
    assert.deepEqual(popup, {shown:true,name:"AGV-01",floor:"Tầng 1",load:"120 kg",speed:popup.speed});
    assert.match(popup.speed, /^\d+\.\d{2} m\/s$/);
    assert.deepEqual(
      await evaluate("[...document.querySelectorAll('#objectInfoBattery, #objectInfoLoad, #objectInfoSpeed, #objectInfoTemperature, #objectInfoHumidity')].map(e => e.parentElement.hidden)"),
      [false, false, false, true, true],
    );
    const failedAgv = await evaluate(`(() => {
      document.querySelector('.agv-warning-marker').click();
      return {
        name:document.getElementById('objectInfoName').textContent,
        status:document.getElementById('objectInfoStatus').textContent,
        speed:document.getElementById('objectInfoSpeed').textContent
      };
    })()`);
    assert.deepEqual(failedAgv, {
      name: "AGV-05",
      status: "Cảnh báo: AGV dừng hoạt động",
      speed: "0.00 m/s",
    });
    const sensorPopup = await evaluate(`(() => {
      const sensor=TNG.state.environmentSensors.sensors[0];
      TNG.state.environmentSensors.select(sensor);
      return {
        shown:!document.getElementById('objectInfo').hidden,
        name:document.getElementById('objectInfoName').textContent,
        temperature:document.getElementById('objectInfoTemperature').textContent,
        humidity:document.getElementById('objectInfoHumidity').textContent
      };
    })()`);
    assert.equal(sensorPopup.shown, true);
    assert.equal(sensorPopup.name, "ENV-01");
    assert.match(sensorPopup.temperature, /^\d+\.\d °C$/);
    assert.match(sensorPopup.humidity, /^\d+%$/);
    assert.deepEqual(
      await evaluate("[...document.querySelectorAll('#objectInfoBattery, #objectInfoLoad, #objectInfoSpeed, #objectInfoTemperature, #objectInfoHumidity')].map(e => e.parentElement.hidden)"),
      [true, true, true, false, false],
    );
    assert.equal(
      await evaluate("TNG.state.environmentSensors.sensors[0].coverage.visible"),
      true,
      "Selected sensor measurement area did not appear.",
    );
    const criticalSensor = await evaluate(`(() => {
      const marker=document.querySelector('.sensor-warning-marker[data-sensor-id="ENV-06"]');
      marker.click();
      return {
        name:document.getElementById('objectInfoName').textContent,
        status:document.getElementById('objectInfoStatus').textContent
      };
    })()`);
    assert.deepEqual(criticalSensor, {
      name: "ENV-06",
      status: "Vượt ngưỡng cảnh báo",
    });
    await evaluate("document.getElementById('closeObjectInfo').click()");
    assert.equal(await evaluate("document.getElementById('objectInfo').hidden"), true);
    const differences = original.parts
      .map((p, i) =>
        JSON.stringify(p) !== JSON.stringify(current.parts[i])
          ? { index: i, before: p, after: current.parts[i] }
          : null,
      )
      .filter(Boolean);
    if (differences.length)
      console.log(
        "Mesh differences:",
        differences.slice(0, 12).map((d) => ({
          index: d.index,
          before: d.before.colors?.slice(0, 15),
          after: d.after.colors?.slice(0, 15),
          firstDifference: d.before.colors?.findIndex(
            (n, i) => n !== d.after.colors[i],
          ),
        })),
      );
    for (const d of differences) {
      const i = d.before.colors?.findIndex((n, i) => n !== d.after.colors[i]);
      if (i >= 0)
        console.log(
          "Color at",
          d.index,
          i,
          d.before.colors.slice(i, i + 6),
          d.after.colors.slice(i, i + 6),
        );
    }
    delete original.parts;
    delete current.parts;
    assert.deepEqual(
      current,
      original,
      "Scene geometry, instances, colors or layout changed.",
    );
    await evaluate("document.getElementById('tAgv').click()");
    assert.equal(await evaluate("TNG.state.agv.robots.visible"), false);
    assert.equal(await evaluate("TNG.state.agv.robotGroups[1].visible"), false);
    await evaluate("document.getElementById('tAgvRoutes').click()");
    assert.equal(await evaluate("TNG.state.agv.routes.visible"), false);
    assert.equal(await evaluate("TNG.state.agv.routeGroups[1].visible"), false);
    await evaluate(
      "document.getElementById('tAgv').click();document.getElementById('tAgvRoutes').click()",
    );
    for (const [button, visible] of [
      ["mT1", [true, false]],
      ["mT2", [false, true]],
      ["mBoth", [true, true]],
    ]) {
      const actual = await evaluate(
        `document.getElementById('${button}').click();[TNG.state.f2.f1root.visible,TNG.state.f2.f2.visible]`,
      );
      assert.deepEqual(actual, visible);
    }
    for (const button of [
      "vExt",
      "vPersp",
      "vTop",
      "tTrees",
      "tTrees",
      "tCeil2",
      "tCeil2",
      "tArea",
      "tArea",
      "mSplit",
    ]) {
      await evaluate(`document.getElementById('${button}').click()`);
    }
    await delay(2000);
    assert.ok(await evaluate("TNG.state.f2.f2.position.y>4.7"));
    await evaluate("document.getElementById('mSplit').click()");
    await delay(2000);
    // Preferences survive a reload, then reset the headless profile to defaults.
    await evaluate(
      "document.getElementById('mT2').click();document.getElementById('tAgv').click();document.getElementById('tAgvRoutes').click()",
    );
    await delay(50);
    await send("Page.reload");
    // Wait for navigation to replace the old document before reading TNG again.
    await delay(1500);
    for (let i = 0; i < 80; i++) {
      if (
        await evaluate(
          "document.readyState === 'complete' && !!window.TNG?.state?.stats2",
        )
      )
        break;
      await delay(100);
      if (i === 79) throw new Error("Preference reload timed out.");
    }
    assert.deepEqual(
      await evaluate("[TNG.state.f2.f1root.visible,TNG.state.f2.f2.visible]"),
      [false, true],
    );
    assert.equal(await evaluate("TNG.state.agv.robotGroups.every(g=>!g.visible)"), true);
    assert.equal(await evaluate("TNG.state.agv.routeGroups.every(g=>!g.visible)"), true);
    await evaluate(
      "document.getElementById('mBoth').click();document.getElementById('tAgv').click();document.getElementById('tAgvRoutes').click();document.getElementById('vPersp').click()",
    );
    await delay(50);
    assert.equal(errors.length, 0, errors.join("\n"));
    const screenshot = await send("Page.captureScreenshot", { format: "png" });
    fs.mkdirSync(path.join(root, ".tmp"), { recursive: true });
    fs.writeFileSync(
      path.join(root, ".tmp", "refactored.png"),
      Buffer.from(screenshot.data, "base64"),
    );
    console.log(
      "PASS: base scene is unchanged; AGVs, controls and saved preferences work.",
    );
    await send("Browser.close");
  } finally {
    socket?.close();
    chrome.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
