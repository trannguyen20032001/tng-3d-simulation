# Quy tắc hoạt động mô phỏng 3D

Tài liệu này quy định hành vi mặc định cho AGV, cảm biến, tổ may/cân bằng chuyền và mọi thiết bị hoặc đối tượng tương tác được bổ sung sau này. Các thông số và ngoại lệ có thể được người dùng chỉnh sửa trực tiếp tại đây.

**Phạm vi cập nhật:** Việc thống nhất quy tắc trong tài liệu không tự thay đổi code đang chạy. Theo yêu cầu của người dùng, code hiện tại được giữ nguyên, đặc biệt là cân bằng chuyền. Những khác biệt của cân bằng chuyền được ghi rõ trong phần hiện trạng bên dưới; không tự sửa code để áp dụng quy tắc chung nếu chưa có yêu cầu tiếp theo.

## Quy tắc chung mặc định cho mọi đối tượng

### 1. Highlight khi hover hoặc chọn

- AGV, sensor, tổ may và thiết bị mới dùng chung màu **xanh lá cây `#48ff7a`** cho khung highlight khi hover/chọn.
- Khung bám đúng biên và vị trí đối tượng, cập nhật theo di chuyển/biến đổi của đối tượng và tầng. Không bao gồm lối đi hay đối tượng lân cận.
- Khung hover ẩn khi chuột rời đối tượng; khung của đối tượng đang chọn được giữ cho đến khi bỏ chọn, đóng bảng chi tiết hoặc chọn đối tượng khác.
- Màu khung tương tác độc lập với màu trạng thái: dải sàn, vùng đo, đèn và dấu cảnh báo vẫn dùng màu theo trạng thái tương ứng.

### 2. Panel hover và thời gian hiển thị

- Hover vào đối tượng sẽ hiện một panel nổi phía trên đối tượng. Panel đi theo đối tượng và cập nhật vị trí theo camera, kể cả khi di chuyển hoặc tách tầng.
- Tại một thời điểm chỉ có một panel hover cho tất cả các loại đối tượng.
- Panel tồn tại tối đa **15 giây** kể từ lúc xuất hiện, sau đó tự ẩn. Không liên tục đặt lại thời gian chỉ vì chuột vẫn nằm trên cùng một đối tượng.
- Rời đối tượng hoặc rời canvas không làm panel biến mất ngay; panel tiếp tục hiển thị đến hết 15 giây, trừ các trường hợp đóng sớm bên dưới. Thời gian của panel độc lập với khung highlight khi hover.
- Hover sang đối tượng khác, kể cả khác loại: đóng panel cũ, mở panel của đối tượng mới và bắt đầu lại thời gian 15 giây.
- Bấm chuột, cuộn chuột, thao tác bàn phím hoặc điều khiển camera: đóng panel hover đang hiện. Nếu sau đó hover vào đối tượng khác, mở panel mới theo quy tắc trên.
- Nội dung panel gồm tên/mã đối tượng và thông số phù hợp với loại đối tượng. Không trộn thông số giữa AGV, sensor, tổ may hoặc thiết bị mới; nội dung riêng được mô tả ở các phần bên dưới.

### 3. Click chọn, bảng chi tiết và camera

- Click trực tiếp vào đối tượng sẽ chọn đối tượng, mở bảng thông số chi tiết ở **góc trên bên phải**, đồng thời đưa camera đến và bám theo đối tượng.
- Đối tượng di chuyển thì camera đi theo; đối tượng cố định thì camera giữ điểm quan sát tại đối tượng đó. Vị trí bám cập nhật khi tầng chứa đối tượng di chuyển hoặc tách tầng.
- Tại một thời điểm chỉ có một đối tượng được chọn và một bảng chi tiết. Chọn đối tượng mới, kể cả khác loại, sẽ thay nội dung bảng và chuyển camera sang bám đối tượng mới.
- Click chọn cũng đóng panel hover đang hiện. Bảng chi tiết không tự ẩn sau 15 giây; thời hạn này chỉ áp dụng cho panel hover.
- Đóng bảng chi tiết hoặc bỏ chọn sẽ bỏ khung chọn và dừng camera bám theo. Chọn góc nhìn có sẵn cũng dừng việc bám theo.

