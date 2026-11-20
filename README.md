# Mô phỏng 3D nhà máy TNG Việt Đức

Dự án Next.js (App Router) dùng Three.js 0.147 để dựng mô hình hai tầng, nhà ăn, thiết bị và các tính năng tương tác.

## Chạy dự án

Yêu cầu Node.js 20 trở lên.

```powershell
npm install
npm run dev
```

Mở `http://localhost:3000`. Để kiểm tra bản production:

```powershell
npm run build
npm run start
```

## Cấu trúc theo feature

```text
src/
  app/                         Route, metadata và CSS nền của Next.js
  common/three/
    core/                      Tọa độ, texture, batch, tương tác dùng chung
    objects/                   Người, nội thất, kho, máy, xe và UI 3D dùng chung
    ui/                        React portal cho nhãn CSS2D và dấu cảnh báo
  features/
    factory-viewer/
      components/              Toolbar, danh sách khu, thông tin thiết bị, tooltip, slideshow
      hooks/                   Bố cục popup, hành vi mobile và cleanup observer
      model/                   Trạng thái giao diện và action kết nối với Three.js
    sewing-teams/
      components/              Bảng chi tiết cân bằng chuyền React
      hooks/                   Tổ đang chọn và đồng hồ sản phẩm cuối
      model/                   Tính chỉ số sản xuất và cầu nối Three.js → React
    electricity/
      components/              Bảng giám sát điện và biểu đồ React
      hooks/                   Subscription và lưu tùy chọn localStorage
      model/                   Dữ liệu mô phỏng, tính tổng và store cập nhật
    factories/
      viet-duc/
        layout/                Bố trí tầng 1, tầng 2, nhà ăn và dữ liệu bản vẽ
        simulation/            AGV, cảm biến, slideshow, điều khiển tầng...
        ui/                    Giao diện và CSS riêng của layout Việt Đức
        start.js               Điểm khởi động, thứ tự đăng ký module Three.js
        bootstrap-legacy.js   Khởi tạo mô hình và điều khiển hiện tại
public/assets/textures/       Ảnh texture phục vụ qua đường dẫn /assets/...
```

`common/three/objects` chứa các đối tượng không gắn với vị trí nhà máy cụ thể. Khi thêm layout mới, tạo `src/features/factories/<ten-layout>/` với `layout/`, `simulation/`, `ui/` và điểm khởi động riêng; tái sử dụng các đối tượng trong `common`. Không đưa tọa độ hoặc thông số chỉ đúng cho Việt Đức vào `common`.

Logic mô hình hiện tại vẫn đăng ký hàm qua `TNG` để giữ nguyên hình học và hành vi khi chuyển framework. `start.js` nạp các module theo thứ tự phụ thuộc, dùng Three.js từ npm thay vì CDN. Các module trong `common` nên dần xuất hàm trực tiếp khi phát triển layout mới.

Giao diện được dựng bằng JSX. Module mô phỏng đăng ký action hoặc cập nhật store để React
hiển thị số liệu. Vị trí tooltip và dấu cảnh báo vẫn được chiếu theo camera trong vòng render
Three.js; chỉ cập nhật vị trí và độ hiển thị của DOM anchor để tránh render React mỗi frame.
Các lệnh tạo canvas trong layout dùng để vẽ texture 3D. DOM anchor trong `SceneUiPortals.jsx`
là cầu nối bắt buộc với CSS2DRenderer; nội dung nhãn và nút cảnh báo do React portal render.

Giám sát điện dùng React Client Component `ElectricityPanel`. Store độc lập cung cấp số liệu
và trạng thái cho React thông qua `useSyncExternalStore`; cầu nối `TNG.state.electricity`
giữ API `setReading`, `selectScope`, `setCollapsed` cho hệ thống mô phỏng hiện tại.

## Kiểm tra

```powershell
npm test
npm run build
npm run start
npm run test:browser
```

`test:browser` cần Chrome headless trên Windows và server đang chạy ở cổng 3000. Có thể đặt `CHROME_PATH` nếu Chrome ở vị trí khác. Quy tắc dữ liệu mô phỏng ở [SIMULATION_RULES.md](SIMULATION_RULES.md).
