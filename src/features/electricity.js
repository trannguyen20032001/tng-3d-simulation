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
        <h3>Điện năng theo khung giờ</h3>
        <table><thead><tr><th>Khung giờ</th><th>Trong ca</th><th>Trong ngày</th></tr></thead>
          <tbody></tbody></table>
        <p class="electricity-unit">Đơn vị: kWh</p>
        <div class="electricity-alerts" role="status" aria-live="polite"></div>
        <p class="electricity-source"></p>
      </div>`;
    document.body.appendChild(card);
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
    const render = () => {
      const reading = readings.get(scope);
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
      card.querySelector(".electricity-source").textContent = reading.simulated
        ? "Dữ liệu mô phỏng · Chưa kết nối công tơ. Phân nhóm khung giờ từ dữ liệu cấu hình."
        : "Điện năng tổng được tính từ ba nhóm khung giờ.";
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