### 4. Cảnh báo và dấu chấm than

- Dấu chấm than cảnh báo dùng component tái sử dụng `src/components/ui/warning-marker.js`. Component phụ trách phần tử giao diện, hỗ trợ bàn phím, định vị theo camera và ẩn khi ngoài khung nhìn; từng loại đối tượng chỉ cung cấp điều kiện cảnh báo, vị trí neo và hành động khi bấm.
- Đối tượng gặp lỗi hoặc đạt điều kiện cảnh báo nghiêm trọng của loại đó sẽ có dấu **chấm than đỏ nhấp nháy** phía trên. Dấu cảnh báo bám theo vị trí đối tượng và camera.
- Click dấu chấm than có cùng hành vi với click trực tiếp đối tượng: chọn, mở bảng chi tiết, đưa camera đến và bám theo đối tượng bị cảnh báo.
- Điều kiện phát sinh và hết cảnh báo được cấu hình riêng theo loại đối tượng; không dùng chung một ngưỡng nghiệp vụ cho tất cả thiết bị.
- Khi hết điều kiện cảnh báo, ẩn dấu chấm than tương ứng.

### 5. Ẩn/hiện theo tầng và chức năng

- Khi đối tượng hoặc tầng chứa đối tượng bị ẩn, panel hover, khung highlight và dấu cảnh báo liên quan cũng ẩn. Nếu đối tượng đó đang được chọn, đóng bảng chi tiết và dừng camera bám theo.
- Nút toolbar chỉ điều khiển đúng phạm vi chức năng được mô tả, không làm ẩn các đối tượng không liên quan.
- Với lớp thông tin như cân bằng chuyền, tắt lớp chỉ ẩn các hiệu ứng/thông tin của lớp theo cấu hình, giữ nguyên máy móc, bàn ghế và công nhân. Chi tiết ngoại lệ hiện tại của nút này được ghi ở phần cân bằng chuyền.

### 6. Áp dụng cho thiết bị mới và chỉnh sửa sau này

- Khi bổ sung loại thiết bị hoặc đối tượng tương tác mới, mặc định áp dụng toàn bộ quy tắc chung trên, bao gồm **panel hover 15 giây** và **click để camera đến, bám theo đối tượng**.
- Mỗi loại bổ sung riêng các thông số hover/chi tiết, điều kiện cảnh báo, màu trạng thái và phạm vi hiển thị phù hợp nghiệp vụ.
- Nếu cần hành vi khác, ghi ngoại lệ rõ ràng cho loại đối tượng đó trong tài liệu này. Quy tắc riêng có ghi rõ ngoại lệ được ưu tiên; các hành vi còn lại tiếp tục theo quy tắc chung.
- Không coi khác biệt trong code cân bằng chuyền hiện tại là mặc định cho thiết bị mới. Không tự sửa code hiện tại chỉ để đồng bộ với lần cập nhật tài liệu này.

## Cân bằng chuyền của 24 tổ may — hiện trạng giữ nguyên

**Ngoại lệ triển khai hiện tại:** Panel hover của tổ may đóng khi rời vùng hoặc tương tác, chưa áp dụng thời hạn 15 giây của quy tắc chung. Click trực tiếp tổ may mở chi tiết nhưng không tự đưa camera đến; click dấu chấm than mới đưa camera đến và bám theo tổ. Các hành vi này cùng nút bật/tắt lớp cân bằng chuyền được giữ nguyên trong code theo yêu cầu của người dùng. Đây là ghi chú hiện trạng, không phải quy tắc mặc định cho thiết bị bổ sung sau này.

