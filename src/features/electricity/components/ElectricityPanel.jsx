"use client";

import { useEffect, useRef } from "react";

import { useElectricity } from "../hooks/useElectricity";
import { ELECTRICITY_PERIODS, formatNumber, totalEnergy } from "../model/electricity-store";
import ElectricityChart from "./ElectricityChart";

export default function ElectricityPanel() {
  const { reading, scope, collapsed, config, setCollapsed } = useElectricity();
  const cardRef = useRef(null);
  const lowPowerFactor = reading.powerFactor < config.minPowerFactor;
  const highTemperature = reading.temperature > config.maxTemperature;
  const messages = [];
  if (lowPowerFactor) {
    messages.push(`Hệ số công suất thấp hơn ${formatNumber(config.minPowerFactor, 2)}.`);
  }
  if (highTemperature) {
    messages.push(`Nhiệt độ vượt ${formatNumber(config.maxTemperature)} °C.`);
  }

  useEffect(() => {
    const updateBounds = () => {
      document.documentElement.style.setProperty(
        "--electricity-top",
        `${cardRef.current.getBoundingClientRect().top}px`
      );
    };
    const observer = new ResizeObserver(updateBounds);
    observer.observe(cardRef.current);
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) observer.observe(toolbar);
    window.addEventListener("resize", updateBounds);
    updateBounds();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
      document.documentElement.style.removeProperty("--electricity-top");
    };
  }, []);

  return (
    <aside
      ref={cardRef}
      id="electricityCard"
      className={`electricity-card${collapsed ? " is-collapsed" : ""}`}
      aria-label="Giám sát điện"
    >
      <header>
        <button
          type="button"
          aria-controls="electricityDetails"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Mở rộng giám sát điện" : "Thu gọn giám sát điện"}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div>
            <span className="electricity-title">Giám sát điện</span>
            <small className="electricity-scope">{reading.name}</small>
          </div>
          <span className="electricity-toggle-icon" aria-hidden="true">▾</span>
        </button>
      </header>
      <dl className="electricity-metrics" hidden={collapsed}>
        <div>
          <dt>Điện năng trong ca</dt>
          <dd data-metric="shift">{formatNumber(totalEnergy(reading.shift))} kWh</dd>
        </div>
        <div>
          <dt>Điện năng trong ngày</dt>
          <dd data-metric="day">{formatNumber(totalEnergy(reading.day))} kWh</dd>
        </div>
        <div>
          <dt>Hệ số công suất (cosφ)</dt>
          <dd
            data-metric="powerFactor"
            className={lowPowerFactor ? "is-warning" : ""}
            title={lowPowerFactor ? "Hệ số công suất thấp" : ""}
          >
            {lowPowerFactor ? "⚠ " : ""}{formatNumber(reading.powerFactor, 2)}
          </dd>
        </div>
        <div>
          <dt>Nhiệt độ thiết bị điện</dt>
          <dd
            data-metric="temperature"
            className={highTemperature ? "is-warning" : ""}
            title={highTemperature ? "Nhiệt độ vượt ngưỡng" : ""}
          >
            {highTemperature ? "⚠ " : ""}{formatNumber(reading.temperature)} °C
          </dd>
        </div>
      </dl>
      <div id="electricityDetails" hidden={collapsed}>
        <ElectricityChart key={scope} reading={reading} />
        <h3>Điện năng theo khung giờ</h3>
        <table>
          <thead><tr><th>Khung giờ</th><th>Trong ca</th><th>Trong ngày</th></tr></thead>
          <tbody>
            {ELECTRICITY_PERIODS.map(([key, name]) => (
              <tr key={key}>
                <td>{name}</td>
                <td>{formatNumber(reading.shift[key])}</td>
                <td>{formatNumber(reading.day[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="electricity-unit">Đơn vị: kWh</p>
        <div
          className={`electricity-alerts${messages.length ? " is-warning" : ""}`}
          role="status"
          aria-live="polite"
        >
          {messages.length ? `⚠ ${messages.join(" ")}` : "Các thông số trong ngưỡng cấu hình."}
        </div>
      </div>
    </aside>
  );
}
