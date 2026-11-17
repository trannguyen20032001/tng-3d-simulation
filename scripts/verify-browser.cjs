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
      const isTeamArea=${modern}&&(()=>{for(let node=o;node;node=node.parent)if(node.userData?.role==='sewing-team-interaction')return true;return false})();
      if(!o.isMesh || isAgv || isEnvironmentSensor || isAuxiliary || isTeamArea || (o.parent===parking && o.isInstancedMesh))return;
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
    if (process.argv.includes("--electricity")) {
      const checks = await evaluate(`(() => {
        const feature=TNG.state.electricity, card=document.getElementById('electricityCard');
        const toggle=card.querySelector('button'), details=card.querySelector('#electricityDetails');
        if(toggle.getAttribute('aria-expanded')==='false') toggle.click();
        const text=card.textContent;
        const initial={shift:card.querySelector('[data-metric="shift"]').textContent,
          day:card.querySelector('[data-metric="day"]').textContent,
          rows:card.querySelectorAll('tbody tr').length,
          warnings:card.querySelectorAll('.electricity-metrics .is-warning').length};
        const reading={name:'Khu thử nghiệm',shift:{peak:1,normal:2,offPeak:3},
          day:{peak:4,normal:5,offPeak:6},powerFactor:feature.config.minPowerFactor,
          temperature:feature.config.maxTemperature,simulated:true};
        feature.setReading('test',reading);
        const selected=feature.selectScope('test');
        const atBoundary=card.querySelectorAll('.electricity-metrics .is-warning').length;
        feature.setReading('test',{...reading,powerFactor:reading.powerFactor-0.01,
          temperature:reading.temperature+0.1});
        const outside=card.querySelectorAll('.electricity-metrics .is-warning').length;
        const unknown=feature.selectScope('missing');
        feature.selectScope('factory');
        toggle.click();
        const collapsed=details.hidden&&card.querySelectorAll('.electricity-metrics > div').length===4;
        const bounds=card.getBoundingClientRect();
        return {initial,selected,atBoundary,outside,unknown,collapsed,
          scope:feature.scope,oneCard:document.querySelectorAll('#electricityCard').length===1,
          bottom:innerHeight-bounds.bottom,right:innerWidth-bounds.right};
      })()`);
      assert.match(checks.initial.shift, /864/);
      assert.match(checks.initial.day, /1[.\\s]?560/);
      assert.equal(checks.initial.rows, 3);
      assert.equal(checks.initial.warnings, 2);
      assert.equal(checks.selected, true);
      assert.equal(checks.atBoundary, 0);
      assert.equal(checks.outside, 2);
      assert.equal(checks.unknown, false);
      assert.equal(checks.collapsed, true);
      assert.equal(checks.scope, "factory");
      assert.equal(checks.oneCard, true);
      assert.ok(checks.bottom>=0&&checks.bottom<30&&checks.right>=0&&checks.right<30);
      await load("index.html", true);
      assert.equal(await evaluate("document.getElementById('electricityDetails').hidden"), true);
      await evaluate("document.querySelector('#electricityCard header button').click()");
      await load("index.html", true);
      assert.equal(await evaluate("document.getElementById('electricityDetails').hidden"), false);
      assert.equal(errors.length, 0, errors.join("\n"));
      const screenshot=await send("Page.captureScreenshot", {format:"png"});
      fs.writeFileSync(path.join(root,".tmp","electricity.png"),Buffer.from(screenshot.data,"base64"));
      console.log("PASS: electricity totals, thresholds, area API, collapse persistence and layout.");
      await send("Browser.close");
      return;
    }
    if (process.argv.includes("--toolbar")) {
      await evaluate("document.getElementById('panel').classList.remove('collapsed')");
      await delay(150);
      const toolbarChecks = await evaluate(`(() => {
        const toolbar=document.querySelector('.toolbar');
        const toggle=document.getElementById('toggleToolbar');
        const body=document.getElementById('toolbarBody');
        const groups=[...toolbar.querySelectorAll('.toolbar-group')].map(g=>
          [...g.querySelectorAll('button')].map(b=>b.id));
        toggle.click();
        const collapsed=body.hidden&&toggle.getAttribute('aria-expanded')==='false';
        toggle.click();
        const expanded=!body.hidden&&toggle.getAttribute('aria-expanded')==='true';
        const bounds=toolbar.getBoundingClientRect();
        const panel=document.getElementById('panel').getBoundingClientRect();
        return {groups,collapsed,expanded,left:bounds.left,bottom:bounds.bottom,
          panelsSeparate:panel.bottom <= bounds.top - 8,
          viewportHeight:innerHeight};
      })()`);
      assert.deepEqual(toolbarChecks.groups, [
        ["vExt","vPersp","vTop"], ["mT1","mT2","mBoth"], ["mSplit","tCeil2"],
        ["tSlideshow","tSpin","tMotion"],
        ["tLabels","tFlow","tWalls","tTrees","tArea","tAgv","tAgvRoutes",
          "tEnvSensors","tSewingBalance"],
      ]);
      assert.equal(toolbarChecks.collapsed, true);
      assert.equal(toolbarChecks.expanded, true);
      assert.equal(toolbarChecks.panelsSeparate, true);
      assert.ok(toolbarChecks.left >= 0 && toolbarChecks.left < 30);
      assert.ok(Math.abs(toolbarChecks.viewportHeight-toolbarChecks.bottom-14)<2);
      for (const collapsed of [true, false]) {
        await evaluate(`(() => {
          const expected=${collapsed};
          if(document.getElementById('panel').classList.contains('collapsed')!==expected)
            document.getElementById('toggleList').click();
          if(document.querySelector('.toolbar').classList.contains('is-collapsed')!==expected)
            document.getElementById('toggleToolbar').click();
        })()`);
        await load("index.html", true);
        assert.deepEqual(await evaluate(`[
          document.getElementById('panel').classList.contains('collapsed'),
          document.querySelector('.toolbar').classList.contains('is-collapsed'),
          document.getElementById('toolbarBody').hidden,
          document.getElementById('toggleToolbar').getAttribute('aria-expanded')
        ]`), [collapsed, collapsed, collapsed, String(!collapsed)]);
      }
      assert.equal(errors.length, 0, errors.join("\n"));
      console.log("PASS: toolbar layout and both panels restore expanded/collapsed state after reload.");
      await send("Browser.close");
      return;
    }
    const picking = await evaluate(`(() => {
      const manager=TNG.state.interaction;
      const before={...manager.stats};
      manager.pickDevice(new THREE.Vector2(-10,-10));
      manager.pickDevice(new THREE.Vector2(-10,-10));
      return {raycasts:manager.stats.raycasts-before.raycasts,
        hits:manager.stats.cacheHits-before.cacheHits};
    })()`);
    assert.deepEqual(picking, { raycasts: 1, hits: 1 });
    assert.equal(await evaluate("TNG.state.sewingTeams.teams.length"), 24);
    const teamHover = await evaluate(`(() => {
      const f=TNG.state.f1, team=TNG.state.sewingTeams.teams[12];
      f.scene.updateMatrixWorld(true);
      const p=team.area.getWorldPosition(new THREE.Vector3());p.y+=0.75;p.project(f.camera);
      const c=f.renderer.domElement,b=c.getBoundingClientRect();
      c.dispatchEvent(new PointerEvent('pointermove',{clientX:b.left+(p.x+1)*b.width/2,clientY:b.top+(1-p.y)*b.height/2,pointerType:'mouse'}));
      const panel=document.querySelector('.sewing-team-panel');
      return {shown:!panel.hidden,output:panel.querySelector('.team-output').textContent};
    })()`);
    assert.equal(teamHover.shown, true);
    assert.match(teamHover.output, /^\d+\/100$/);
    const teamPoint = await evaluate(`(() => {
      const f=TNG.state.f1, team=TNG.state.sewingTeams.teams[12];
      const p=team.area.getWorldPosition(new THREE.Vector3());p.y+=0.75;p.project(f.camera);
      const b=f.renderer.domElement.getBoundingClientRect();
      return {x:b.left+(p.x+1)*b.width/2,y:b.top+(1-p.y)*b.height/2};
    })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...teamPoint });
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed", ...teamPoint, button: "left", clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased", ...teamPoint, button: "left", clickCount: 1,
    });
    const teamChecks = await evaluate(`(() => {
      const app=TNG.state, feature=app.sewingTeams, teams=feature.teams;
      const details=document.querySelector('.sewing-team-details');
      const clicked={shown:!details.hidden,name:details.querySelector('h2').textContent,
        rows:details.querySelectorAll('tbody tr').length,
        idle:details.querySelector('.team-idle-time')?.textContent,
        text:details.textContent,
        scrollable:getComputedStyle(details.querySelector('.team-details-body')).overflowY};
      feature.closeDetails();
      feature.select(teams[0]);
      const missingQuality=details.textContent.includes('Chưa có dữ liệu kiểm hàng');
      feature.closeDetails();
      const t8=teams[7],t9=teams[8];
      return {clicked,missingQuality,
        widths:[t8,t9].map(t=>+(t.maxX-t.minX).toFixed(3)),
        aisle:+(t9.minX-t8.maxX).toFixed(3),
        aligned:teams.every(t=>Math.abs(t.area.position.x-t.x)<0.001),
        highlight:teams.every(t=>t.edge.material.color.equals(new THREE.Color(0x48ff7a))),
        boundaries:[0.8499,0.85,0.9499,0.95,1.1].map(feature.getAchievementColor),
        floorColors:teams.slice(0,8).map(t=>t.floor.material.color.equals(new THREE.Color(feature.getAchievementColor(t.output/t.target)))),
        hourlyTotals:teams.every(t=>t.hourlyOutput.reduce((a,b)=>a+b,0)===t.output),
        closed:details.hidden};
    })()`);
    assert.equal(teamChecks.clicked.shown, true, "Clicking a sewing team did not open details.");
    assert.equal(teamChecks.clicked.name, "Tổ may 13");
    assert.equal(teamChecks.clicked.rows, 4);
    assert.match(teamChecks.clicked.idle, /phút .* giây/);
    assert.match(teamChecks.clicked.text, /Hiệu suất lao động/);
    assert.match(teamChecks.clicked.text, /Dự báo cuối ca/);
    assert.equal(teamChecks.clicked.scrollable, "auto");
    assert.equal(teamChecks.missingQuality, true);
    assert.deepEqual(teamChecks.widths, [3.8, 3.8]);
    assert.equal(teamChecks.aisle, 3.3);
    assert.equal(teamChecks.aligned, true);
    assert.equal(teamChecks.highlight, true);
    assert.deepEqual(teamChecks.boundaries, [0xef4444, 0xfacc15, 0xfacc15, 0x22c55e, 0x22c55e]);
    assert.equal(teamChecks.floorColors.every(Boolean), true);
    assert.equal(teamChecks.hourlyTotals, true);
    assert.equal(teamChecks.closed, true);
    const balanceToggle = await evaluate(`(() => {
      const app=TNG.state, feature=app.sewingTeams, team=feature.teams[12];
      const button=document.getElementById('tSewingBalance');
      const modelState=()=>{
        const result=[];
        app.f2.f2.traverse(object=>{
          for(let node=object;node;node=node.parent)
            if(node.userData.role==='sewing-team-interaction')return;
          result.push([object.uuid,object.visible]);
        });
        return JSON.stringify(result);
      };
      const before=modelState();
      feature.select(team);
      button.click();
      const f=app.f1,c=f.renderer.domElement,b=c.getBoundingClientRect();
      const p=team.area.getWorldPosition(new THREE.Vector3());p.y+=0.75;p.project(f.camera);
      c.dispatchEvent(new PointerEvent('pointermove',{clientX:b.left+(p.x+1)*b.width/2,clientY:b.top+(1-p.y)*b.height/2,pointerType:'mouse'}));
      const disabled={pressed:button.getAttribute('aria-pressed'),
        floorHidden:feature.teams.every(t=>!t.floor.visible),
        highlightsHidden:feature.teams.every(t=>!t.edge.visible&&t.area.material.opacity===0),
        warningsHidden:[...document.querySelectorAll('.sewing-team-warning')].every(e=>e.hidden),
        hoverHidden:document.querySelector('.sewing-team-panel').hidden,
        detailsKept:!document.querySelector('.sewing-team-details').hidden,
        modelsKept:before===modelState()};
      feature.select(team);
      const selectableWithoutHighlight=!document.querySelector('.sewing-team-details').hidden&&!team.edge.visible;
      button.click();
      const restored=button.getAttribute('aria-pressed')==='true'&&feature.teams.every(t=>t.floor.visible);
      feature.closeDetails();
      return {disabled,selectableWithoutHighlight,restored};
    })()`);
    assert.deepEqual(balanceToggle.disabled, {
      pressed: "false", floorHidden: true, highlightsHidden: true,
      warningsHidden: true, hoverHidden: true, detailsKept: true, modelsKept: true,
    });
    assert.equal(balanceToggle.selectableWithoutHighlight, true);
    assert.equal(balanceToggle.restored, true);
    await evaluate("TNG.state.sewingTeams.select(TNG.state.sewingTeams.teams[12])");
    await delay(100);
    const teamScreenshot = await send("Page.captureScreenshot", { format: "png" });
    fs.mkdirSync(path.join(root, ".tmp"), { recursive: true });
    fs.writeFileSync(path.join(root, ".tmp", "sewing-team-details.png"),
      Buffer.from(teamScreenshot.data, "base64"));
    const idleBefore = await evaluate("document.querySelector('.team-idle-time').textContent");
    let idleAfter = idleBefore;
    for (let attempt = 0; attempt < 30 && idleAfter === idleBefore; attempt++) {
      await delay(100);
      idleAfter = await evaluate("document.querySelector('.team-idle-time').textContent");
    }
    assert.notEqual(idleAfter, idleBefore, "Time since the last product did not update.");
    const teamWarnings = await evaluate(`(() => {
      const app=TNG.state, f=app.f1, teams=app.sewingTeams.teams;
      const matches=teams.every(team=>{
        const p=new THREE.Vector3(team.x,4.9,team.headZ)
          .applyMatrix4(team.area.parent.matrixWorld).project(f.camera);
        const expected=team.output/team.target<0.85&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&Math.abs(p.z)<=1;
        return document.querySelector('.sewing-team-warning[data-team-id="'+team.id+'"]').hidden!==expected;
      });
      document.querySelector('.sewing-team-warning[data-team-id="1"]').click();
      const markerSelected=document.querySelector('.sewing-team-details h2').textContent;
      app.sewingTeams.closeDetails();
      app.sewingTeams.select(teams[1]);
      app.environmentSensors.select(app.environmentSensors.sensors[0]);
      const switched=document.querySelector('.sewing-team-details').hidden;
      app.objectInfo.close();
      app.sewingTeams.select(teams[0]);
      document.getElementById('mT1').click();
      return {matches,markerSelected,switched};
    })()`);
    await delay(100);
    assert.equal(teamWarnings.matches, true);
    assert.equal(teamWarnings.markerSelected, "Tổ may 1");
    assert.equal(teamWarnings.switched, true);
    for (let attempt = 0; attempt < 30; attempt++) {
      if (await evaluate("document.querySelector('.sewing-team-details').hidden && [...document.querySelectorAll('.sewing-team-warning')].every(e=>e.hidden)")) break;
      await delay(100);
    }
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), true);
    assert.equal(await evaluate("[...document.querySelectorAll('.sewing-team-warning')].every(e=>e.hidden)"), true);
    await evaluate("document.getElementById('mBoth').click()");
    await evaluate("TNG.state.sewingTeams.clear()");
    const routeChecks = await evaluate(`(() => {
      const make = coords => TNG.core.createAgvRoute(
        coords.map(([x,z]) => new THREE.Vector3(x,0,z)));
      const sample = (route, phase, stalled=false) => {
        const p=new THREE.Vector3(), d=new THREE.Vector3();
        route.samplePhase(phase,p,d,stalled);
        return {position:p.toArray().map(n=>+n.toFixed(6)),
          direction:d.toArray().map(n=>+n.toFixed(6))};
      };
      const single=make([[2,3]]), pair=make([[0,0],[10,0]]);
      const open=make([[0,0],[10,0],[10,10],[20,10]]);
      const loop=make([[0,0],[3,0],[3,4],[0,0]]);
      const repeated=make([[0,0],[0,0],[10,0]]);
      const coincident=make([[2,3],[2,3],[2,3]]);
      return {
        single:[0,0.25,0.75].map(t=>sample(single,t)),
        pair:[0,0.25,0.5,0.75].map(t=>sample(pair,t)),
        openClosed:open.closed,
        open:[0,1/6,1/3,0.5,2/3,5/6].map(t=>sample(open,t).position),
        straight:sample(open,0.25).position,
        loopClosed:loop.closed,
        loop:[0,0.25,7/12,1].map(t=>sample(loop,t).position),
        repeated:sample(repeated,0.25).position,
        coincident:sample(coincident,0.75),
        stalled:sample(pair,0.1,true).position
      };
    })()`);
    const stationary = {position:[2,0,3],direction:[0,0,0]};
    assert.deepEqual(routeChecks.single, [stationary,stationary,stationary]);
    assert.deepEqual(routeChecks.pair.map(s=>s.position),
      [[0,0,0],[5,0,0],[10,0,0],[5,0,0]]);
    assert.deepEqual(routeChecks.pair[1].direction, [1,0,0]);
    assert.deepEqual(routeChecks.pair[3].direction, [-1,0,0]);
    assert.equal(routeChecks.openClosed, false);
    assert.deepEqual(routeChecks.open,
      [[0,0,0],[10,0,0],[10,0,10],[20,0,10],[10,0,10],[10,0,0]]);
    assert.deepEqual(routeChecks.straight, [10,0,5]);
    assert.equal(routeChecks.loopClosed, true);
    assert.deepEqual(routeChecks.loop, [[0,0,0],[3,0,0],[3,0,4],[0,0,0]]);
    assert.deepEqual(routeChecks.repeated, [5,0,0]);
    assert.deepEqual(routeChecks.coincident, stationary);
    assert.deepEqual(routeChecks.stalled, [5,0,0]);
    console.log("PASS: AGV straight routes, return trips, loops and stationary routes.");
    const agvStart = await evaluate(`({
      robots:TNG.state.agv.agents.length,
      robotVisible:TNG.state.agv.robots.visible,
      routesVisible:TNG.state.agv.routes.visible,
      position:TNG.state.agv.agents[0].robot.position.toArray()
    })`);
    assert.ok(agvStart.robots > 0);
    assert.equal(agvStart.robots, await evaluate(
      "TNG.state.agv.robotGroups.reduce((total,group)=>total+group.children.length,0)",
    ));
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
      name: await evaluate("TNG.state.agv.agents.find(agent=>agent.stalled).id"),
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
    assert.equal(criticalSensor.name, "ENV-06");
    assert.match(
      criticalSensor.status,
      /Hoạt động bình thường|Gần ngưỡng cảnh báo|Vượt ngưỡng cảnh báo/,
    );
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
    // Pallet frames and their four levels now fit under the 4.3 m slab.
    // Only the five instanced batches used by pallet racks may change transforms.
    assert.deepEqual(differences.map((difference) => difference.index),
      [1255, 1256, 1258, 1270, 1281]);
    for (const difference of differences) {
      assert.equal(difference.before.geometryHash, difference.after.geometryHash);
      assert.equal(difference.before.type, difference.after.type);
      assert.equal(difference.before.count, difference.after.count);
      assert.deepEqual(difference.before.colors, difference.after.colors);
    }
    current.hash = original.hash;
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
    await evaluate("document.getElementById('mBoth').click()");
    await delay(250);
    assert.equal(await evaluate("TNG.state.f1.labelGroup.children.filter(c=>c.userData.interiorLabel).every(c=>!c.visible)"), true);
    await evaluate("document.getElementById('mT1').click()");
    await delay(250);
    assert.equal(await evaluate("TNG.state.f1.labelGroup.children.filter(c=>c.userData.interiorLabel).every(c=>c.visible===TNG.state.f1.labelGroup.visible)"), true);
    await evaluate("document.getElementById('mBoth').click()");
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
    const slideshowChecks = await evaluate(`(() => {
      const app=TNG.state, show=app.slideshow, button=document.getElementById('tSlideshow');
      const targets=show.buildQueue();
      const delays=[], visited=[], panels=[], floors=[];
      const originalTimeout=window.setTimeout;
      let scheduled;
      window.setTimeout=(callback,ms,...args)=>{
        if(ms===show.durationMs) {scheduled=callback;delays.push(ms);}
        return originalTimeout(callback,ms,...args);
      };
      let timerAdvanced, repeated, stopped, manualStopped, defaultOff;
      try {
        defaultOff=!show.running && button.getAttribute('aria-pressed')==='false';
        button.click();
        for(let i=0;i<targets.length;i++) {
          const current=show.current;
          visited.push(current.id);
          const panel=current.kind==='area' ? '.slideshow-area-details' :
            current.kind==='team' ? '.sewing-team-details' : '#objectInfo';
          panels.push(!document.querySelector(panel).hidden);
          floors.push(current.floor==='Tầng 1' ? app.f2.f1root.visible&&!app.f2.f2.visible :
            app.f2.f2.visible&&!app.f2.f1root.visible);
          if(i===0) {scheduled();timerAdvanced=show.current.id===targets[1].id;}
          else show.next();
        }
        repeated=show.current.id===show.buildQueue()[0].id;
        button.click();
        stopped=!show.running&&button.getAttribute('aria-pressed')==='false';
        show.start();
        app.f1.renderer.domElement.dispatchEvent(new WheelEvent('wheel',{deltaY:1}));
        manualStopped=!show.running;
      } finally {
        show.stop();
        window.setTimeout=originalTimeout;
        app.objectInfo.close();app.sewingTeams.closeDetails();
        document.getElementById('mBoth').click();
      }
      return {defaultOff,sorted:targets.every((t,i)=>!i||targets[i-1].priority<=t.priority),
        kinds:[...new Set(targets.map(t=>t.kind))].sort(),
        count:targets.length,unique:new Set(visited).size,
        visitedAll:visited.join()===targets.map(t=>t.id).join(),
        panels:panels.every(Boolean),floors:floors.every(Boolean),
        timerAdvanced,repeated,stopped,manualStopped,
        duration:show.durationMs,
        orbitSpeed:show.orbitRadiansPerSecond,
        delays:delays.every(ms=>ms===show.durationMs)&&delays.length>=targets.length};
    })()`);
    assert.equal(slideshowChecks.defaultOff, true);
    assert.ok(slideshowChecks.duration > 0);
    assert.ok(slideshowChecks.orbitSpeed > 0);
    assert.equal(slideshowChecks.sorted, true);
    assert.deepEqual(slideshowChecks.kinds, ["agv","area","sensor","team"]);
    assert.equal(slideshowChecks.count, slideshowChecks.unique);
    for (const check of ["visitedAll","panels","floors","timerAdvanced","repeated",
      "stopped","manualStopped","delays"]) assert.equal(slideshowChecks[check], true, check);
    await evaluate(`(() => {
      window.__orbitTimeout=window.setTimeout;
      window.setTimeout=(callback,ms,...args)=>window.__orbitTimeout(
        callback,ms===TNG.state.slideshow.durationMs?60000:ms,...args);
      TNG.state.slideshow.start();
    })()`);
    await delay(4500);
    const orbitStart = await evaluate("TNG.state.f1.camera.position.toArray()");
    const effectStart = await evaluate(`(() => {
      const f=TNG.state.f1, h=f.scene.getObjectByName('Slideshow highlight');
      return {radius:f.camera.position.distanceTo(f.controls.target),
        visible:h.visible,opacity:h.material.opacity};
    })()`);
    await delay(250);
    const orbitEnd = await evaluate("TNG.state.f1.camera.position.toArray()");
    const effectEnd = await evaluate(`(() => {
      const f=TNG.state.f1, h=f.scene.getObjectByName('Slideshow highlight');
      return {radius:f.camera.position.distanceTo(f.controls.target),opacity:h.material.opacity};
    })()`);
    await evaluate("TNG.state.slideshow.stop();window.setTimeout=window.__orbitTimeout;document.getElementById('mBoth').click()");
    assert.notDeepEqual(orbitEnd, orbitStart, "Slideshow camera did not orbit after focus.");
    assert.ok(Math.abs(effectStart.radius - Math.sqrt(325) * 0.88) < 0.15,
      `Slideshow zoom did not settle at 88% of the focus distance: ${effectStart.radius}`);
    assert.ok(Math.abs(effectEnd.radius - effectStart.radius) < 0.05,
      "Orbit changed the camera distance.");
    assert.equal(effectStart.visible, true);
    assert.notEqual(effectStart.opacity, effectEnd.opacity);
    assert.equal(await evaluate(
      "TNG.state.f1.scene.getObjectByName('Slideshow highlight').visible"), false);
    console.log("PASS: slideshow priorities, timer, orbit, popups, floors, loop and stop.");
    // Preferences survive a reload, then reset the headless profile to defaults.
    await evaluate(
      "if(document.getElementById('mSplit').getAttribute('aria-pressed')!=='true')document.getElementById('mSplit').click()",
    );
    await evaluate(
      "document.getElementById('mT2').click();document.getElementById('tAgv').click();document.getElementById('tAgvRoutes').click();document.getElementById('tSewingBalance').click()",
    );
    await delay(50);
    await evaluate("window.__verificationBeforeReload = true");
    await send("Page.reload");
    // Wait for navigation to replace the old document before reading TNG again.
    await delay(1500);
    for (let i = 0; i < 80; i++) {
      if (
        await evaluate(
          "!window.__verificationBeforeReload && document.readyState === 'complete' && !!window.TNG?.state?.stats2",
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
    assert.equal(await evaluate("document.getElementById('mSplit').getAttribute('aria-pressed')"), "true");
    await evaluate("document.getElementById('mSplit').click()");
    assert.equal(await evaluate("TNG.state.agv.routeGroups.every(g=>!g.visible)"), true);
    assert.equal(await evaluate("document.getElementById('tSewingBalance').getAttribute('aria-pressed')"), "false");
    assert.equal(await evaluate("TNG.state.sewingTeams.teams.every(t=>!t.floor.visible)"), true);
    await evaluate(
      "document.getElementById('mBoth').click();document.getElementById('tAgv').click();document.getElementById('tAgvRoutes').click();document.getElementById('tSewingBalance').click();document.getElementById('vPersp').click()",
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