- Nút **Cân bằng chuyền** trên toolbar bật/tắt lớp cân bằng chuyền, mặc định bật và lưu trạng thái khi tải lại trang. Khi tắt: ẩn dấu chấm than của tổ may, ẩn màu sản lượng trên sàn để trả lại sàn gốc, không hiện highlight hoặc panel khi hover tổ may. Máy móc, bàn ghế, công nhân và các đối tượng trong tổ vẫn hiển thị; click tổ vẫn mở bảng chi tiết. Bật lại khôi phục màu sàn và cảnh báo theo dữ liệu hiện tại. AGV và cảm biến giữ nguyên hành vi.
- Hover vào vùng một tổ may ở tầng 2 sẽ tô sáng và viền xanh lá cây của tổ đó.
- Vùng tương tác khớp với vạch sàn của từng tổ, không lấy trung điểm giữa hai tổ để tránh tràn vào lối đi (đặc biệt tổ 8–9).
- Panel nổi hiển thị tên tổ, sản lượng/mục tiêu và công đoạn có sản lượng thấp nhất.
- Panel hover đóng khi rời tổ, tương tác camera hoặc ẩn tầng 2. Tổ đang chọn giữ viền đến khi đóng bảng chi tiết hoặc chọn đối tượng khác.
- Click vào tổ mở bảng chi tiết ở góc trên bên phải; chọn tổ khác thay nội dung bảng. Đóng bằng nút × hoặc Escape. Chọn AGV/cảm biến đóng bảng tổ may; chọn tổ may đóng popup AGV/cảm biến. Ẩn tầng 2 đóng bảng chi tiết.
- Bảng chi tiết gồm: sản lượng lũy kế/mục tiêu hiện tại; sản lượng từng công đoạn có mã thiết bị và kế hoạch; công đoạn nghẽn (sản lượng thấp nhất); chênh lệch công đoạn này trừ công đoạn liền trước; thời gian từ sản phẩm cuối và trạng thái chạy/dừng; mục tiêu, thực tế, tỷ lệ hoàn thành, hiệu suất; mã hàng, số lao động, sản lượng theo giờ, nhịp thực tế/yêu cầu, dự báo cuối ca; tỷ lệ lỗi khi có dữ liệu kiểm hàng. Thiếu dữ liệu kiểm hàng phải ghi rõ, không coi là 0% lỗi.
- Tỷ lệ đạt = sản lượng thực tế / mục tiêu hiện tại. Dải sàn xanh khi **≥95%**, vàng khi **≥85% và <95%**, đỏ khi **<85%**. Đúng 85% là vàng, đúng 95% là xanh.
- Tổ đạt dưới 85% có dấu chấm than đỏ nhấp nháy phía trên; bấm dấu này mở chi tiết và đưa camera đến tổ. Cảnh báo ẩn khi tầng 2 bị ẩn hoặc tổ đạt từ 85%.
- Sản lượng và các công đoạn hiện là dữ liệu mô phỏng, cấu hình tại `src/features/sewing-teams.js`. Ví dụ hiện tại là ảnh chụp dữ liệu sau 4 giờ trong ca 8 giờ, ngưỡng dừng suy ra từ 120 giây không có sản phẩm mới. Thời gian từ sản phẩm cuối tăng theo đồng hồ; dữ liệu sản xuất chưa kết nối máy thực.
- Hiệu suất lao động = sản lượng × thời gian lao động chuẩn mỗi sản phẩm / (số lao động × thời gian đã làm). Nhịp thực tế/yêu cầu = thời gian đã làm / sản lượng thực tế hoặc mục tiêu hiện tại. Dự báo cuối ca = tốc độ sản xuất hiện tại × thời lượng ca. Tổng sản lượng theo giờ bằng sản lượng lũy kế.

## Camera và đối tượng được chọn

