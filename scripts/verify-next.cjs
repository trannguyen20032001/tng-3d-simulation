const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

const port = 9439;
const chrome = spawn(
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(__dirname, "..", ".tmp", "chrome-next")}`,
    "--enable-unsafe-swiftshader",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pending = new Map();
const errors = [];
let socket;
let nextId = 0;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

(async () => {
  try {
    let tabs;
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        break;
      } catch {
        await delay(250);
      }
    }
    assert.ok(tabs?.length, "Chrome did not start");
    socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        errors.push(message.params.args.map((argument) => argument.value || argument.description).join(" "));
      }
    };
    await send("Runtime.enable");
    await send("Page.enable");
    await send("Page.navigate", { url: process.env.TEST_URL || "http://localhost:3000" });
    let ready = false;
    for (let attempt = 0; attempt < 180; attempt++) {
      ready = await evaluate("!!window.TNG?.state?.stats2");
      if (ready || errors.length) break;
      await delay(250);
    }
    assert.equal(errors.length, 0, errors.join("\n"));
    assert.ok(ready, "Factory did not initialize");
    assert.ok(await evaluate("document.querySelector('#stage canvas') !== null"));
    assert.ok(await evaluate("document.querySelectorAll('#zones li').length > 0"));
    assert.ok(await evaluate("document.getElementById('mT2') !== null"));
    await evaluate("document.getElementById('mT2').click()");
    assert.equal(await evaluate("document.getElementById('mT2').getAttribute('aria-pressed')"), "true");
    await evaluate("document.getElementById('mBoth').click()");
    assert.equal(await evaluate("document.getElementById('mBoth').getAttribute('aria-pressed')"), "true");
    assert.equal(await evaluate("document.querySelectorAll('.toolbar-group').length"), 5);
    assert.ok(await evaluate("document.querySelectorAll('#stage .lbl').length > 10"));
    assert.ok(await evaluate("document.querySelectorAll('.warning-marker').length > 0"));
    await evaluate("document.querySelector('#zones button:not(#z-all)').click()");
    await delay(200);
    assert.equal(await evaluate("document.querySelectorAll('#zones button.on').length"), 1);
    assert.equal(await evaluate("document.getElementById('mT1').getAttribute('aria-pressed')"), "true");
    await evaluate("document.getElementById('mBoth').click()");
    await evaluate("TNG.state.agv.select(TNG.state.agv.agents[0])");
    await delay(200);
    assert.equal(await evaluate("document.getElementById('objectInfo').hidden"), false);
    assert.equal(await evaluate("document.getElementById('objectInfoName').textContent"), "AGV-01");
    assert.equal(await evaluate("document.getElementById('objectInfoTemperature').parentElement.hidden"), true);
    await evaluate("TNG.state.environmentSensors.select(TNG.state.environmentSensors.sensors[0])");
    await delay(200);
    assert.equal(await evaluate("document.getElementById('objectInfoName').textContent"), "ENV-01");
    assert.equal(await evaluate("document.getElementById('objectInfoBattery').parentElement.hidden"), true);
    assert.equal(await evaluate("document.getElementById('objectInfoTemperature').parentElement.hidden"), false);
    await evaluate("document.getElementById('closeObjectInfo').click()");
    await delay(200);
    assert.equal(await evaluate("document.getElementById('objectInfo').hidden"), true);
    await evaluate("document.querySelector('.agv-warning-marker').click()");
    await delay(200);
    assert.equal(await evaluate("document.getElementById('objectInfo').hidden"), false);
    assert.match(await evaluate("document.getElementById('objectInfoStatus').textContent"), /dừng/);
    await evaluate("TNG.state.objectInfo.close(); TNG.state.slideshow.buildQueue().find(target => target.kind === 'area').activate()");
    await delay(200);
    assert.equal(await evaluate("document.querySelector('.slideshow-area-details').hidden"), false);
    assert.ok(await evaluate("document.querySelector('.slideshow-area-details h2').textContent.length > 0"));
    await evaluate("document.querySelector('.slideshow-area-details header button').click()");
    await delay(200);
    assert.equal(await evaluate("document.querySelector('.slideshow-area-details').hidden"), true);
    await evaluate("TNG.state.slideshow.start()");
    assert.equal(await evaluate("document.getElementById('tSlideshow').getAttribute('aria-pressed')"), "true");
    await evaluate("TNG.state.slideshow.stop(); TNG.state.objectInfo.close(); document.getElementById('mBoth').click()");
    await evaluate("TNG.state.sewingTeams.select(TNG.state.sewingTeams.teams[0])");
    await delay(300);
    assert.equal(await evaluate("document.querySelectorAll('.sewing-team-details').length"), 1);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), false);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details h2').textContent === TNG.state.sewingTeams.teams[0].name"), true);
    assert.equal(await evaluate("document.querySelectorAll('.sewing-team-details tbody tr').length"), 4);
    assert.equal(await evaluate("document.querySelectorAll('.sewing-team-details .is-bottleneck').length"), 1);
    assert.equal(await evaluate("TNG.state.sewingTeams.teams[0].edge.visible"), true);
    assert.match(await evaluate("document.querySelector('.team-machine-state').textContent"), /Dừng/);
    const idleBefore = await evaluate("document.querySelector('.team-idle-time').textContent");
    await delay(1200);
    assert.notEqual(await evaluate("document.querySelector('.team-idle-time').textContent"), idleBefore);
    await evaluate("document.querySelector('.sewing-team-details header button').click()");
    await delay(300);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), true);
    assert.equal(await evaluate("TNG.state.sewingTeams.teams[0].edge.visible"), false);
    await evaluate("TNG.state.sewingTeams.select(TNG.state.sewingTeams.teams[1])");
    await delay(300);
    assert.equal(await evaluate("document.querySelector('.team-machine-state').textContent"), "Đang chạy");
    await evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
    await delay(300);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), true);
    await evaluate("TNG.state.sewingTeams.select(TNG.state.sewingTeams.teams[0]); document.getElementById('mT1').click()");
    await delay(500);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), true);
    await evaluate("document.getElementById('mBoth').click()");
    await evaluate("TNG.state.electricity.setCollapsed(false)");
    await delay(150);
    assert.equal(await evaluate("document.querySelectorAll('#electricityCard').length"), 1);
    assert.equal(await evaluate("document.querySelectorAll('.electricity-chart-bar').length"), 24);
    assert.equal(await evaluate("document.querySelector('[data-metric=shift]').textContent"), "864,0 kWh");
    await evaluate("document.querySelectorAll('.electricity-chart-bar')[8].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))");
    await delay(500);
    assert.match(await evaluate("document.querySelector('.electricity-chart-detail').textContent"), /08:00–09:00/);
    await evaluate(`TNG.state.electricity.setReading('test', {
      ...TNG.state.electricity.reading, name: 'Khu thử nghiệm',
      powerFactor: 0.9, temperature: 60
    }); TNG.state.electricity.selectScope('test')`);
    await delay(150);
    assert.equal(await evaluate("document.querySelector('.electricity-scope').textContent"), "Khu thử nghiệm");
    assert.equal(await evaluate("document.querySelectorAll('.electricity-metrics .is-warning').length"), 0);
    await evaluate("document.querySelector('#electricityCard header button').click()");
    await delay(150);
    assert.equal(await evaluate("document.getElementById('electricityDetails').hidden"), true);
    assert.equal(await evaluate("localStorage.getItem('tng-viet-duc-3d:electricity-collapsed')"), "true");
    await evaluate("document.querySelector('#electricityCard header button').click()");
    await delay(150);
    assert.equal(await evaluate("document.getElementById('electricityDetails').hidden"), false);
    await evaluate("TNG.state.electricity.selectScope('factory')");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390, height: 844, deviceScaleFactor: 1, mobile: true,
    });
    await evaluate("TNG.state.electricity.setCollapsed(true)");
    await delay(300);
    await evaluate("document.querySelector('#electricityCard header button').click()");
    await delay(500);
    assert.equal(await evaluate("document.getElementById('electricityDetails').hidden"), false);
    assert.equal(await evaluate("document.querySelector('.toolbar').classList.contains('is-collapsed')"), true);
    await evaluate("document.getElementById('toggleToolbar').click()");
    await delay(500);
    assert.equal(await evaluate("document.getElementById('electricityDetails').hidden"), true);
    await evaluate("TNG.state.sewingTeams.select(TNG.state.sewingTeams.teams[0])");
    await delay(500);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), false);
    assert.equal(await evaluate("document.querySelector('.toolbar').classList.contains('is-collapsed')"), true);
    await evaluate("document.querySelector('#electricityCard header button').click()");
    await delay(500);
    assert.equal(await evaluate("document.querySelector('.sewing-team-details').hidden"), true);
    assert.equal(errors.length, 0, errors.join("\n"));
    await evaluate("document.getElementById('mT2').click(); if (document.getElementById('tFlow').getAttribute('aria-pressed') === 'true') document.getElementById('tFlow').click()");
    await delay(300);
    await send("Page.navigate", { url: process.env.TEST_URL || "http://localhost:3000" });
    for (let attempt = 0; attempt < 180; attempt++) {
      if (await evaluate("!!window.TNG?.state?.slideshow && document.getElementById('loading').hidden")) break;
      await delay(250);
    }
    assert.equal(await evaluate("document.getElementById('mT2').getAttribute('aria-pressed')"), "true");
    assert.equal(await evaluate("document.getElementById('tFlow').getAttribute('aria-pressed')"), "false");
    assert.equal(errors.length, 0, errors.join("\n"));
    console.log("React viewer, scene labels, warnings, slideshow, sewing and electricity checks passed.");
  } finally {
    socket?.close();
    chrome.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
