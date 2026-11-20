"use client";

import { useSewingTeamDetails } from "../hooks/useSewingTeamDetails";
import { getProductionMetrics, percent } from "../model/sewing-team-store";

function ProductionDetails({ team, idleSeconds, isStopped }) {
  const { bottleneck, ratio, efficiency, actualTakt, requiredTakt, forecast } =
    getProductionMetrics(team);
  const metrics = [
    ["Mã hàng", team.styleCode],
    ["Số lao động", `${team.workers} người`],
    ["Mục tiêu / thực tế", `${team.target} / ${team.output} SP`],
    ["Tỷ lệ hoàn thành", percent(ratio)],
    ["Hiệu suất lao động", percent(efficiency)],
    ["Công đoạn nghẽn", `${bottleneck.name} (${bottleneck.output} SP)`],
    ["Từ sản phẩm cuối", (
      <span className="team-idle-time">
        {Math.floor(idleSeconds / 60)} phút {idleSeconds % 60} giây
      </span>
    )],
    ["Trạng thái máy", (
      <span className="team-machine-state">
        {isStopped ? "Dừng (không có sản phẩm mới)" : "Đang chạy"}
      </span>
    )],
    ["Nhịp thực tế / yêu cầu", `${actualTakt.toFixed(1)} / ${requiredTakt.toFixed(1)} giây/SP`],
    ["Dự báo cuối ca 8 giờ", `${forecast} SP`],
    ["Tỷ lệ lỗi", team.quality
      ? `${percent(team.quality.defects / team.quality.inspected)} (${team.quality.defects}/${team.quality.inspected} SP kiểm)`
      : "Chưa có dữ liệu kiểm hàng"],
  ];

  return (
    <>
      <div className="team-achievement">
        {team.output} / {team.target}
        <small>Sản lượng lũy kế / mục tiêu hiện tại · {percent(ratio)}</small>
      </div>
      <dl>
        {metrics.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <h3>Sản lượng từng công đoạn</h3>
      <table>
        <thead>
          <tr><th>Công đoạn / thiết bị</th><th>Thực tế / KH</th><th>Δ so với trước</th></tr>
        </thead>
        <tbody>
          {team.operations.map((operation, index) => {
            const delta = index ? operation.output - team.operations[index - 1].output : null;
            return (
              <tr key={operation.device} className={operation === bottleneck ? "is-bottleneck" : ""}>
                <td>{operation.name}<small>{operation.device}</small></td>
                <td>{operation.output} / {operation.target}</td>
                <td>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta} SP`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="team-note">Δ = sản lượng công đoạn này − công đoạn liền trước.</p>
      <h3>Sản lượng theo giờ</h3>
      <div className="team-hourly">
        {team.hourlyOutput.map((output, index) => (
          <span key={index}>Giờ {index + 1}<b>{output} SP</b></span>
        ))}
      </div>
    </>
  );
}

export default function SewingTeamDetails() {
  const { team, idleSeconds, isStopped, closeDetails } = useSewingTeamDetails();

  return (
    <section className="object-info sewing-team-details" aria-label="Chi tiết tổ may" hidden={!team}>
      <header>
        <div><p>CÂN BẰNG CHUYỀN</p><h2>{team?.name}</h2></div>
        <button type="button" aria-label="Đóng chi tiết tổ may" onClick={closeDetails}>×</button>
      </header>
      <div className="team-details-body">
        {team && <ProductionDetails team={team} idleSeconds={idleSeconds} isStopped={isStopped} />}
      </div>
    </section>
  );
}