- Quy chuẩn mặc định cho mọi loại đối tượng nằm ở mục **Quy tắc chung mặc định cho mọi đối tượng**. Các dòng dưới đây mô tả hiện trạng AGV và cảm biến; ngoại lệ cân bằng chuyền được ghi riêng ở phần trên.
- Khi chọn một AGV, camera di chuyển đến vị trí AGV và bám theo xe khi xe di chuyển.
- Khi chọn một cảm biến môi trường, camera di chuyển đến vị trí cảm biến và bám theo cảm biến đó.
- Đóng popup thông tin sẽ dừng việc bám theo đối tượng.
- Chọn một góc nhìn có sẵn như `Ngoại cảnh`, `Bên trong` hoặc `Mặt bằng` cũng dừng việc bám theo.
- Nếu đối tượng đang được chọn bị ẩn do thay đổi tầng hoặc tắt nhóm đối tượng, popup đóng và camera dừng bám theo.

## Quy tắc AGV

### Tuyến và cách di chuyển

- Cấu hình tuyến bằng danh sách `points` trong `src/features/agv.js`.
- Một điểm: AGV đứng yên tại điểm đó, tốc độ bằng 0.
- Tuyến hở hai điểm `A, B`: chạy `A → B → A → B…`.
- Tuyến hở từ ba điểm, ví dụ `A, B, C, D`: chạy
  `A → B → C → D → C → B → A…`, quay lại theo đúng các đoạn đã đi.
- Chỉ chạy vòng khi điểm cuối trùng tọa độ điểm đầu. Ví dụ `A, B, C, A`:
  chạy `A → B → C → A → B…`.
- AGV di chuyển thẳng trên từng đoạn nối hai điểm liên tiếp, trùng với line tuyến;
  không bo cong góc hoặc tự thêm đoạn nối từ điểm cuối về điểm đầu.
- Các điểm liên tiếp trùng nhau được bỏ qua khi tính quãng đường; tuyến toàn điểm
  trùng nhau được xử lý như tuyến một điểm. AGV gặp lỗi vẫn dừng giữa tuyến.

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

### Giám sát điện

- Thẻ cố định góc dưới bên phải, hỗ trợ thu gọn/mở rộng và lưu trạng thái vào
  localStorage. Trên màn hình hẹp, thẻ đặt phía trên toolbar để tránh chồng nhau.
- Thu gọn chỉ giữ bốn chỉ số: điện năng trong ca, điện năng trong ngày (kWh),
  hệ số công suất cosφ và nhiệt độ thiết bị điện (°C).
- Mở rộng hiển thị thêm bảng điện năng cao điểm, bình thường, thấp điểm cho cả
  ca và ngày. Tổng ca/ngày bằng tổng ba nhóm tương ứng.
- Cảnh báo khi cosφ thấp hơn `minPowerFactor` hoặc nhiệt độ cao hơn
  `maxTemperature`. Đúng ngưỡng không cảnh báo. Biểu tượng và màu cảnh báo vẫn
  hiển thị ngay cạnh chỉ số khi thu gọn.
- Dữ liệu hiện là ảnh chụp mô phỏng, chưa kết nối công tơ. Ngưỡng minh họa
  cosφ 0,9 và nhiệt độ 60 °C nằm tại `src/features/electricity.js`; cần thay
  bằng ngưỡng của thiết bị thực tế khi tích hợp.
- Chuẩn bị mở rộng theo khu vực: `app.electricity.setReading(id, reading)` đăng ký
  dữ liệu, `selectScope(id)` chọn thẻ tương ứng; chưa gắn click khu vực tự động.
  Dữ liệu có `name`, `shift`/`day` (các khóa `peak`, `normal`, `offPeak`),
  `powerFactor`, `temperature`, `simulated`.

- Kệ pallet tầng 1 và hàng hóa phải nằm dưới mặt dưới sàn tầng 2 (cao độ 4,3 m).
  Đỉnh kệ hiện tại là 4,2 m. Nhãn nội thất tầng 1 ẩn khi hai tầng chồng nhau để
  không vẽ xuyên sàn; hiện lại khi chỉ xem tầng 1 hoặc tách tầng đủ khoảng hở.

