# Mô hình 3D nhà máy TNG Việt Đức

Mở `index.html` bằng trình duyệt. Khi sao chép dự án, cần mang theo cả thư mục `src` và `assets`.

Ứng dụng dùng JavaScript thuần và Three.js 0.147.0. Không cần cài npm hoặc chạy build. Three.js và font chữ vẫn tải từ CDN như bản gốc nên cần kết nối Internet.

## Cấu trúc

```text
index.html                         Giao diện và thứ tự tải script
assets/textures/                   Ảnh JPEG tách từ base64
src/
  main.js                          Khởi tạo tầng 1 rồi tầng 2
  core/
    app.js                         Registry TNG và trạng thái ứng dụng
    coordinates.js                 Đổi tọa độ mm → mét, cấu hình chiều Z
    random.js                      Random có seed riêng cho từng tầng
    textures.js                    Nạp texture từ assets
    instance-batch.js              Bộ gom hình khối và dựng InstancedMesh
    static-batch.js                Gộp mesh tĩnh, giữ các nhóm điều khiển
  components/
    people/                        Người đứng, công nhân ngồi
    furniture/                     Bàn, ghế, ghế đẩu, bộ sofa
    storage/                       Kệ pallet, kệ thường, kệ phụ liệu,
                                   thùng hàng và xe đẩy
    machines/                      Bàn cắt và máy cắt kèm theo
    outdoor/                       Ô tô, xe tải, xe nâng và đèn đường
  areas/
    floor-1/build.js                Bố trí và dựng tầng 1, cảnh sân xưởng,
                                   camera và vòng lặp render
    floor-2/build.js                Bố trí và dựng tầng 2, khu văn phòng
    floor-2/data/                  Dữ liệu bản vẽ: d.js, w2.js, t3.js
    canteen/build.js                Dựng nhà ăn hai tầng, bãi xe và mái
    canteen/data/cseg.js            Dữ liệu bản vẽ nhà ăn
  features/floor-controls.js        Chế độ tầng, tách tầng, đồng bộ nhãn,
                                   luồng hàng và nút diện tích
  styles/                          CSS cơ bản và giao diện
scripts/
  source-manifest.json             Danh sách script theo thứ tự tải
  verify-browser.cjs               Kiểm tra hồi quy bằng Chrome headless
backups/original.html               Bản HTML trước khi tách mã
```

## Sửa mô hình ở đâu?

| Muốn sửa | File |
| --- | --- |
| Hình dáng người đứng | `src/components/people/standing-person.js` |
| Hình dáng công nhân ngồi | `src/components/people/seated-worker.js` |
| Mặt bàn, chân bàn | `src/components/furniture/table.js` |
| Ghế có tựa | `src/components/furniture/chair.js` |
| Ghế đẩu dùng cho công nhân và chân ghế có tựa | `src/components/furniture/stool.js` |
| Bộ sofa tiếp khách | `src/components/furniture/sofa-set.js` |
| Kệ kho nguyên liệu, thành phẩm | `src/components/storage/pallet-rack.js` |
| Vị trí đồ vật tầng 1 | `src/areas/floor-1/build.js` |
| Vị trí đồ vật tầng 2 | `src/areas/floor-2/build.js` và `src/areas/floor-2/data/` |
| Cách ẩn/hiện hoặc nâng tầng | `src/features/floor-controls.js` |

Component nhận rõ những hàm và bảng màu cần dùng qua tham số. Ví dụ dùng lại bàn trong một khu vực khác:

```js
const batch = TNG.core.createInstanceBatch();
const tableAt = TNG.components.tableAt({
  box: batch.box,
  C: {leg: 0x1c1f23}
});

// Tâm x,z; chiều rộng, chiều sâu; cao độ tâm mặt bàn; màu mặt bàn.
// Kích thước và vị trí ở đây đều tính bằng mét, trong nhóm của khu vực.
tableAt(2, 3, 1.4, 0.7, 0.75, 0xa97c4e);

batch.build(areaGroup, {
  top: {r: 0.55},
  leg: {r: 0.4, m: 0.2}
});
```

Mỗi khu vực có batch riêng để ẩn/hiện và di chuyển độc lập. Tạo đồ vật trước, gọi `batch.build()` sau khi thêm xong. Bàn cắt và bàn ăn kính có cấu tạo riêng nên vẫn giữ các mô hình chuyên dụng.

`TNG.state` thay các biến `window.__f1`, `window.__f2`, `window.__cant2`… Các hàm dựng tầng và nhà ăn nhận trạng thái này qua tham số. Các script cổ điển được dùng có chủ ý để tiếp tục mở qua `file://`; khi thêm file cần khai báo trong cả hai HTML và `source-manifest.json`.

## Kiểm tra

```powershell
node scripts/verify-browser.cjs
```

Script kiểm tra cú pháp, đường dẫn tài nguyên và so sánh hình học, tọa độ, màu, số instance với bản gốc; sau đó thử các nút tầng, tách tầng, góc nhìn, cây, trần và diện tích. Cần Chrome trên Windows; có thể cấu hình vị trí trình duyệt bằng biến `CHROME_PATH`.

Sáu nhóm instance xe máy trong bãi xe được loại khỏi phép so sánh chính xác vì bản gốc dùng `Math.random()` để chọn vị trí trống và màu xe. Logic đó được giữ nguyên. Ảnh chụp kiểm tra được lưu vào `.tmp/refactored.png`.
