# Quy tắc hoạt động mô phỏng 3D

Tài liệu này mô tả hành vi tương tác hiện có trong mô phỏng nhà máy 3D.

## Camera và đối tượng được chọn

- Khi chọn một AGV, camera di chuyển đến vị trí AGV và bám theo xe khi xe di chuyển.
- Khi chọn một cảm biến môi trường, camera di chuyển đến vị trí cảm biến và bám theo cảm biến đó.
- Đóng popup thông tin sẽ dừng việc bám theo đối tượng.
- Chọn một góc nhìn có sẵn như `Ngoại cảnh`, `Bên trong` hoặc `Mặt bằng` cũng dừng việc bám theo.
- Nếu đối tượng đang được chọn bị ẩn do thay đổi tầng hoặc tắt nhóm đối tượng, popup đóng và camera dừng bám theo.

## Quy tắc AGV

### Chọn AGV

Khi bấm vào AGV, popup thông tin hiển thị:

- Tầng
- Trạng thái
- Pin
- Hàng đang tải
- Tốc độ

Popup AGV không hiển thị nhiệt độ hoặc độ ẩm.

### Hover AGV

Khi rê chuột vào một AGV, panel nổi xuất hiện phía trên xe và đi theo xe. Panel gồm:

- Mã AGV
- Trạng thái hoạt động hoặc cảnh báo
- Nhiệm vụ hiện tại

Panel tồn tại tối đa 15 giây kể từ lúc hover. Sau thời gian này, panel tự ẩn.

- Hover sang AGV khác: panel cũ đóng, panel của AGV mới xuất hiện và bắt đầu lại 15 giây.
- Hover sang cảm biến: panel AGV đóng.
- Bấm chuột, cuộn chuột hoặc dùng bàn phím: panel AGV đóng.
- Rời canvas không làm panel biến mất ngay; panel vẫn hiển thị cho đến khi hết 15 giây hoặc có tương tác khác.

### AGV gặp lỗi

AGV có nhiệm vụ `Vận chuyển hàng bị chết giữa đường` được coi là xe gặp lỗi.

- Xe dừng ở giữa tuyến và có tốc độ `0.00 m/s`.
- Trạng thái trong popup là `Cảnh báo: AGV dừng hoạt động`.
- Phía trên xe có dấu chấm than đỏ nhấp nháy.
- Dấu chấm than là nút tương tác. Bấm vào dấu này sẽ chọn AGV gặp lỗi, mở popup và đưa camera đến xe.

## Quy tắc cảm biến môi trường

### Chọn cảm biến

Khi bấm vào cảm biến, popup thông tin hiển thị:

- Tầng
- Trạng thái theo ngưỡng cảnh báo
- Nhiệt độ
- Độ ẩm

Popup cảm biến không hiển thị pin, hàng đang tải hoặc tốc độ.

### Hover cảm biến

Khi rê chuột vào cảm biến, panel nổi xuất hiện phía trên cảm biến. Panel gồm:

- Mã cảm biến
- Nhiệt độ hiện tại
- Độ ẩm hiện tại

Mỗi sensor có danh sách `coveragePoints` riêng trong cấu hình. Mỗi điểm là tọa độ tương đối `[x, z]` tính từ sensor; hệ thống nối tuần tự các điểm và khép kín chúng thành vùng đo. Cần tối thiểu ba điểm để tạo một vùng. Vùng sàn có viền màu theo trạng thái cảm biến, xuất hiện khi hover hoặc chọn cảm biến và di chuyển cùng tầng khi tách tầng.

Ví dụ tạo vùng tam giác:

```js
coveragePoints: [
  [-5, -3],
  [5, -3],
  [0, 5],
]
```

Thêm điểm vào mảng để tạo đa giác có nhiều cạnh hơn.

Panel tồn tại tối đa 15 giây.

- Hover sang cảm biến khác: panel cũ đóng, panel cảm biến mới xuất hiện và bắt đầu lại 15 giây.
- Hover sang AGV: panel cảm biến đóng.
- Bấm chuột, cuộn chuột hoặc dùng bàn phím: panel cảm biến đóng.
- Rời canvas không làm panel biến mất ngay; panel vẫn hiển thị cho đến khi hết 15 giây hoặc có tương tác khác.

### Trạng thái cảm biến

Cảm biến tính trạng thái dựa trên nhiệt độ và độ ẩm mô phỏng:

| Trạng thái | Điều kiện nhiệt độ | Điều kiện độ ẩm |
| --- | --- | --- |
| Hoạt động bình thường | Dưới 26,5 °C | Dưới 60% |
| Gần ngưỡng cảnh báo | Từ 26,5 °C | Từ 60% |
| Vượt ngưỡng cảnh báo | Từ 27 °C | Từ 65% |

Mỗi cảm biến có một đèn tín hiệu nhấp nháy ở phía trên thân thiết bị, kèm vùng sáng dạng nửa hình cầu để dễ quan sát. Màu đèn tương ứng với trạng thái: xanh lá, vàng và đỏ. Khi vượt ngưỡng cảnh báo, cảm biến có thêm dấu chấm than đỏ nhấp nháy; bấm vào dấu này sẽ chọn cảm biến và đưa camera đến vị trí của nó.

## Điều khiển hiển thị

- Có thể ẩn hoặc hiện AGV, tuyến AGV và cảm biến từ thanh công cụ.
- Có thể chuyển giữa tầng 1, tầng 2, xem cả hai tầng và tách tầng.
- Có thể thay đổi góc nhìn, ẩn hoặc hiện nhãn, tường, cây, luồng hàng và bật tự xoay camera.
- Trạng thái các nút trên thanh công cụ được lưu để khôi phục khi tải lại trang.