### Slideshow tự động

- Với tổ may, camera focus tại đầu tổ, đúng tâm bảng tên (tọa độ tầng 2:
  `x = team.x`, `y = 4.3`, `z = team.headZ - 1`), rồi zoom và xoay quanh điểm này.
  Điểm focus đi theo tầng khi tách tầng; highlight vẫn bao quanh vùng tổ may.
- Ngoài các khu tổng thể trong danh sách bên trái, slideshow còn đến riêng từng
  phòng sấy, máy dò kim, phòng bắn mác, LAB, mac, seam, cắt chun, bảo quản lông vũ,
  kiểm hàng, khách hàng, bảo quản in thêu, phòng điện, cắt vòng, ép mex, cộp nhiệt,
  máy cắt tự động, bàn sang dấu, bàn kiểm bán, nén khí, bốc công và các vị trí phụ
  đã đánh dấu trên mặt bằng tầng 1. Danh sách chi tiết dùng `f1.slideshowAreas`,
  lấy tọa độ từ danh sách `EXTRA` và cấu hình phòng sấy/máy dò kim trong file dựng tầng 1.
- Nút **Slideshow** trên toolbar bật/tắt chế độ xem tự động, mặc định tắt.
- Mỗi đối tượng được xem theo thời lượng cấu hình `durationMs` trong
  `src/features/slideshow.js` (hiện là **10 giây**), đồng thời mở popup chi tiết của đối tượng.
  Camera bám theo AGV đang di chuyển. Khu vực dùng góc nhìn có sẵn và hiển thị tên,
  tầng, mô tả; không tự tạo thêm dữ liệu vận hành chưa có.
- Chờ camera hoàn tất focus, zoom nhẹ gần hơn 12% trong 0,9 giây, sau đó xoay chậm
  quanh đối tượng. Khung xanh lá nhấp nháy bám theo AGV/sensor/tổ may; với khu vực,
  đánh dấu vùng quanh tâm quan sát. Chuyển mục hoặc dừng thì xóa highlight cũ.
  Cấu hình bằng `zoomScale`, `zoomDurationMs`, `orbitRadiansPerSecond` trong cùng file.
- Mỗi vòng đi qua AGV, sensor, 24 tổ may và các khu vực trong danh sách nhà máy.
  Thứ tự: cảnh báo đỏ/dấu chấm than → cảnh báo vàng → các đối tượng còn lại.
  Sensor dùng trạng thái đo hiện tại; AGV lỗi ưu tiên đỏ, pin yếu ưu tiên vàng;
  tổ may dưới 85% ưu tiên đỏ, từ 85% đến dưới 95% ưu tiên vàng.
- Hết danh sách thì đọc lại trạng thái, sắp xếp lại ưu tiên và bắt đầu vòng mới.
- Tự chuyển tầng phù hợp, bật các lớp AGV/sensor/cân bằng chuyền, tắt tự xoay
  và trần tầng 2 để quan sát nội thất.
- Bấm lại nút, thao tác camera, chọn thủ công từ toolbar/danh sách khu vực,
  đóng popup hoặc nhấn Escape sẽ dừng slideshow. Giữ góc nhìn hiện tại khi dừng.
- Khi tab bị ẩn, tạm dừng bộ đếm; khi quay lại, đối tượng hiện tại được xem lại
  đủ 30 giây. Không tự bật slideshow khi tải lại trang.

- Có thể ẩn hoặc hiện AGV, tuyến AGV và cảm biến từ thanh công cụ.
- Có thể chuyển giữa tầng 1, tầng 2, xem cả hai tầng và tách tầng.
- Có thể thay đổi góc nhìn, ẩn hoặc hiện nhãn, tường, cây, luồng hàng và bật tự xoay camera.
- Trạng thái các nút trên thanh công cụ được lưu để khôi phục khi tải lại trang.
