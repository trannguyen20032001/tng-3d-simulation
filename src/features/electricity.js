(function () {
  "use strict";

  TNG.features.setupElectricity = function setupElectricity(app) {
    // Demo thresholds; replace with the monitored equipment's operating limits.
    const config = { minPowerFactor: 0.9, maxTemperature: 60 };
    const readings = new Map([
      [
        "factory",
        {
          name: "Toàn nhà máy",
          shift: { peak: 168, normal: 612, offPeak: 84 },
          day: { peak: 360, normal: 960, offPeak: 240 },
          hourly: [
            10, 8, 8, 8, 10, 16, 35, 70, 112, 122, 127, 97,
            77, 112, 127, 132, 122, 112, 80, 65, 45, 30, 20, 15,
          ],
          powerFactor: 0.87,
          temperature: 62,
          simulated: true,
        },
      ],
    ]);
    let scope = "factory";
    let collapsed = false;
    const storageKey = "tng-viet-duc-3d:electricity-collapsed";
    try {
      collapsed = localStorage.getItem(storageKey) === "true";
    } catch (_) {}
    const card = document.createElement("aside");
    card.id = "electricityCard";
    card.className = "electricity-card";
    card.setAttribute("aria-label", "Giám sát điện");
    card.innerHTML = `
      <header><div><h2>Giám sát điện</h2><small class="electricity-scope"></small></div>
        <button type="button" aria-controls="electricityDetails"></button></header>
      <dl class="electricity-metrics">
        <div><dt>Điện năng trong ca</dt><dd data-metric="shift"></dd></div>
        <div><dt>Điện năng trong ngày</dt><dd data-metric="day"></dd></div>
        <div><dt>Hệ số công suất (cosφ)</dt><dd data-metric="powerFactor"></dd></div>
        <div><dt>Nhiệt độ thiết bị điện</dt><dd data-metric="temperature"></dd></div>
      </dl>
      <div id="electricityDetails">
        <figure class="electricity-chart" hidden>
          <figcaption>Điện năng tiêu thụ trong ngày <span>Demo · 24 giờ</span></figcaption>
          <svg viewBox="0 0 320 180" role="group" aria-label="Điện năng tiêu thụ từng giờ trong ngày"></svg>
          <p class="electricity-chart-detail" aria-live="polite"></p>
        </figure>
        <h3>Điện năng theo khung giờ</h3>
        <table><thead><tr><th>Khung giờ</th><th>Trong ca</th><th>Trong ngày</th></tr></thead>
          <tbody></tbody></table>
        <p class="electricity-unit">Đơn vị: kWh</p>
        <div class="electricity-alerts" role="status" aria-live="polite"></div>
        <p class="electricity-source"></p>
      </div>`;
    document.body.appendChild(card);
    const updateDashboardBounds = () => {
      document.documentElement.style.setProperty(
        "--electricity-top", `${card.getBoundingClientRect().top}px`,
      );
    };
    const dashboardObserver = new ResizeObserver(updateDashboardBounds);
    dashboardObserver.observe(card);
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) dashboardObserver.observe(toolbar);
    window.addEventListener("resize", updateDashboardBounds);
    const toggle = card.querySelector("button");
    const details = card.querySelector("#electricityDetails");
    const applyCollapsed = () => {
      details.hidden = collapsed;
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute(
        "aria-label",
        collapsed ? "Mở rộng giám sát điện" : "Thu gọn giám sát điện",
      );
      toggle.textContent = collapsed ? "▴" : "▾";
      card.classList.toggle("is-collapsed", collapsed);
    };
    toggle.onclick = () => {
      collapsed = !collapsed;
      applyCollapsed();
      try {
        localStorage.setItem(storageKey, String(collapsed));
      } catch (_) {}
    };
    const number = (value, digits = 1) =>
      Number.isFinite(value)
        ? value.toLocaleString("vi-VN", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          })
        : "—";
    const periods = [
      ["peak", "Cao điểm"],
      ["normal", "Bình thường"],
      ["offPeak", "Thấp điểm"],
    ];
    const total = (buckets) =>
      periods.reduce((sum, [key]) => sum + buckets[key], 0);
    const chart = card.querySelector(".electricity-chart");
    const chartSvg = chart.querySelector("svg");
    const chartDetail = chart.querySelector(".electricity-chart-detail");
    const hourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;
    const showHour = (event) => {
      const bar = event.target.closest("[data-hour]");
      if (!bar) return;
      const hour = Number(bar.dataset.hour);
      chartDetail.textContent =
        `${hourLabel(hour)}–${hourLabel(hour + 1)}: ${number(readings.get(scope).hourly[hour])} kWh`;
    };
    chartSvg.addEventListener("pointerover", showHour);
    chartSvg.addEventListener("focusin", showHour);
    const renderChart = (reading) => {
      const values = reading.hourly;
      chart.hidden = !Array.isArray(values) || values.length !== 24 ||
        values.some((value) => !Number.isFinite(value) || value < 0);
      if (chart.hidden) {
        chartSvg.replaceChildren();
        return;
      }
      chart.querySelector("figcaption span").textContent =
        reading.simulated ? "Demo · 24 giờ" : "24 giờ";
      const maxValue = Math.max(...values);
      const ceiling = Math.max(10, Math.ceil(maxValue / 50) * 50);
      const svgElement = (name, attributes, text) => {
        const element = document.createElementNS("http://www.w3.org/2000/svg", name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        if (text !== undefined) element.textContent = text;
        chartSvg.appendChild(element);
        return element;
      };
      chartSvg.replaceChildren();
      svgElement("text", { x: 0, y: 12 }, "kWh");
      for (let step = 0; step <= 3; step++) {
        const y = 146 - step * 40;
        svgElement("line", { x1: 32, x2: 316, y1: y, y2: y, class: "electricity-chart-grid" });
        svgElement("text", { x: 27, y: y + 3, "text-anchor": "end" }, number(ceiling * step / 3, 0));
      }
      values.forEach((value, hour) => {
        const height = value / ceiling * 120;
        const label = `${hourLabel(hour)}–${hourLabel(hour + 1)}: ${number(value)} kWh`;
        const bar = svgElement("rect", {
          x: 33 + hour * 11.75, y: 146 - height, width: 8.75, height,
          rx: 2, class: "electricity-chart-bar", "data-hour": hour,
          tabindex: 0, role: "img", "aria-label": label,
        });
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = label;
        bar.appendChild(title);
      });
      [0, 6, 12, 18, 24].forEach((hour) => {
        svgElement("text", { x: 32 + hour * 11.75, y: 164, "text-anchor": "middle" }, `${hour}h`);
      });
      chartDetail.textContent =
        `Cao nhất ${hourLabel(values.indexOf(maxValue))}: ${number(maxValue)} kWh`;
    };
    const render = () => {
      const reading = readings.get(scope);
      renderChart(reading);
      card.querySelector(".electricity-scope").textContent = reading.name;
      card.querySelector('[data-metric="shift"]').textContent =
        `${number(total(reading.shift))} kWh`;
      card.querySelector('[data-metric="day"]').textContent =
        `${number(total(reading.day))} kWh`;
      const lowPowerFactor = reading.powerFactor < config.minPowerFactor;
      const highTemperature = reading.temperature > config.maxTemperature;
      const metric = (key, value, warning, message) => {
        const element = card.querySelector(`[data-metric="${key}"]`);
        element.textContent = `${warning ? "⚠ " : ""}${value}`;
        element.classList.toggle("is-warning", warning);
        element.title = warning ? message : "";
      };
      metric(
        "powerFactor",
        number(reading.powerFactor, 2),
        lowPowerFactor,
        "Hệ số công suất thấp",
      );
      metric(
        "temperature",
        `${number(reading.temperature)} °C`,
        highTemperature,
        "Nhiệt độ vượt ngưỡng",
      );
      card.querySelector("tbody").replaceChildren(
        ...periods.map(([key, name]) => {
          const row = document.createElement("tr");
          [name, number(reading.shift[key]), number(reading.day[key])].forEach(
            (text) => {
              const cell = document.createElement("td");
              cell.textContent = text;
              row.appendChild(cell);
            },
          );
          return row;
        }),
      );
      const messages = [];
      if (lowPowerFactor)
        messages.push(
          `Hệ số công suất thấp hơn ${number(config.minPowerFactor, 2)}.`,
        );
      if (highTemperature)
        messages.push(`Nhiệt độ vượt ${number(config.maxTemperature)} °C.`);
      const alerts = card.querySelector(".electricity-alerts");
      alerts.textContent = messages.length
        ? `⚠ ${messages.join(" ")}`
        : "Các thông số trong ngưỡng cấu hình.";
      alerts.classList.toggle("is-warning", messages.length > 0);
    };
    applyCollapsed();
    render();
    app.electricity = {
      config,
      render,
      setReading(id, reading) {
        readings.set(id, reading);
        if (scope === id) render();
      },
      selectScope(id) {
        if (!readings.has(id)) return false;
        scope = id;
        render();
        return true;
      },
      get scope() {
        return scope;
      },
      get reading() {
        return readings.get(scope);
      },
    };
  };
})();
