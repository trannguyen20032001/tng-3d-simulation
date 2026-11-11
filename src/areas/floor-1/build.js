TNG.areas.buildFloor1 = function (app) {
  const loadTex = TNG.core.loadTexture;

  ("use strict");
  app.GATE_CENTRAL = true;
  // ---------- coordinates: drawing units are mm; plan x -> world x, plan y (down) -> world z ----------
  const OX = 123000,
    OY = 87500;
  const { X, Z, M } = TNG.core.createCoordinates(OX, OY);

  // ---------- ảnh nền cắt từ bản phối cảnh PA6 (bầu trời, cỏ, tán lá) để cảnh ngoài trời trông thật ----------

  // seeded random so the model looks the same every load
  const { rnd, pick } = TNG.core.createRandom(7);

  // ---------- instanced geometry collector ----------
  const batch = TNG.core.createInstanceBatch();
  const { box, cyl, sph } = batch;
  // rectangle helper in plan mm: x,y = top-left corner, w along x, h along y; y0 = base height (m), H = height (m)
  function rect(k, x, y, w, h, y0, H, c) {
    box(k, X(x + w / 2), y0 + H / 2, Z(y + h / 2), M(w), H, M(h), c);
  }

  // ---------- palettes taken from the site photos ----------
  const C = {
    // tông màu nổi theo ảnh mẫu chị gửi: sàn epoxy xanh lá tươi, thiết bị trắng sáng, khung kính viền sẫm
    rackBlue: 0x1f4fd8,
    beam: 0xff6a00,
    steelWhite: 0xffffff,
    wall: 0xffffff,
    wallCap: 0x2e353d,
    // 23/10: chị dặn sàn trong xưởng màu trắng, mọi vách là vách kính khung sẫm
    floor: 0xeceff1,
    line: 0xf0a800,
    col: 0xffffff,
    table: 0xa97c4e,
    leg: 0x1c1f23,
    kplFloor: 0xe8ebee,
  };
  // 23/10: màu kiện hàng tô đậm lại, bỏ bớt trắng chói cho đỡ mỏi mắt
  const fabricBags = [
    0x22345e, 0x2c3f72, 0x1a2546, 0x9aa6b4, 0x8593a3, 0x5f7896, 0x6b7787,
    0x7d8fa6, 0x3d4c6c, 0xb53a4a,
  ];
  const garments = [
    0xa12825, 0x8e2222, 0x1d2740, 0x232a3a, 0x111418, 0x5f93c4, 0xa8803f,
    0xc29a4e, 0xbd6a45, 0x3e5070, 0x67727e, 0xb9b2a0,
  ];
  const cartonC = [0xa6703a, 0x9a6633, 0xb07a42, 0x8c5e2e];

  // ---------- building shell ----------
  const BX0 = 33000,
    BX1 = 213500,
    BY0 = 52500,
    BY1 = 122500;
  const WALLH = 2.6,
    T = 250;
  const walls = []; // [x,y,w,h,H,kind]
  function wall(x0, y0, x1, y1, H, kind) {
    // axis-aligned wall segment between two plan points
    const t = kind === "glass" ? 120 : T;
    if (y0 === y1)
      walls.push([
        Math.min(x0, x1),
        y0 - t / 2,
        Math.abs(x1 - x0),
        t,
        H || WALLH,
        kind || "wall",
      ]);
    else
      walls.push([
        x0 - t / 2,
        Math.min(y0, y1),
        t,
        Math.abs(y1 - y0),
        H || WALLH,
        kind || "wall",
      ]);
  }
  // exterior
  wall(BX0, BY0, BX1, BY0);
  wall(BX0, BY0, BX0, BY1); // vách kính mặt bắc và tây giữ nguyên; mặt đông đã bỏ, chỉ còn cột
  [
    [BX0, 60500],
    [68000, 175500],
    [183000, 208300],
  ].forEach(([a, b]) => wall(a, BY1, b, BY1)); // vách kính mặt nam: hở 2 cửa bốc hàng (xe container lùi vào) và đoạn cạnh cầu thang lên tầng 2 (x>208300)
  // Kho thành phẩm | middle block (trục 5) – openings for aisles
  wall(81000, BY0, 81000, 73000);
  wall(81000, 78500, 81000, 95000);
  wall(81000, 99500, 81000, 112500);
  // middle block | Nhà cắt (trục 8)
  wall(115800, BY0, 115800, 57000);
  wall(115800, 61000, 115800, 96000);
  wall(115800, 100500, 115800, 112500);
  // Nhà cắt | Kho nguyên liệu: lưới thép thấp (nét đứt trên bản vẽ)
  wall(155700, 57500, 155700, 96500, 1.4, "fence");
  wall(155700, 101500, 155700, 118500, 1.4, "fence");
  // middle block horizontals
  wall(81000, 77300, 90500, 77300);
  wall(92800, 77300, 115800, 77300, WALLH, "glass");
  wall(81000, 82800, 92800, 82800);
  wall(92800, 77300, 92800, 92500, WALLH, "glass");
  wall(81000, 92500, 88000, 92500);
  wall(91500, 92500, 115800, 92500, WALLH, "glass");
  wall(104300, 77300, 104300, 92500, WALLH, "glass");
  wall(81000, 112500, 96000, 112500);
  wall(100000, 112500, 115800, 112500);
  // bottom-left / bottom-right "Bốc công" rooms
  wall(58700, 112500, 69800, 112500);
  wall(58700, 112500, 58700, BY1);
  wall(69800, 112500, 69800, BY1);
  wall(173700, 112500, 184600, 112500);
  wall(173700, 112500, 173700, BY1);
  wall(184600, 112500, 184600, BY1);
  // KV nén khí
  wall(52500, BY0, 52500, 57300);
  wall(52500, 57300, 62200, 57300);
  wall(62200, BY0, 62200, 57300);
  // Dải phòng phía đông (bản hoàn công mới): Phòng LAB · Phòng mac · Phòng seam · Phòng cắt chun; vách có chỗ hở làm cửa
  [
    [BY0, 59200],
    [63100, 69050],
    [76150, 82500],
  ].forEach(([a, b]) => wall(207650, a, 207650, b));
  wall(208300, 92700, 208300, 95720); // đoạn vách dài phía dưới đã bỏ để dựng cầu thang lên tầng 2 (dải sát mặt dựng phía đông)
  // Phòng bắn mác (phòng nhỏ phía trên khu phân sai, cạnh buồng thang trục 8)
  wall(92500, BY0, 92500, 57200);
  wall(104600, BY0, 104600, 57200);
  wall(92500, 57200, 97500, 57200);
  wall(99000, 57200, 104600, 57200);
  wall(211450, BY0, 211450, 92300);
  [62750, 72600, 84550, 92300].forEach((y) => wall(207650, y, 211450, y));
  // Phòng bảo quản lông vũ (góc đông bắc, cạnh buồng thang)
  wall(196250, BY0, 196250, 57200);
  [
    [196250, 198343],
    [199843, 205279],
    [206729, 207650],
  ].forEach(([a, b]) => wall(a, 57200, b, 57200));
  // Phòng kiểm hàng ×2 (phía tây nam, cạnh phòng bốc công) + phòng kiểm hàng thứ 3
  [
    [114200, 117980],
    [119500, 122450],
  ].forEach(([a, b]) => wall(52600, a, 52600, b));
  wall(52600, 112350, 58069, 112350);
  wall(52600, 117650, 58800, 117650);
  wall(72460, 117650, 78638, 117650);
  // Phòng khách hàng · Phòng bảo quản in thêu · Phòng điện (dãy phòng dọc mặt nam)
  wall(96050, 117600, 96050, 122450);
  wall(100050, 117600, 100050, 122450);
  wall(92429, 117800, 96029, 117800);
  wall(123900, 117650, 123900, 122450);
  wall(139100, 117600, 139100, 121500);
  wall(126700, 117650, 136889, 117650);
  wall(139100, 117600, 151650, 117600);
  wall(151650, 117600, 151650, 122450);
  // buồng thang: tường bao phía trong (bản hoàn công)
  [
    [35100, 47300],
    [104600, 116300],
    [184500, 196250],
  ].forEach(([a, b]) => {
    wall(a, 57200, b, 57200);
    wall(b, BY0, b, 57200);
    if (a !== 184500) {
      wall(a, 117650, b, 117650);
      wall(b, 117650, b, BY1);
    } // buồng thang phía nam trục 12 đã bỏ (vách + cầu thang)
  });
  wall(208300, 98820, 208300, BY1); // vách ngăn dải cầu thang tầng 2 với kho phụ liệu
  // WC (2 khối phía bắc: trục 4–5 và trục 11–12), mỗi khối 2 ngăn nam/nữ, cửa mỗi ngăn
  [
    [72800, 77700, 81800],
    [161500, 165650, 170550],
  ].forEach(([a, m, b]) => {
    wall(a, BY0, a, 57200);
    wall(b, BY0, b, 57200);
    wall(m, BY0, m, 57200);
    [
      [a, a + 1800],
      [a + 2900, m],
      [m, m + 1800],
      [m + 2900, b],
    ].forEach(([p, q]) => wall(p, 57200, q, 57200));
  });

  // stair cores [x0,y0,x1,y1] — 3 buồng thang phía bắc + 3 phía nam theo bản hoàn công (khối 4–5 và 11–12 phía bắc là WC, không phải thang)
  const stairs = [
    [37700, BY0, 44900, 57600],
    [107000, BY0, 113900, 57600],
    [187000, BY0, 193900, 57600],
    [37700, 117400, 44900, BY1],
    [107000, 117400, 113900, BY1],
  ];

  // ---------- column grid (from DWG axis labels) ----------
  const GX = [
    35175, 46335, 57835, 69297, 80835, 92373, 103835, 115335, 126873, 137730,
    149571, 160730, 172230, 183693, 195230, 206768, 213330,
  ];
  const GY = [53307, 63157, 73007, 82857, 92707, 102557, 112407, 122257];

  // ---------- equipment builders ----------
  // Pallet rack (blue uprights, orange beams) – kho nguyên liệu & kho thành phẩm
  const palletRack = TNG.components.palletRack({
    box,
    cyl,
    X,
    Z,
    M,
    rnd,
    pick,
    fabricBags,
    cartonC,
  });
  // Light white shelving with folded garment stacks – phân cỡ, phòng sấy, bán thành phẩm
  const shelf = TNG.components.shelf({ box, X, Z, M, rnd, pick, garments });
  // Cutting table with spread fabric layers
  const cutTable = TNG.components.cutTable({ box, X, Z, M, C, rnd, pick });
  const person = TNG.components.person({ box, cyl, sph, pick });
  const crate = TNG.components.crate({ box });
  const cartonStack = TNG.components.cartonStack({ box, rnd, pick, cartonC });
  const trolley = TNG.components.trolley({ box, rnd, pick, garments });
  const forklift = TNG.components.forklift({ box });

  // ================= ZONE CONTENT (positions from the DWG) =================
  // 1. Kho nguyên liệu – pallet racks
  const knl = [
    [159700, 21050],
    [184700, 18850],
  ];
  const knlY = [60100, 62600, 70000, 72500, 79850, 82350, 89750, 92250];
  knl.forEach(([x, w]) =>
    knlY.forEach((y) => palletRack(x, y, w, 1850, "rolls")),
  );
  [99600, 102100].forEach((y) => palletRack(159700, y, 21050, 1850, "rolls"));
  forklift(X(182500), Z(76200), true);
  forklift(X(170000), Z(96000), true);
  // pallets of incoming rolls near the dock
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++)
      cyl(
        "roll",
        X(176000) + i * 0.55,
        0.35 + j * 0.0,
        Z(108500) + j * 0.0,
        0.25,
        1.6,
        "z",
        pick(fabricBags),
      );
  cartonStack(X(175000), Z(115000), 5, 3);

  // 2. Nhà cắt – long cutting tables, automatic cutters, bundle shelves
  const ct = [
    [121550, 59950, false],
    [121550, 65100, true],
    [121550, 69950, false],
    [127000, 74300, true],
    [127000, 78600, false],
    [127000, 85500, true],
    [127000, 89800, false],
    [121850, 94100, true],
  ];
  ct.forEach(([x0, yc, g]) => cutTable(x0, 147450, yc, g));
  for (let i = 0; i < 8; i++) {
    rect("machine", 148200, 58300 + i * 4600, 1600, 1700, 0, 1.1, 0xd9dee3);
  }
  for (const x of [140050, 142250, 144450, 146650, 148850])
    for (const y of [98500, 105950]) shelf(x, y, 1250, 6000, { H: 2.2 });
  // bản hoàn công mới: ÉP MEX nằm đầu dãy bàn thứ 3, CỘP NHIỆT đầu dãy bàn thứ 6, bàn sang dấu + bàn kiểm bán là 2 bàn dài
  rect("machine", 116500, 68500, 3600, 2900, 0, 1.4, 0xdadfe4);
  rect("accent", 116500, 68500, 3600, 200, 1.4, 0.05, 0x1f5fa8); // máy ép mex
  rect("machine", 116800, 83500, 3200, 2600, 0, 1.2, 0xdadfe4);
  rect("accent", 116800, 83500, 3200, 200, 1.2, 0.05, 0xe8a400); // cộp nhiệt
  rect("table", 139900, 101600, 10100, 1200, 0.8, 0.05, C.table);
  rect("table", 139900, 108900, 10100, 1200, 0.8, 0.05, C.table); // bàn sang dấu · bàn kiểm bán
  for (const y of [101600, 108900])
    for (const u of [0.6, 3.4, 6.2, 9.0]) {
      const xx = 139900 + u * 1000;
      for (const s of [0, 1])
        box("leg", X(xx), 0.4, Z(y) + 0.1 + s * 1.0, 0.06, 0.8, 0.06, C.leg);
    }
  for (let i = 0; i < 6; i++) trolley(X(124000) + i * 2.2, Z(105000), false);
  for (let i = 0; i < 5; i++) crate(X(150800), Z(60000) + i * 1.0, 0, 0xe23b3b);

  // 3. Khu phân sai, phân cỡ – white shelving
  [60400, 63650, 66450, 69250, 73500].forEach((y) => {
    shelf(93150, y, 7900, 1600);
    shelf(103800, y, 11750, 1600);
  });
  rect("table", 85600, 58300, 2600, 13100, 0.85, 0.06, C.table);
  for (let i = 0; i < 5; i++)
    for (const s of [0, 1])
      crate(
        X(86300) + s * 1.1,
        Z(59500) + i * 2.6,
        0.91,
        pick([0x1f4fbf, 0xe8b400]),
      );
  rect("steelWhite", 116300, 67500, 2400, 28000, 0, 0.05, C.steelWhite);
  shelf(116300, 67500, 2400, 13500, { H: 2.4 });
  shelf(116300, 82000, 2400, 13500, { H: 2.4 });

  // 4. Phòng sấy (2 phòng kính lớn + 1 phòng nhỏ) & phòng dò kim
  for (const x0 of [94150, 106550]) {
    for (let k = 0; k < 3; k++)
      shelf(x0 + k * 2850, 78800, 1200, 11800, {
        H: 2.4,
        pal: [0x1d2740, 0x232a3a, 0x111418, 0x2a3b66, 0x3a4a5e],
      });
  }
  for (let i = 0; i < 3; i++)
    trolley(
      X(84000) + i * 2.4,
      Z(87500),
      false,
      [0xb8322f, 0xb8322f, 0x1d2740, 0x1d2740, 0xf1efe8],
    );
  // metal detector line in Phòng dò kim
  rect("machine", 83000, 79300, 7000, 800, 0, 0.8, 0x8f9aa5);
  rect("machine", 85500, 78900, 1200, 1600, 0, 1.5, 0xe9ecef);
  rect("accent", 85500, 78900, 1200, 80, 1.5, 0.06, 0xe8a400);

  // 5. Tổ hoàn thiện – bàn gấp gói
  const gx = [
    [87800, 91100],
    [93700, 97000],
    [99500, 103000],
    [106100, 109500],
    [110700, 114200],
  ];
  gx.forEach(([a, b]) => {
    const cx = X((a + b) / 2),
      w = M(b - a) - 0.6,
      len = 13.0,
      cz = Z(102250);
    box("table", cx, 0.85, cz, w, 0.05, len, C.table);
    for (const sz of [-1, 1])
      for (const sx of [-1, 1])
        box(
          "leg",
          cx + sx * (w / 2 - 0.1),
          0.42,
          cz + sz * (len / 2 - 0.2),
          0.06,
          0.84,
          0.06,
          C.leg,
        );
    for (let k = 0; k < 9; k++) {
      const hh = 0.06 + rnd() * 0.12;
      box(
        "cloth",
        cx + (rnd() - 0.5) * w * 0.5,
        0.875 + hh / 2,
        cz - len / 2 + 0.9 + k * 1.4,
        0.45,
        hh,
        0.6,
        pick([0x1d2740, 0x232a3a, 0xf1efe8, 0x9cc3e6, 0x2a3b66]),
      );
    }
    for (let k = 0; k < 5; k++) {
      person(cx - w / 2 - 0.45, cz - len / 2 + 1.5 + k * 2.6);
      person(cx + w / 2 + 0.45, cz - len / 2 + 2.8 + k * 2.6);
    }
    for (let k = 0; k < 3; k++)
      crate(cx + w / 2 + 1.2, cz - len / 2 + 2 + k * 4, 0);
  });
  cartonStack(X(88500), Z(109800), 6, 2);
  cartonStack(X(100000), Z(109800), 6, 2);

  // 7. Kho phụ liệu (ô đỏ cũ) – kệ tôn mạ kẽm nhiều tầng, dãy A–D, bảng thông tin phụ liệu đầu dãy (theo ảnh thực tế)
  const KPL = { x0: 188200, x1: 206900, y0: 97000, y1: 120800 };
  // bản hoàn công mới: 10 dãy kệ (bước 2,3 m, sâu 1,2 m); 4 nhịp 2,05 m bên trái + 4 nhịp bên phải lối đi giữa; 3 dãy cuối chỉ còn nửa phải (nhường buồng thang)
  const kplRows = Array.from({ length: 10 }, (_, i) => 98999 + i * 2300);
  const accGoods = [
    0xa6703a, 0x9a6633, 0xb07a42, 0xa9b0b8, 0x8f9aa6, 0x7d8a99, 0x1b1d22,
    0x2a2d33, 0x5f86b8, 0xb7a988,
  ];
  const accShelf = TNG.components.accShelf({
    box,
    X,
    Z,
    M,
    rnd,
    pick,
    accGoods,
    cartonC,
    crate,
  });
  // tấm biển chữ A–D trên nóc dãy + bảng thông tin trắng viền đỏ ở đầu dãy
  function letterTex(t, bg, fg) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = bg;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = fg;
    g.font = '700 92px "Be Vietnam Pro",sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(t, 64, 70);
    const tx = new THREE.CanvasTexture(c);
    tx.encoding = THREE.sRGBEncoding;
    return tx;
  }
  const KPL_SIGNS = [];
  kplRows.forEach((y, r) => {
    const half = r >= 7; // 3 dãy cuối chỉ có nửa phải
    if (!half) accShelf(189836, y, 6150, 1200);
    accShelf(198159, y, 8200, 1200);
    const zc = Z(y + 600),
      bx = half ? 197300 : 189200;
    box("board", X(bx), 1.35, zc, 0.05, 1.9, 1.0, 0xffffff);
    box("boardRed", X(bx) - 0.03, 2.22, zc, 0.02, 0.16, 1.0, 0xd8262f);
    for (const s of [-1, 1])
      box("guard", X(bx - 300), 0.35, zc + s * 0.5, 0.08, 0.7, 0.08, 0xf5c400);
    box("guard", X(bx - 300), 0.68, zc, 0.08, 0.08, 1.0, 0xf5c400);
    KPL_SIGNS.push(["ABCDEFGHIJ"[r], X(bx + 500), 3.05, zc]);
  });
  // bàn soạn phụ liệu + người (phần trống phía nam nửa trái)
  rect("table", KPL.x0 + 2000, 114600, 3200, 1100, 0.78, 0.05, C.table);
  rect("table", KPL.x0 + 6500, 114600, 3200, 1100, 0.78, 0.05, C.table);
  person(X(KPL.x0 + 3600), Z(116100));
  person(X(KPL.x0 + 8100), Z(116100));
  person(X(KPL.x0 + 9800), Z(105300), 0x2f5fa8);

  // 6. Kho thành phẩm – pallet racks (cartons)
  const ktpY = [
    [60450, 1550],
    [62650, 1550],
    [68150, 1550],
    [70300, 1550],
    [75150, 3050],
    [82300, 3050],
    [89950, 1550],
    [92400, 1600],
    [98050, 3100],
    [105050, 3100],
  ];
  ktpY.forEach(([y, h]) => {
    palletRack(37050, y, 21700, h, "cartons");
    palletRack(62700, y, 16250, h, "cartons");
  });
  forklift(X(60500), Z(87000), false);
  cartonStack(X(61000), Z(115000), 6, 3);
  cartonStack(X(43000), Z(114500), 4, 3);

  // Phòng bắn mác: bàn bắn mác dài + máy in nhãn + 2 người
  rect("table", 94200, 53400, 5200, 1100, 0.8, 0.05, C.table);
  rect("table", 101900, 53400, 2200, 1100, 0.8, 0.05, C.table);
  rect("machine", 99900, 53300, 1500, 1000, 0.8, 0.5, 0xe3e6e9);
  rect("accent", 99900, 53300, 1500, 100, 1.3, 0.05, 0x1f5fa8);
  for (const lx of [94800, 96400, 98000])
    for (const k of [0, 1])
      box(
        "cloth",
        X(lx + k * 500),
        0.86,
        Z(53950),
        0.4,
        0.1 + 0.04 * k,
        0.5,
        pick([0xf1efe8, 0x9cc3e6, 0x2a3b66]),
      );
  person(X(96500), Z(55300), 0x3c76c4);
  person(X(102900), Z(55300), 0xf1f1f1);

  // Cầu thang bộ lên tầng 2 (dải sát mặt dựng phía đông, đã bỏ vách): 2 vế chữ U, chiếu nghỉ giữa, sàn chờ tầng 2 có lan can kính
  if (app.GATE_CENTRAL) {
    // bản ghép: theo ảnh thực tế — MỘT vế thang thẳng sát mặt dựng, bậc thép tấm chống trượt đen, hở mặt đứng, tay vịn sắt đen 2 thanh ngang; đỉnh thang nối hành lang tầng 2 (vẽ ở file tầng 2)
    const x0 = 90.6,
      W = 1.9,
      zb = 28.4,
      ze = 21.1,
      n = 26,
      top = 4.7,
      rise = top / n,
      run = (zb - ze) / n,
      L = Math.hypot(zb - ze, top),
      th = Math.atan2(top, zb - ze);
    const bm = new THREE.MeshStandardMaterial({
      color: 0x1d2024,
      roughness: 0.55,
      metalness: 0.35,
    });
    const rm = (x, y, z, sx, sy, sz, rx) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), bm);
      m.position.set(x, y, z);
      if (rx) m.rotation.x = rx;
      m.castShadow = true;
      (app.stairM = app.stairM || []).push(m);
      return m;
    }; // thêm vào scene sau khi scene được tạo
    for (let i = 0; i < n; i++) {
      const h = (i + 1) * rise,
        z = zb - (i + 0.5) * run;
      rm(x0 + W / 2, h - 0.03, z, W, 0.05, run + 0.02);
    } // bậc thép tấm, hở mặt đứng
    for (const s of [0, W]) {
      rm(x0 + s, top / 2 - 0.12, (zb + ze) / 2, 0.06, 0.24, L, th); // dầm bên (limon)
      for (const hh of [0.55, 1.0])
        rm(x0 + s, top / 2 + hh, (zb + ze) / 2, 0.045, 0.045, L, th); // 2 thanh tay vịn ngang chạy dọc thang
      for (let i = 0; i <= n; i += 4) {
        const h = i * rise,
          z = zb - i * run;
        rm(x0 + s, h + 0.5, z, 0.06, 1.0, 0.06);
      } // trụ đứng
    }
    // chiếu tới tầng 2: bậc cuối kéo dài 1,2 m làm sàn chờ, lan can phía ngoài (đông) + đầu bắc; phía tây mở vào sàn tầng 2
    rm(x0 + W / 2, top - 0.03, ze - 0.6, W, 0.05, 1.2);
    for (const hh of [0.55, 1.0])
      rm(x0 + W, top + hh, ze - 0.6, 0.045, 0.045, 1.2); // đầu bắc để thông với hành lang tầng 2 chạy hết mặt đông
  } else {
    const SX0 = 208600,
      SW = 1900,
      GAP = 300,
      rise = 0.18,
      run = 0.28,
      n = 13,
      top = n * rise * 2;
    const xa = X(SX0 + SW / 2),
      xb = X(SX0 + SW + GAP + SW / 2),
      w = M(SW),
      zs = Z(118600);
    const slab = (cx, cz, sx, sz, h) => {
      box("slab", cx, h - 0.1, cz, sx, 0.2, sz, 0xb9c0c6);
      for (const a of [-1, 1])
        for (const b of [-1, 1])
          box(
            "galv",
            cx + a * (sx / 2 - 0.1),
            (h - 0.2) / 2,
            cz + b * (sz / 2 - 0.1),
            0.15,
            h - 0.2,
            0.15,
            0xc3c9cf,
          );
    };
    for (let i = 0; i < n; i++) {
      // vế A: từ sàn tầng 1 đi lên về phía bắc
      const h = (i + 1) * rise,
        z = zs - (i + 0.5) * run;
      box("stairStep", xa, h / 2, z, w, h, run, 0xcfd4d8);
      box("galv", X(SX0) + 0.03, h + 0.5, z, 0.05, 0.05, run, 0xc3c9cf);
      box("galv", xa + w / 2 + 0.03, h + 0.5, z, 0.05, 0.05, run, 0xc3c9cf);
    }
    const zl = zs - n * run,
      hl = n * rise,
      ll = 1.6;
    slab((xa + xb) / 2, zl - ll / 2, w * 2 + M(GAP), ll, hl); // chiếu nghỉ giữa
    const zb = zl - ll;
    for (let j = 0; j < n; j++) {
      // vế B: từ chiếu nghỉ đi lên về phía nam
      const h = hl + (j + 1) * rise,
        z = zb + (j + 0.5) * run;
      box("stairStep", xb, h / 2, z, w, h, run, 0xcfd4d8);
      box("galv", xb - w / 2 - 0.03, h + 0.5, z, 0.05, 0.05, run, 0xc3c9cf);
      box("galv", xb + w / 2 + 0.03, h + 0.5, z, 0.05, 0.05, run, 0xc3c9cf);
    }
    const zp0 = zb + n * run,
      zp1 = Z(121400);
    slab(xb, (zp0 + zp1) / 2, w, zp1 - zp0, top); // sàn chờ tầng 2
    for (const a of [-1, 1])
      box(
        "glassDark",
        xb + a * (w / 2 - 0.03),
        top + 0.55,
        (zp0 + zp1) / 2,
        0.04,
        1.0,
        zp1 - zp0,
        0x7fb2c9,
      );
    box("glassDark", xb, top + 0.55, zp1 - 0.03, w, 1.0, 0.04, 0x7fb2c9);
  }

  // people in other zones
  [
    [1, 0],
    [0.8, 1],
  ].forEach(() => {});
  for (let i = 0; i < 12; i++) {
    const t = ct[i % 8];
    person(X(124000) + rnd() * 20, Z(t[1]) + (rnd() < 0.5 ? -1.55 : 1.55));
  }
  for (let i = 0; i < 8; i++)
    person(X(95000) + rnd() * 18, Z(62200) + Math.floor(rnd() * 4) * 3.0);
  for (let i = 0; i < 3; i++) person(X(84500) + i * 1.2, Z(91000));
  person(X(87000), Z(80200), 0xf1f1f1);
  person(X(170000), Z(68300));
  person(X(186000), Z(87900));
  person(X(60000), Z(73300));
  person(X(50000), Z(87000));
  person(X(178000), Z(117000));
  person(X(64000), Z(117500));

  // ================= THREE.JS SCENE =================
  // đọc mã màu đúng chuẩn sRGB → màu đậm, tươi đúng như mã (trước đây bị nhạt vì hiểu sai hệ màu)
  THREE.ColorManagement.legacyMode = false;
  const stage = document.getElementById("stage");
  const css = getComputedStyle(document.documentElement);
  // One scheduler owns all animation and rendering. Static views consume no frames.
  let frameId = 0,
    lastFrame = 0,
    motionEnabled = false,
    ledTexture = null;
  let labelsDirty = true,
    flowDirty = true;
  const frameHooks = [],
    labelRenderers = [];
  function scheduleFrame() {
    if (!document.hidden && !frameId) frameId = requestAnimationFrame(tick);
  }
  function invalidate(shadows = false) {
    labelsDirty = true;
    if (shadows) renderer.shadowMap.needsUpdate = true;
    scheduleFrame();
  }
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);
  const lr = new THREE.CSS2DRenderer();
  lr.setSize(stage.clientWidth, stage.clientHeight);
  lr.domElement.style.position = "absolute";
  lr.domElement.style.inset = "0";
  lr.domElement.style.pointerEvents = "none";
  stage.appendChild(lr.domElement);

  const scene = new THREE.Scene();
  (app.stairM || []).forEach((m) => scene.add(m));
  function applyTheme() {
    // trời thật cắt từ ảnh phối cảnh PA6; nền + sương mù là màu chân trời nhạt để hoà vào bầu trời
    scene.background = new THREE.Color(0xd3e2ee);
    scene.fog = new THREE.Fog(0xd3e2ee, 380, 820);
    invalidate();
  }
  applyTheme();
  const skyTex = loadTex("sky");
  skyTex.wrapS = THREE.MirroredRepeatWrapping;
  skyTex.repeat.set(2, 2);
  skyTex.offset.set(0, -1);
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(1100, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  skyDome.renderOrder = -1;
  scene.add(skyDome);
  try {
    matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      applyTheme,
    );
  } catch (e) {}
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const camera = new THREE.PerspectiveCamera(
    38,
    stage.clientWidth / stage.clientHeight,
    0.5,
    1500,
  );
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 8;
  controls.maxDistance = 420;
  controls.screenSpacePanning = false;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fd08a, 0.95));
  const sun = new THREE.DirectionalLight(0xfff6e8, 1.05);
  sun.position.set(-60, 120, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -135,
    right: 135,
    top: 80,
    bottom: -80,
    near: 10,
    far: 450,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // ground + floor
  const gBig = loadTex("grass");
  gBig.repeat.set(150, 117);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 700),
    new THREE.MeshStandardMaterial({
      color: 0x86b872,
      map: gBig,
      roughness: 1,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.08, 30);
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- mặt bằng tổng thể theo phối cảnh PA6 (trang 1 của PDF): đường nội bộ, bãi cỏ, nhà văn phòng, cầu nối ----------
  // toạ độ world (m): xưởng chính x -90…90,5 · z -35…35; phía nam là cửa bốc hàng
  const siteG = new THREE.Group();
  scene.add(siteG);
  const grassTex = loadTex("grass"),
    aspTex = loadTex("asph");
  function flat(x0, z0, x1, z1, c, y, r) {
    const g = new THREE.BoxGeometry(x1 - x0, 0.04, z1 - z0),
      tex = c === ASP ? aspTex : c === LAWN ? grassTex : null;
    if (tex) {
      const T = c === ASP ? 9 : 5,
        uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, (uv.getX(i) * (x1 - x0)) / T, (uv.getY(i) * (z1 - z0)) / T);
    }
    const m = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial(
        tex
          ? {
              color: c === ASP ? 0xcfd6e0 : 0x9cc486,
              map: tex,
              roughness: 0.95,
            }
          : { color: c, roughness: r || 0.9 },
      ),
    );
    m.position.set((x0 + x1) / 2, y || -0.045, (z0 + z1) / 2);
    m.receiveShadow = true;
    siteG.add(m);
    return m;
  }
  const ASP = 0x50565e,
    PAVE = 0xd9d6cf,
    LAWN = 0x588f3a;
  flat(-114, -46, 104, 109, ASP); // toàn khu sân đường nhựa
  flat(-96.5, -36, -91.5, 36, 0x6b7178, -0.03); // bãi đỗ xe con phía tây
  flat(-84, 66, 6, 103, LAWN, -0.02);
  if (!app.GATE_CENTRAL)
    flat(-84, 62, -60, 66, LAWN, -0.02); /* bản ghép: bỏ mảng cỏ dưới xe công */ // bãi cỏ tây nam
  flat(63, 51, 92.5, 103, LAWN, -0.02); // bãi cỏ đông nam
  flat(-125, -60, -114, 112, LAWN, -0.03);
  flat(104, -60, 116, 112, LAWN, -0.03); // dải cây ranh giới
  flat(-92, -37, 91, -35.4, PAVE, -0.02);
  flat(-92, 35.4, 91, 37, PAVE, -0.02); // vỉa hè sát xưởng
  // vạch kẻ đường trắng nét đứt
  const dashM = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
  });
  function dashes(x0, z0, x1, z1) {
    const L = Math.hypot(x1 - x0, z1 - z0),
      n = Math.floor(L / 5);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.25) / n;
      const d = new THREE.Mesh(
        new THREE.BoxGeometry(
          x1 !== x0 ? 2.4 : 0.18,
          0.02,
          x1 !== x0 ? 0.18 : 2.4,
        ),
        dashM,
      );
      d.position.set(x0 + (x1 - x0) * u, -0.02, z0 + (z1 - z0) * u);
      siteG.add(d);
    }
  }
  dashes(-110, -40.5, 100, -40.5);
  dashes(-104, -40, -104, 105);
  dashes(97.5, -40, 97.5, 105);
  dashes(-110, 106, 100, 106);
  dashes(10.5, 40, 10.5, 105);
  // cây xanh: trồng thành hàng đều trên dải cỏ ven đường như ảnh chụp thực tế; vẽ ở buildTrees() bên dưới
  const TREES = [];
  function tree(x, z, s, kind) {
    TREES.push([
      x + (rnd() - 0.5) * 0.5,
      z + (rnd() - 0.5) * 0.5,
      (s || 1) * (0.88 + rnd() * 0.28),
      kind || "street",
    ]);
  }
  for (let z = -56; z <= 108; z += 7) {
    tree(-117 + rnd(), z, 1.1, "street");
    tree(-122.5 + rnd(), z + 3.5, 1.2, "round");
    tree(108 + rnd(), z, 1.1, "street");
    if (app.GATE_CENTRAL) TREES.pop();
    if (rnd() < 0.5) tree(-119.8, z + 1.7, 0.55, "shrub");
  }
  for (let x = -88; x <= 88; x += 9) {
    tree(x, -38.8, 0.8, "street");
    if (rnd() < 0.4) tree(x + 4.5, -38.6, 0.5, "shrub");
  }
  for (let x = -92; x <= 88; x += 10) {
    if (Math.abs(x + 59) > 9 && Math.abs(x - 56) > 9 && !(x > 4 && x < 14))
      tree(x, 39.3, 0.85, "street");
  } // hàng cây ven vỉa hè phía nam xưởng
  if (!app.GATE_CENTRAL)
    for (let z = 70; z <= 100; z += 8) tree(65, z, 0.85, "round"); // mép trái bãi cỏ đông nam
  if (!app.GATE_CENTRAL)
    for (let x = 66; x <= 90; x += 7.5) {
      tree(x, 53, 0.9, "street");
    }
  if (!app.GATE_CENTRAL)
    for (let z = 57; z <= 100; z += 7.5) {
      if (app.GATE_CENTRAL && z < 60) continue;
      tree(91.8, z, 0.9, "street");
    } // viền phải bãi cỏ đông nam (sát đường)
  if (!app.GATE_CENTRAL)
    for (let x = 69; x <= 84; x += 7.5) tree(x, 101.6, 0.9, "street"); // viền dưới
  // (bản ghép) hàng cây dàn đều quanh bãi cỏ đông nam: 4 cạnh cách đều ~6 m, cùng kích thước
  if (app.GATE_CENTRAL) {
    for (let i = 0; i <= 8; i++) {
      const z = 52.8 + i * 6.0875;
      tree(64.8, z, 0.95, "street");
      tree(91.0, z, 0.95, "street");
    }
    for (let i = 1; i <= 3; i++) {
      const x = 64.8 + i * 6.55;
      tree(x, 52.8, 0.95, "street");
      tree(x, 101.5, 0.95, "street");
    }
  }
  if (app.GATE_CENTRAL) {
    for (let z = -50; z <= 106; z += 9.2) {
      if (z > 34 && z < 60) continue;
      tree(108.8, z, 1.0, "street");
    }
  } // bản ghép: hàng cây dời ra ngoài hàng rào phía đông, trồng dày hơn
  else
    for (let z = -32; z <= 90; z += 7) {
      tree(102.1, z, 0.95, "street");
    } // hàng cây dọc đường phía đông (trong hàng rào)
  // vỉa hè trắng viền bãi cỏ
  flat(-84.4, 65.5, 6.4, 66, 0xe9e6df, -0.01);
  flat(-84.4, 66, -84, 103, 0xe9e6df, -0.01);
  flat(62.6, 50.6, 93, 51, 0xe9e6df, -0.01);
  // ô cỏ viền vỉa trắng bao quanh từng cây quanh xưởng (mặt bắc & nam) như ảnh phối cảnh
  function lawnCell(x0, z0, x1, z1) {
    flat(x0, z0, x1, z1, LAWN, -0.012);
    const k = 0xe9e6df,
      t = 0.3;
    flat(x0 - t, z0 - t, x1 + t, z0, k, -0.008);
    flat(x0 - t, z1, x1 + t, z1 + t, k, -0.008);
    flat(x0 - t, z0, x0, z1, k, -0.008);
    flat(x1, z0, x1 + t, z1, k, -0.008);
  }
  for (let x = -92; x <= 88; x += 10) {
    if (Math.abs(x + 59) > 9 && Math.abs(x - 56) > 9 && !(x > 4 && x < 14))
      lawnCell(x - 4.2, 37.6, x + 4.2, 40.2); // phía nam (chừa cửa bốc hàng, đường trục giữa)
  }
  for (let x = -88; x <= 88; x += 9) lawnCell(x - 3.9, -40.2, x + 3.9, -37.4); // phía bắc
  flat(100.4, -40, 103.7, 106, LAWN, -0.015);
  flat(100.1, -40, 100.4, 106, 0xe9e6df, -0.01); // dải cỏ + vỉa trắng cho hàng cây phía đông
  // ô tô con bãi phía tây + xe tải chờ bốc hàng
  const carC = [
    0xffffff, 0xe9ecef, 0xb7bec6, 0x2b2f36, 0xc8202a, 0x2f6fd6, 0x8d959e,
  ];
  // ô tô dựng chi tiết: thân + cabin kính + nóc + 4 bánh + đèn trước/sau; kiểu sedan / SUV / bán tải (mũi xe hướng +u dọc trục xe)
  const car = TNG.components.car({ box, cyl, pick, carC });
  for (let z = -33; z <= 33; z += 2.7)
    if (rnd() < 0.85 && !app.GATE_CENTRAL) car(-94, z, true); // bản ghép: bỏ dãy xe phía tây, thay bằng hàng cây + thảm cỏ sát hàng rào
  if (app.GATE_CENTRAL) {
    for (let z = -33; z <= 33; z += 4.5) TREES.push([-94, z, 0.9, "street"]);
    flat(-114, -60, -111.5, 112, LAWN, -0.02);
    lawnCell(-95.8, -34.8, -92.2, 34.8);
  } // bệ cỏ liền một dải dưới hàng cây phía tây (cây ở chính giữa)
  // xe đầu kéo + container: cabin vàng có kính chắn gió, khung gầm đen, bánh đôi
  const truck = TNG.components.truck({ box, cyl });
  if (app.GATE_CENTRAL) {
    [-78, -64, -50].forEach((x) => {
      truck(x, 55.5, true, 0xf5c400);
      truck(x, 61.5, true, 0xf5c400);
    });
  } // bản ghép: 6 xe công đỗ sang vùng phía tây khu tập kết
  else
    [
      [-63, 54],
      [-49, 54],
      [-35, 54],
      [-63, 60],
      [-49, 60],
      [-35, 60],
    ].forEach(([x, z]) => truck(x, z, true));
  // 4 xe đầu kéo lùi nửa thân (~6,8 m) vào cửa bốc hàng, đuôi thùng nằm trong phòng Bốc công
  for (const x of [-60.5, -56.5, 54.5, 58.5]) truck(x, 33.8, false, 0xf5c400);
  // xe con đỗ dọc đường phía nam như ảnh phối cảnh (đỏ, bán tải xám, trắng, xanh, đen)
  // bãi đỗ xe con trước mặt tiền phía nam như ảnh thực tế: 1 hàng xe đỗ vuông góc, đầu xe quay vào xưởng (chừa 2 cửa bốc hàng + lối vào giữa)
  {
    const slotM = new THREE.MeshStandardMaterial({
      color: 0xf2f2f2,
      roughness: 0.6,
    });
    for (let x = -85; x <= 85; x += 3.3) {
      if (
        Math.abs(x + 59) < 9 ||
        Math.abs(x - 56) < 9 ||
        (x > 3 && x < 15) ||
        app.GATE_CENTRAL
      )
        continue; // bản ghép: bỏ hàng ô tô con trước mặt nam, giữ xe công
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 4.8), slotM);
      sl.position.set(x - 1.65, -0.02, 45.9);
      siteG.add(sl);
      if (rnd() < 0.82)
        car(
          x,
          45.9,
          false,
          pick([
            0xffffff, 0xffffff, 0xe9ecef, 0xb7bec6, 0x2b2f36, 0xc8202a,
            0x2f6fd6, 0x8d959e,
          ]),
          pick(["sedan", "sedan", "suv", "pickup"]),
          -1,
        );
    }
  }
  // cổng chính ở lối vào giữa (đường x=10,5): hai trụ cổng, 2 thanh chắn kẻ đỏ-trắng, ô vàng trên mặt đường, nhà bảo vệ bên trái như ảnh thực tế
  if (!app.GATE_CENTRAL) {
    // (bản ghép đã bỏ cổng này)
    const gz = 82,
      wh = new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.7 }),
      red = new THREE.MeshStandardMaterial({ color: 0xd8262f, roughness: 0.5 }),
      yel = new THREE.MeshStandardMaterial({ color: 0xf0b400, roughness: 0.6 });
    const add = (g, m, x, y, z) => {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      siteG.add(o);
      return o;
    };
    for (const x of [5.6, 15.4]) {
      add(new THREE.BoxGeometry(0.7, 3.4, 0.7), wh, x, 1.7, gz);
      add(
        new THREE.BoxGeometry(0.9, 0.3, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x2e353d }),
        x,
        3.55,
        gz,
      );
    }
    for (const [x0, x1] of [
      [6.0, 10.3],
      [15.0, 10.8],
    ]) {
      const L = Math.abs(x1 - x0),
        n = 8;
      for (let i = 0; i < n; i++)
        add(
          new THREE.BoxGeometry(L / n, 0.14, 0.12),
          i % 2 ? wh : red,
          Math.min(x0, x1) + (L / n) * (i + 0.5),
          1.15,
          gz - 0.4,
        );
    }
    add(
      new THREE.BoxGeometry(0.3, 1.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x2e353d }),
      10.5,
      0.6,
      gz - 0.4,
    );
    for (let i = 0; i < 7; i++)
      add(
        new THREE.BoxGeometry(0.12, 0.02, 3.2),
        yel,
        6.6 + i * 1.3,
        -0.015,
        gz - 3.2,
      ); // ô vàng kẻ đường trước cổng
    add(new THREE.BoxGeometry(0.12, 0.02, 8.4), yel, 5.9, -0.015, gz - 3.2);
    add(new THREE.BoxGeometry(0.12, 0.02, 8.4), yel, 15.1, -0.015, gz - 3.2);
    add(new THREE.BoxGeometry(4.2, 3.0, 3.2), wh, 2.6, 1.5, gz);
    add(
      new THREE.BoxGeometry(4.6, 0.25, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x2e353d }),
      2.6,
      3.12,
      gz,
    ); // nhà bảo vệ
    add(
      new THREE.BoxGeometry(0.05, 1.1, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x2b3a4a, roughness: 0.2 }),
      4.72,
      1.75,
      gz,
    );
  }
  // vạch qua đường (zebra) + bồn hoa đỏ viền vỉa như ảnh
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 3.2), dashM);
    s.position.set(7 + i * 0.9, -0.02, 52);
    siteG.add(s);
  }
  for (const [x, z] of [
    [-26, 39.4],
    [-25, 39.8],
    [-27, 39.8],
    [-24, 39.4],
  ])
    TREES.push([x, z, 0.5, "flower"]);
  // (bản ghép) dải cỏ sát hàng rào phía nam (x 17…73, đoạn anh tô đỏ): xe con đỗ vuông góc đầu xe quay ra đường, cứ 3 xe lại 1 cây mỏng như ảnh thực tế
  if (app.GATE_CENTRAL) {
    const cc = [
      0xffffff, 0xffffff, 0xe9ecef, 0xb7bec6, 0x2b2f36, 0x8d959e, 0xc8202a,
      0x7a1f26, 0x2f6fd6,
    ];
    // đã chuyển lên dải cỏ phía đông (đoạn anh tô đen, z −33…40): xe đỗ vuông góc, đầu xe quay ra đường (hướng tây)
    // cứ 2 xe lại 1 cây mỏng; mỗi xe có 1 ô bê tông trắng, giữa các ô là dải cỏ (như ảnh thực tế)
    // đã bỏ xe con: thay bằng hàng cây dọc dải phía đông (z −33…40) + vệt cỏ dài sát hàng rào (chừa khe cổng z 38,8…53,2)
    // phía cổng (z 3…40) trả lại xe + cây mỏng như cũ; đoạn trong góc (z −33…0) là hàng cây
    for (let g = 0; g < 8; g++) {
      const z0 = -33 + g * 9;
      for (let k = 0; k < 2; k++) {
        const zc = z0 + k * 3.0;
        flat(99.4, zc - 1.25, 104.0, zc + 1.25, 0xe8e6e0, -0.004, 0.9);
        car(101.7, zc, true, pick(cc), pick(["sedan", "sedan", "suv"]), -1);
      }
      TREES.push([102.2, z0 + 6.0, 0.75, "slim"]);
    }
  }

  // tường rào ranh giới
  // hàng rào song sắt đen như ảnh phối cảnh: thanh đứng mỗi 1,4 m + 2 thanh ngang + trụ lớn mỗi 7 m
  {
    [
      [-114, -60, 104, -60],
      [-114, 112, app.GATE_CENTRAL ? 104 : 96, 112],
      [-114, -60, -114, 112],
      [104, -60, 104, 112],
    ].forEach(([a, b, c, d]) => {
      const alongX = b === d,
        L = alongX ? Math.abs(c - a) : Math.abs(d - b),
        n = Math.floor(L / 1.4);
      for (let i = 0; i <= n; i++) {
        const u = i / n,
          px = a + (c - a) * u,
          pz = b + (d - b) * u;
        if (
          app.GATE_CENTRAL &&
          a === 104 &&
          c === 104 &&
          pz > 38.8 &&
          pz < 53.2
        )
          continue;
        box("steelD", px, 1.1, pz, 0.05, 2.2, 0.05, 0x23282d);
        if (i % 5 === 0) box("steelD", px, 1.2, pz, 0.16, 2.4, 0.16, 0x23282d);
      }
      for (const y of [0.35, 2.05]) {
        if (app.GATE_CENTRAL && a === 104 && c === 104) {
          // bản ghép: hở hàng rào ở cổng (z 39,4…52,6), 2 đoạn thanh ngang còn lại
          box("steelD", 104, y, (b + 38.8) / 2, 0.06, 0.07, 38.8 - b, 0x23282d);
          box("steelD", 104, y, (53.2 + d) / 2, 0.06, 0.07, d - 53.2, 0x23282d);
        } else
          box(
            "steelD",
            (a + c) / 2,
            y,
            (b + d) / 2,
            alongX ? L : 0.06,
            0.07,
            alongX ? 0.06 : L,
            0x23282d,
          );
      }
    });
  }
  // cột đèn đường kiểu hiện đại (cần cong, đèn LED) dọc các trục đường chính
  const lamp = TNG.components.lamp({ box, cyl, sph });
  for (let x = -100; x <= 100; x += 24) lamp(x, 38.2, 0, 1);
  for (let x = -100; x <= 100; x += 24) lamp(x, -39.4, 0, -1);
  for (let z = app.GATE_CENTRAL ? 66 : 48; z <= 100; z += 18)
    lamp(8.5, z, -1, 0); // bản ghép: bỏ cột đèn cạnh vạch qua đường (z=48)
  // nhà bảo vệ ở cổng
  // ---------- cổng ra vào phía đông nam: khe hở hàng rào x 96…104 tại z=112 → trụ cổng, dầm biển, thanh chắn, cổng lùa mở, nhà bảo vệ, đường nối ra ngoài ----------
  if (!app.GATE_CENTRAL) {
    // (bản ghép 2 tầng đặt cổng ở đầu đường trục giữa thay vì khe hàng rào này)
    const GZ = 112,
      wh = new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.7 }),
      dk = new THREE.MeshStandardMaterial({
        color: 0x23282d,
        roughness: 0.5,
        metalness: 0.3,
      }),
      red = new THREE.MeshStandardMaterial({ color: 0xd8262f, roughness: 0.5 }),
      yel = new THREE.MeshStandardMaterial({ color: 0xf0b400, roughness: 0.6 });
    const add = (g, m, x, y, z) => {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      siteG.add(o);
      return o;
    };
    flat(93.5, 107, 106.5, 126, ASP);
    dashes(100, 105, 100, 126); // nối đường trong xưởng ra cổng; chừa trống cây quanh lối vào                                         // đường nối ra ngoài hàng rào
    for (const x of [95.6, 104.4]) {
      add(new THREE.BoxGeometry(1.0, 4.4, 1.0), wh, x, 2.2, GZ);
      add(new THREE.BoxGeometry(1.3, 0.3, 1.3), dk, x, 4.55, GZ);
    } // 2 trụ cổng
    add(new THREE.BoxGeometry(9.6, 1.0, 0.5), dk, 100, 4.6, GZ); // dầm biển phía trên
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#23282d";
    g.fillRect(0, 0, 1024, 128);
    g.fillStyle = "#fff";
    g.font = '700 58px "Be Vietnam Pro",sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("CỔNG CHÍNH · TNG VIỆT ĐỨC", 512, 66);
    const tx = new THREE.CanvasTexture(c);
    tx.encoding = THREE.sRGBEncoding;
    tx.anisotropy = 8;
    for (const s of [1, -1]) {
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(9.0, 0.9),
        new THREE.MeshBasicMaterial({ map: tx }),
      );
      p.position.set(100, 4.6, GZ + s * 0.27);
      if (s < 0) p.rotation.y = Math.PI;
      siteG.add(p);
    }
    for (const [x0, x1] of [
      [96.3, 99.6],
      [103.7, 100.4],
    ]) {
      const L = Math.abs(x1 - x0),
        n = 8; // 2 thanh chắn kẻ đỏ-trắng
      for (let i = 0; i < n; i++)
        add(
          new THREE.BoxGeometry(L / n, 0.14, 0.12),
          i % 2 ? wh : red,
          Math.min(x0, x1) + (L / n) * (i + 0.5),
          1.15,
          GZ - 1.2,
        );
    }
    add(new THREE.BoxGeometry(0.3, 1.2, 0.3), dk, 100, 0.6, GZ - 1.2);
    for (let i = 0; i < 6; i++)
      add(
        new THREE.BoxGeometry(0.12, 0.02, 3.2),
        yel,
        96.8 + i * 1.28,
        -0.015,
        GZ - 4.2,
      ); // ô vàng kẻ đường trước cổng
    // cánh cổng lùa đang mở (thu dọc hàng rào bên trái) + song sắt
    add(new THREE.BoxGeometry(3.6, 0.1, 0.1), dk, 93.8, 0.35, GZ);
    add(new THREE.BoxGeometry(3.6, 0.1, 0.1), dk, 93.8, 1.95, GZ);
    for (let i = 0; i <= 14; i++)
      add(
        new THREE.BoxGeometry(0.05, 1.7, 0.05),
        dk,
        92.0 + i * 0.257,
        1.15,
        GZ,
      );
    // nhà bảo vệ bên trái cổng
    add(new THREE.BoxGeometry(4.2, 3.2, 3.6), wh, 91.2, 1.6, GZ - 3.6);
    add(new THREE.BoxGeometry(4.7, 0.25, 4.1), dk, 91.2, 3.33, GZ - 3.6);
    add(
      new THREE.BoxGeometry(2.4, 1.1, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2b3a4a, roughness: 0.2 }),
      91.2,
      1.9,
      GZ - 1.78,
    );
  }

  // ---------- cổng chính ở đầu đường trục giữa (đường đi dưới cầu nối, giữa xưởng và nhà văn phòng), chỗ đường gặp đường lớn phía đông, như ảnh thực tế ----------
  if (app.GATE_CENTRAL) {
    // cổng ở hàng cây ngoài cùng (x≈102): chỉ là 2 thanh chắn trên 2 cột, ô vàng kẻ đường và nhà bảo vệ bên trái — không có biển tên (như ảnh thực tế)
    const GX = 101.8,
      z0 = 40.5,
      z1 = 51.5,
      zc = (z0 + z1) / 2;
    const wh = new THREE.MeshStandardMaterial({
        color: 0xf2f2ef,
        roughness: 0.7,
      }),
      dk = new THREE.MeshStandardMaterial({
        color: 0x4a5058,
        roughness: 0.5,
        metalness: 0.3,
      }),
      red = new THREE.MeshStandardMaterial({ color: 0xd8262f, roughness: 0.5 }),
      yel = new THREE.MeshStandardMaterial({ color: 0xf0b400, roughness: 0.6 });
    const add = (g, m, x, y, z) => {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      siteG.add(o);
      return o;
    };
    flat(99.4, z0 - 1.2, 114, z1 + 1.2, ASP, -0.003); // mặt đường cắt qua dải cây ngoài cùng
    for (const z of [z0 - 0.3, z1 + 0.3])
      add(new THREE.BoxGeometry(0.4, 1.3, 0.4), dk, GX, 0.65, z); // 2 cột thanh chắn
    for (const [a, b] of [
      [z0 + 0.1, zc - 0.35],
      [z1 - 0.1, zc + 0.35],
    ]) {
      const L = Math.abs(b - a),
        n = 8; // 2 thanh chắn kẻ đỏ-trắng
      for (let i = 0; i < n; i++)
        add(
          new THREE.BoxGeometry(0.1, 0.12, L / n),
          i % 2 ? wh : red,
          GX,
          1.15,
          Math.min(a, b) + (L / n) * (i + 0.5),
        );
    }
    add(new THREE.BoxGeometry(0.3, 1.2, 0.3), dk, GX, 0.6, zc);
    for (const z of [z0 + 1.2, z1 - 1.2])
      add(new THREE.BoxGeometry(5.2, 0.02, 0.12), yel, GX - 3.2, -0.001, z); // 2 vạch vàng dọc làn
    for (let i = 0; i < 5; i++)
      add(
        new THREE.BoxGeometry(0.14, 0.02, z1 - z0 - 2.2),
        yel,
        GX - 5.2 + i * 0.9,
        -0.001,
        zc,
      ); // các vạch vàng ngang trước cổng
    // nhà bảo vệ bên trái cổng (phía nam)
    add(new THREE.BoxGeometry(2.9, 3.2, 4.0), wh, GX + 0.2, 1.6, z1 + 3.6);
    add(new THREE.BoxGeometry(3.4, 0.25, 4.5), dk, GX + 0.2, 3.33, z1 + 3.6);
    add(
      new THREE.BoxGeometry(2.0, 1.1, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2b3a4a, roughness: 0.2 }),
      GX + 0.2,
      1.9,
      z1 + 1.58,
    );
  }

  // (bản ghép) góc đông nam: đóng kín hàng rào (đoạn nam kéo tới x=104) và phủ cỏ nốt dải cỏ ven hàng rào xuống tới góc
  if (app.GATE_CENTRAL) {
    flat(100.4, 106, 104, 112, LAWN, -0.015);
    flat(100.1, 106, 100.4, 112, 0xe9e6df, -0.01);
    flat(96, 109, 100.1, 112, LAWN, -0.015);
  }
  // (bản ghép) CHÒI HÚT THUỐC theo bản vẽ PDF: nửa trái mái ngói 4 mái, nửa phải giàn lam gỗ, 6 cột đen, nền bê tông chữ T viền bồn cỏ, đặt trên thảm cỏ tây nam giữa 2 cột đèn
  if (app.GATE_CENTRAL) {
    const gp = new THREE.Group();
    gp.position.set(3.7, 0.02, 69.4);
    gp.rotation.y = Math.PI / 2;
    gp.scale.setScalar(0.45);
    siteG.add(gp); // dời sang ô đỏ (dải cỏ hẹp sát đường), thu nhỏ vừa ô
    const L = 14,
      Wd = 7,
      M_ = (c, r) =>
        new THREE.MeshStandardMaterial({ color: c, roughness: r || 0.8 });
    const add = (g, m, x, y, z) => {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      gp.add(o);
      return o;
    };
    const conc = M_(0xcfd2d4, 0.9),
      curb = M_(0xf1f1ee, 0.7),
      grass = new THREE.MeshStandardMaterial({
        color: 0x5c9a3e,
        roughness: 1,
        map: loadTex("grass"),
      }),
      blk = M_(0x1d2024, 0.5),
      tile = M_(0x7d4a3c, 0.85),
      wood = M_(0x6b3b24, 0.7),
      dkw = M_(0x2a2d31, 0.5);
    add(new THREE.BoxGeometry(L, 0.1, Wd), conc, 0, 0.05, 0); // nền bê tông
    const bed = (x0, x1, z0, z1) => {
      const w = x1 - x0,
        d = z1 - z0,
        cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2;
      add(new THREE.BoxGeometry(w, 0.3, d), curb, cx, 0.15, cz);
      add(new THREE.BoxGeometry(w - 0.3, 0.04, d - 0.3), grass, cx, 0.31, cz);
    }; // bồn cỏ viền vỉa trắng
    bed(-7, 7, -3.5, -2.3);
    bed(-7, -5.8, -2.3, 2.3);
    bed(-7, -1.2, 2.3, 3.5);
    bed(1.2, 7, 2.3, 3.5); // 4 bồn: trên, trái, dưới-trái, dưới-phải (chừa lối vào giữa phía dưới)
    [
      [-6.5, -2.8],
      [-6.5, 2.8],
      [0, -2.8],
      [0, 2.8],
      [6.6, -2.8],
      [6.6, 2.8],
    ].forEach(([x, z]) =>
      add(new THREE.BoxGeometry(0.28, 3.2, 0.28), blk, x, 1.6, z),
    ); // 6 cột đen
    const hip = new THREE.ConeGeometry(5.55, 1.9, 4);
    hip.rotateY(Math.PI / 4);
    add(hip, tile, -3.5, 4.15, 0); // mái ngói 4 mái nửa trái
    add(new THREE.BoxGeometry(7.4, 0.15, 7.4), dkw, -3.5, 3.25, 0);
    for (let i = 0; i < 26; i++)
      add(
        new THREE.BoxGeometry(0.09, 0.14, 7.3),
        wood,
        0.3 + i * 0.265,
        3.3,
        0,
      ); // giàn lam gỗ nửa phải
    for (const z of [-2.0, 2.0])
      add(new THREE.BoxGeometry(7.2, 0.18, 0.18), dkw, 3.7, 3.18, z); // 2 xà đỡ lam
    add(
      new THREE.BoxGeometry(2.2, 0.45, 0.5),
      M_(0x8a6a4c, 0.7),
      -3.5,
      0.3,
      1.0,
    ); // ghế băng
  }
  // (bản ghép) bãi đỗ 30 ô vạch kẻ vàng xiên như ảnh thực tế (2 hàng × 15 ô, mỗi ô 2,5 × 6 m) trong vùng khoanh đỏ, phía đông hàng xe công
  if (app.GATE_CENTRAL) {
    const ym = new THREE.MeshStandardMaterial({
        color: 0xf0b400,
        roughness: 0.6,
      }),
      sh = 0; // 30 ô thẳng hàng (2 hàng × 15) cho công nhân tập hợp khi có cháy nổ
    [[55.0, 65.7]].forEach(([za, zb]) => {
      // kéo dài vạch tới sát mép cỏ (đường anh kẻ đen)   // 1 hàng ngang, 20 ô rộng 2,3 m
      for (let i = 0; i <= 20; i++) {
        const x0 = -38 + i * 2.3,
          L = Math.hypot(sh, zb - za),
          m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, L), ym);
        m.position.set(x0 + sh / 2, -0.012, (za + zb) / 2);
        m.rotation.y = -Math.atan2(sh, zb - za);
        siteG.add(m);
      }
      const e = new THREE.Mesh(new THREE.BoxGeometry(46 + sh, 0.02, 0.14), ym);
      e.position.set(-38 + (46 + sh) / 2, -0.012, zb);
      siteG.add(e); // vạch cuối ô
    });
  }
  // (bản ghép) đánh số 1–30 trên mặt sàn từng ô khu tập kết (hàng bắc 1–15, hàng nam 16–30, từ tây sang đông)
  if (app.GATE_CENTRAL) {
    [[60.3, 0]].forEach(([zc, off]) => {
      for (let i = 0; i < 20; i++) {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d");
        g.fillStyle = "#f0b400";
        g.font = '800 84px "Be Vietnam Pro",sans-serif';
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(String(off + i + 1), 64, 70);
        const tx = new THREE.CanvasTexture(c);
        tx.encoding = THREE.sRGBEncoding;
        tx.anisotropy = 8;
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(1.6, 1.6),
          new THREE.MeshBasicMaterial({
            map: tx,
            transparent: true,
            depthWrite: false,
          }),
        );
        m.rotation.x = -Math.PI / 2;
        m.position.set(-38 + i * 2.3 + 1.15, 0.0, zc);
        siteG.add(m);
      }
    });
  }
  // (bản ghép) thêm 1 hàng cây trong ô cỏ viền trắng dọc mặt đông xưởng, giữa vách kính và đường, như hàng cây mặt nam
  if (app.GATE_CENTRAL) {
    for (let z = -31; z <= 32; z += 7) {
      if (z === 4 || z === 11) continue;
      lawnCell(92.2, z - 2.6, 94.8, z + 2.6);
      TREES.push([93.5, z, 0.65 * (0.88 + rnd() * 0.28), "street"]);
      rnd();
      rnd();
    }
  } // bệ cỏ dời theo cây, cây ở chính giữa (không lệch ngẫu nhiên)   // đã bỏ 2 cây ở z=4 và z=11 theo yêu cầu; cây thu nhỏ (0,9→0,65) và dời ra mép ô cỏ (x 92,5→93,5) cho khỏi sát tường/hành lang

  // nhà phụ trợ: nhà xe dài phía bắc + khối văn phòng 3 tầng phía nam, nối với xưởng bằng cầu đi bộ
  const mWhite = new THREE.MeshStandardMaterial({
    color: 0xf6f7f5,
    roughness: 0.8,
  });
  const mRoof = new THREE.MeshStandardMaterial({
    color: 0x2aa4e0,
    roughness: 0.5,
    metalness: 0.15,
  });
  const mWin = new THREE.MeshStandardMaterial({
    color: 0x2b3a4a,
    roughness: 0.15,
    metalness: 0.3,
  });
  function block(x0, z0, x1, z1, H, winRows) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(x1 - x0, H, z1 - z0),
      mWhite,
    );
    b.position.set((x0 + x1) / 2, H / 2, (z0 + z1) / 2);
    b.castShadow = b.receiveShadow = true;
    siteG.add(b);
    const r = new THREE.Mesh(
      new THREE.BoxGeometry(x1 - x0 + 1.2, 0.4, z1 - z0 + 1.2),
      mRoof,
    );
    r.position.set((x0 + x1) / 2, H + 0.2, (z0 + z1) / 2);
    r.castShadow = true;
    siteG.add(r);
    for (let k = 0; k < (winRows || 0); k++) {
      const y = 2 + k * 3.4;
      for (const [zz, sgn] of [
        [z0, -1],
        [z1, 1],
      ]) {
        const w = new THREE.Mesh(
          new THREE.BoxGeometry(x1 - x0 - 2, 1.3, 0.1),
          mWin,
        );
        w.position.set((x0 + x1) / 2, y, zz + sgn * 0.05);
        siteG.add(w);
      }
      for (const [xx, sgn] of [
        [x0, -1],
        [x1, 1],
      ]) {
        const w = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1.3, z1 - z0 - 2),
          mWin,
        );
        w.position.set(xx + sgn * 0.05, y, (z0 + z1) / 2);
        siteG.add(w);
      }
    }
  }
  // phía bắc: chỉ còn 2 khối nhỏ — Nhà rác (đầu xa, phía tây) và Trạm bơm (đầu gần, phía đông); đoạn giữa để cỏ
  block(-94.5, -55, -79, -46, 4.5, 0);
  block(77.5, -55, 103, -46, 4.5, 0);
  flat(-79, -55, 77.5, -46, LAWN, -0.015);
  if (!app.GATE_CENTRAL) block(16, 60, 55.5, 102, 11, 3); // bản ghép: nhà ăn ca dựng riêng theo bản vẽ DWG (xem cant.js)
  // cầu nối đi bộ (ảnh PA6): dầm thép đen, sàn, lan can song sắt, mái lam gỗ, 2 cặp trụ đỡ
  {
    const bx = 34.5,
      z0 = 35,
      z1 = 60,
      zc = 47.5,
      len = z1 - z0,
      D = 0x2a2f35;
    box("steelD", bx, 5.0, zc, 6.2, 0.4, len, D);
    for (const s of [-1, 1]) {
      box("steelD", bx + s * 3.0, 6.05, zc, 0.1, 0.08, len, D);
      for (let z = z0 + 0.5; z < z1; z += 0.6)
        box("steelD", bx + s * 3.0, 5.6, z, 0.04, 0.8, 0.04, D);
    }
    for (let z = z0 + 0.3; z < z1; z += 0.55)
      box("wood", bx, 7.75, z, 7.0, 0.08, 0.28, 0xb5714a);
    for (const z of [z0 + 1, zc - 6, zc, zc + 6, z1 - 1])
      for (const s of [-1, 1])
        box("steelD", bx + s * 3.1, 6.4, z, 0.2, 2.8, 0.2, D);
    for (const s of [-1, 1])
      box("steelD", bx + s * 3.1, 7.8, zc, 0.2, 0.2, len, D);
    for (const z of [zc - 4, zc + 4])
      for (const s of [-1, 1])
        box("steelD", bx + s * 2.6, 2.4, z, 0.5, 4.8, 0.5, D);
    // bảng LED "CHI NHÁNH MAY VIỆT ĐỨC" gắn dọc 2 bên lan can cầu nối (chữ LED vàng cam, nền đen, có lưới chấm)
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#07090c";
    g.fillRect(0, 0, 2048, 128);
    g.fillStyle = "#ffb347";
    g.font = '700 84px "Be Vietnam Pro",sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("CHI NHÁNH MAY VIỆT ĐỨC", 1024, 70);
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = "rgba(0,0,0,0.55)";
    for (let x = 0; x < 2048; x += 6) {
      g.fillRect(x, 0, 1.6, 128);
    }
    for (let y = 0; y < 128; y += 6) {
      g.fillRect(0, y, 2048, 1.6);
    }
    const tx = new THREE.CanvasTexture(c);
    tx.encoding = THREE.sRGBEncoding;
    tx.anisotropy = 8;
    const ledM = new THREE.MeshBasicMaterial({
      map: tx,
      transparent: true,
      toneMapped: false,
    });
    if (app.GATE_CENTRAL) {
      tx.wrapS = THREE.RepeatWrapping;
      ledTexture = tx;
    }
    for (const s of [-1, 1]) {
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.95, 16.6),
        new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.5 }),
      );
      back.position.set(bx + s * (app.GATE_CENTRAL ? 3.45 : 3.12), 5.62, zc);
      siteG.add(back);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(16.2, 0.9), ledM);
      p.position.set(bx + s * (app.GATE_CENTRAL ? 3.52 : 3.19), 5.62, zc);
      p.rotation.y = (s * Math.PI) / 2;
      siteG.add(p);
    }
  }

  // ---------- vỏ xưởng: mái tôn xanh 2 dốc + dải kính lấy sáng, mặt dựng khung thép đen + kính (hiện ở chế độ Ngoại cảnh) ----------
  const extGroup = new THREE.Group();
  extGroup.visible = false;
  scene.add(extGroup);
  {
    const x0 = X(BX0),
      x1 = X(BX1),
      z0 = Z(BY0),
      z1 = Z(BY1),
      L = x1 - x0,
      Wd = z1 - z0,
      EH = 10.5,
      RH = 14.2,
      cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const mPanel = new THREE.MeshStandardMaterial({
      color: 0xf3f5f6,
      roughness: 0.75,
    });
    const mGlassF = new THREE.MeshPhysicalMaterial({
      color: 0x8fb6cc,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.62,
    });
    const mSteel = new THREE.MeshStandardMaterial({
      color: 0x1d2329,
      roughness: 0.5,
      metalness: 0.4,
    });
    const add = (g, m, x, y, z) => {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      extGroup.add(o);
      return o;
    };
    // mặt dọc bắc & nam: chân tường trắng có ô cửa, phần trên kính
    for (const [z, s] of [
      [z0, -1],
      [z1, 1],
    ]) {
      // mặt nam: chừa 2 cửa bốc hàng (x −62,5…−55 và 52,5…60) cho xe container lùi vào; chân tường chỉ cao 3,6 m phía trên cửa
      const gaps =
          s === 1
            ? [
                [-62.5, -55],
                [52.5, 60],
              ]
            : [],
        inGap = (x) => gaps.some(([a, b]) => x > a - 0.2 && x < b + 0.2);
      let cur = x0;
      [...gaps, [x1, x1]].forEach(([a, b]) => {
        if (a > cur)
          add(
            new THREE.BoxGeometry(a - cur, 4.6, 0.3),
            mPanel,
            (cur + a) / 2,
            2.3,
            z + s * 0.2,
          );
        cur = b;
      });
      gaps.forEach(([a, b]) =>
        add(
          new THREE.BoxGeometry(b - a, 1.0, 0.3),
          mPanel,
          (a + b) / 2,
          4.1,
          z + s * 0.2,
        ),
      );
      add(
        new THREE.BoxGeometry(L, EH - 4.6, 0.12),
        mGlassF,
        cx,
        4.6 + (EH - 4.6) / 2,
        z + s * 0.25,
      );
      for (let x = x0; x <= x1 + 0.1; x += 5.75)
        if (!inGap(x))
          add(
            new THREE.BoxGeometry(0.35, EH + 0.3, 0.45),
            mSteel,
            x,
            (EH + 0.3) / 2,
            z + s * 0.35,
          );
      for (const y of [4.6, 7.6, EH])
        add(new THREE.BoxGeometry(L, 0.22, 0.4), mSteel, cx, y, z + s * 0.35);
      for (let x = x0 + 3; x < x1 - 3; x += 11.5)
        add(new THREE.BoxGeometry(2.4, 1.4, 0.1), mWin, x, 2.6, z + s * 0.37);
    }
    // hai đầu hồi: kính khung thép, tam giác hồi
    for (const [x, s] of [
      [x0, -1],
      [x1, 1],
    ]) {
      add(new THREE.BoxGeometry(0.3, 4.6, Wd), mPanel, x + s * 0.2, 2.3, cz);
      add(
        new THREE.BoxGeometry(0.12, EH - 4.6, Wd),
        mGlassF,
        x + s * 0.25,
        4.6 + (EH - 4.6) / 2,
        cz,
      );
      for (let z = z0; z <= z1 + 0.1; z += 4.9)
        add(
          new THREE.BoxGeometry(0.45, EH + 0.3, 0.35),
          mSteel,
          x + s * 0.35,
          (EH + 0.3) / 2,
          z,
        );
      const sh = new THREE.Shape();
      sh.moveTo(-Wd / 2, 0);
      sh.lineTo(Wd / 2, 0);
      sh.lineTo(0, RH - EH);
      sh.lineTo(-Wd / 2, 0);
      const tri = add(
        new THREE.ExtrudeGeometry(sh, { depth: 0.25, bevelEnabled: false }),
        mPanel,
        x + s * 0.1,
        EH,
        cz,
      );
      tri.rotation.y = Math.PI / 2;
    }
    // mái 2 dốc
    const half = Wd / 2 + 1.2,
      slope = Math.hypot(half, RH - EH),
      ang = Math.atan2(RH - EH, half);
    for (const s of [-1, 1]) {
      const r = add(
        new THREE.BoxGeometry(L + 2.4, 0.3, slope),
        mRoof,
        cx,
        (EH + RH) / 2,
        cz + (s * half) / 2,
      );
      r.rotation.x = s * ang;
      if (app.GATE_CENTRAL) {
        // pin năng lượng mặt trời: 2 dải tấm trên mỗi mái dốc, phía thấp (cách đỉnh nóc), chiếm ~62% chiều dài từ đầu tây
        if (!app.solarTex) {
          const c = document.createElement("canvas");
          c.width = c.height = 128;
          const g = c.getContext("2d");
          g.fillStyle = "#16275a";
          g.fillRect(0, 0, 128, 128);
          g.strokeStyle = "#8fa3d6";
          g.lineWidth = 2;
          g.strokeRect(1, 1, 126, 126);
          g.lineWidth = 1;
          g.strokeStyle = "#2c4488";
          for (let i = 1; i < 4; i++) {
            g.beginPath();
            g.moveTo(i * 32, 0);
            g.lineTo(i * 32, 128);
            g.stroke();
            g.beginPath();
            g.moveTo(0, i * 32);
            g.lineTo(128, i * 32);
            g.stroke();
          }
          const t = new THREE.CanvasTexture(c);
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.encoding = THREE.sRGBEncoding;
          app.solarTex = t;
        }
        const pw = L * 0.62,
          x0 = -(L + 2.4) / 2 + 4;
        [
          [3, 10],
          [11.5, 19.5],
        ].forEach(([d0, d1]) => {
          const tx = app.solarTex.clone();
          tx.needsUpdate = true;
          tx.repeat.set(pw / 1.7, (d1 - d0) / 1.1);
          const p = new THREE.Mesh(
            new THREE.PlaneGeometry(pw, d1 - d0),
            new THREE.MeshStandardMaterial({
              map: tx,
              roughness: 0.25,
              metalness: 0.5,
            }),
          );
          p.rotation.x = -Math.PI / 2;
          p.position.set(x0 + pw / 2, 0.17, s * (slope / 2 - (d0 + d1) / 2));
          r.add(p);
        });
      }
      // dải kính lấy sáng dọc nóc (phối cảnh trang 1)
      const sk = add(
        new THREE.BoxGeometry(110, 0.12, 8.5),
        new THREE.MeshPhysicalMaterial({
          color: 0x2e4a5c,
          roughness: 0.1,
          metalness: 0.3,
          transparent: true,
          opacity: 0.85,
        }),
        9,
        0,
        cz + s * 4.4,
      );
      sk.rotation.x = s * ang;
      sk.position.y = RH - (4.4 / half) * (RH - EH) + 0.4;
    }
    add(new THREE.BoxGeometry(L + 2.4, 0.5, 0.8), mSteel, cx, RH + 0.1, cz);
    // biển chữ TNG trên mặt kính phía nam, cạnh cầu nối
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 192;
    const g = c.getContext("2d");
    g.fillStyle = "#1f5fd6";
    g.font = 'italic 800 150px "Be Vietnam Pro",sans-serif';
    g.textBaseline = "middle";
    g.fillText("TNG", 20, 100);
    const tx = new THREE.CanvasTexture(c);
    tx.encoding = THREE.sRGBEncoding;
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 3.4),
      new THREE.MeshBasicMaterial({ map: tx, transparent: true }),
    );
    sign.position.set(22, 7.4, z1 + 0.5);
    extGroup.add(sign);
  }
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(M(BX1 - BX0), 0.1, M(BY1 - BY0)),
    new THREE.MeshStandardMaterial({
      color: C.floor,
      roughness: 0.45,
      metalness: 0.05,
    }),
  );
  floor.position.set(X((BX0 + BX1) / 2), -0.05, Z((BY0 + BY1) / 2));
  floor.receiveShadow = true;
  scene.add(floor);

  // zone floor tints
  const ZONES = [
    {
      id: "knl",
      n: 1,
      name: "Kho nguyên liệu",
      d: "Vải cuộn trên kệ pallet, dãy J–K–L",
      col: "#2b5fb4",
      r: [155700, BY0, 207500, 96500],
      lab: [181500, 82000],
      cam: [40, 0, -0.4],
    },
    {
      id: "kpl",
      n: 7,
      name: "Kho phụ liệu",
      d: "Kệ tôn nhiều tầng 10 dãy A–J (theo bản hoàn công), bảng thông tin đầu dãy",
      col: "#d6336c",
      r: [KPL.x0, KPL.y0, KPL.x1, KPL.y1],
      lab: [197500, 107000],
      cam: [22, 0, 0.5],
    },
    {
      id: "cat",
      n: 2,
      name: "Nhà cắt",
      d: "Bàn trải vải, máy cắt tự động, ép mex",
      col: "#2f8f6a",
      r: [115800, BY0, 155700, BY1],
      lab: [136000, 80000],
      cam: [34, 0, 0.45],
    },
    {
      id: "pc",
      n: 3,
      name: "Khu phân sai, phân cỡ",
      d: "Kệ trắng chia bán thành phẩm theo cỡ",
      col: "#7a52b8",
      r: [81000, BY0, 115800, 77300],
      lab: [102500, 66500],
      cam: [30, 0, 0.8],
    },
    {
      id: "say",
      n: 4,
      name: "Phòng sấy · dò kim",
      d: "2 phòng sấy kính lớn, 1 phòng nhỏ, máy dò kim",
      col: "#c4532f",
      r: [81000, 77300, 115800, 92500],
      lab: [103000, 85000],
      cam: [28, 0, 0.6],
    },
    {
      id: "ht",
      n: 5,
      name: "Tổ hoàn thiện · gấp gói",
      d: "5 bàn gấp gói, thùng carton đóng hàng",
      col: "#d08a00",
      r: [81000, 92500, 115800, 112500],
      lab: [100500, 102500],
      cam: [30, 0, 0.5],
    },
    {
      id: "ktp",
      n: 6,
      name: "Kho thành phẩm",
      d: "Kệ pallet chứa thùng hàng chờ xuất",
      col: "#1f7f8f",
      r: [BX0, BY0, 81000, 112500],
      lab: [57000, 86000],
      cam: [42, 0, 0.35],
    },
  ];
  const EXTRA = [
    { name: "Bốc công", pos: [64250, 117500], r: [58700, 112500, 69800, BY1] },
    {
      name: "Bốc công",
      pos: [179150, 117500],
      r: [173700, 112500, 184600, BY1],
    },
    { name: "Phòng bắn mác", pos: [98500, 54600] },
    { name: "Thang lên tầng 2", pos: [210600, 112000] },
    { name: "Phòng LAB", pos: [209400, 57700] },
    { name: "Phòng mac", pos: [209400, 67700] },
    { name: "Phòng seam", pos: [209400, 78600] },
    { name: "Phòng cắt chun", pos: [209400, 88400] },
    { name: "Phòng bảo quản lông vũ", pos: [201900, 54900] },
    { name: "WC", pos: [77300, 54900] },
    { name: "WC", pos: [165600, 54900] },
    { name: "Phòng kiểm hàng", pos: [55700, 115000] },
    { name: "Phòng kiểm hàng", pos: [55700, 120100] },
    { name: "Phòng kiểm hàng", pos: [75500, 120100] },
    { name: "Phòng khách hàng", pos: [100300, 120200] },
    { name: "Phòng bảo quản in thêu", pos: [131000, 120100] },
    { name: "Phòng điện", pos: [145400, 120100] },
    { name: "Cắt vòng", pos: [119500, 59800] },
    { name: "Cắt vòng", pos: [119500, 65000] },
    { name: "Ép mex", pos: [118300, 67600] },
    { name: "Cộp nhiệt", pos: [118400, 82600] },
    { name: "Máy cắt TĐ", pos: [128600, 65600] },
    { name: "Máy cắt TĐ", pos: [128600, 75000] },
    { name: "Máy cắt TĐ", pos: [128600, 86200] },
    { name: "Máy cắt TĐ", pos: [128600, 94700] },
    { name: "Bàn sang dấu", pos: [145000, 100800] },
    { name: "Bàn kiểm bán", pos: [145000, 108100] },
    { name: "KV nén khí", pos: [57350, 55000] },
  ];
  // sàn kho phụ liệu: bê tông xám mài bóng như ảnh thực tế
  {
    const f = new THREE.Mesh(
      new THREE.BoxGeometry(M(KPL.x1 - KPL.x0), 0.012, M(KPL.y1 - KPL.y0)),
      new THREE.MeshStandardMaterial({
        color: C.kplFloor,
        roughness: 0.35,
        metalness: 0.05,
      }),
    );
    f.position.set(X((KPL.x0 + KPL.x1) / 2), 0.004, Z((KPL.y0 + KPL.y1) / 2));
    f.receiveShadow = true;
    scene.add(f);
  }

  // yellow floor lines around rack/table blocks (as in the photos)
  const lineMat = new THREE.MeshStandardMaterial({
    color: C.line,
    roughness: 0.6,
  });
  function outline(x0, y0, x1, y1) {
    const t = 0.24,
      w = M(x1 - x0),
      h = M(y1 - y0),
      cx = X((x0 + x1) / 2),
      cz = Z((y0 + y1) / 2);
    [
      [cx, Z(y0), w, t],
      [cx, Z(y1), w, t],
      [X(x0), cz, t, h],
      [X(x1), cz, t, h],
    ].forEach(([x, z, sx, sz]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.012, sz), lineMat);
      l.position.set(x, 0.008, z);
      l.receiveShadow = true;
      scene.add(l);
    });
  }
  knlY.forEach((y, i) => {
    if (i % 2 === 0) {
      outline(159300, y - 400, 181100, y + 4700);
      outline(184300, y - 400, 203900, y + 4700);
    }
  });
  outline(159300, 99200, 181100, 104300);
  [
    [60450, 64600],
    [68150, 72300],
    [75150, 78600],
    [82300, 85750],
    [89950, 94400],
    [98050, 101500],
    [105050, 108500],
  ].forEach(([a, b]) => {
    outline(36650, a - 400, 59150, b + 400);
    outline(62300, a - 400, 79350, b + 400);
  });
  ct.forEach(([x0, yc]) => outline(x0 - 400, yc - 1500, 150400, yc + 1500));
  outline(92750, 60000, 115950, 75500);
  // main aisle line

  // walls
  const wallGroup = new THREE.Group();
  scene.add(wallGroup);
  const mWall = new THREE.MeshStandardMaterial({
    color: C.wall,
    roughness: 0.9,
  });
  const mCap = new THREE.MeshStandardMaterial({
    color: C.wallCap,
    roughness: 0.8,
  });
  const mGlass = new THREE.MeshPhysicalMaterial({
    color: 0xa9c7c4,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const mFence = new THREE.MeshStandardMaterial({
    color: 0x9aa3ab,
    roughness: 0.6,
    transparent: true,
    opacity: 0.55,
  });
  const mFrame = new THREE.MeshStandardMaterial({
    color: 0x5d6670,
    roughness: 0.6,
  });
  // mọi vách đặc chuyển thành vách kính: tấm kính mờ xanh nhạt + khung nhôm sẫm (đỉnh, chân, đố đứng ~2,4 m)
  walls.forEach(([x, y, w, h, H, kind]) => {
    const glass = kind !== "fence";
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(M(w), H, M(h)),
      glass ? mGlass : mFence,
    );
    mesh.position.set(X(x + w / 2), H / 2, Z(y + h / 2));
    wallGroup.add(mesh);
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(M(w) + 0.04, 0.07, M(h) + 0.04),
      glass ? mCap : mFrame,
    );
    cap.position.set(X(x + w / 2), H + 0.035, Z(y + h / 2));
    wallGroup.add(cap);
    if (!glass) return;
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(M(w) + 0.04, 0.12, M(h) + 0.04),
      mCap,
    );
    sill.position.set(X(x + w / 2), 0.06, Z(y + h / 2));
    wallGroup.add(sill);
    const alongX = w >= h,
      L = M(alongX ? w : h),
      n = Math.max(1, Math.round(L / 2.4));
    for (let i = 0; i <= n; i++) {
      const u = -L / 2 + (L * i) / n;
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(alongX ? 0.06 : 0.1, H, alongX ? 0.1 : 0.06),
        mCap,
      );
      p.position.set(
        X(x + w / 2) + (alongX ? u : 0),
        H / 2,
        Z(y + h / 2) + (alongX ? 0 : u),
      );
      wallGroup.add(p);
    }
  });
  // ---------- cửa: đặt vào mọi chỗ vách để hở trên bản vẽ hoàn công + cửa đi của các phòng nhỏ ----------
  // door(x0,y0,x1,y1,kind): đoạn cửa trong toạ độ bản vẽ (mm), nằm trên một vách ngang hoặc dọc
  //   'roll' = cửa cuốn xám nửa mở cho xe nâng · 'swing' = cửa kính 2 cánh khung sẫm · 'single' = cửa 1 cánh
  const mDoorFrame = new THREE.MeshStandardMaterial({
    color: 0x2e353d,
    roughness: 0.5,
    metalness: 0.3,
  });
  const mDoorGlass = new THREE.MeshPhysicalMaterial({
    color: 0x7fb2c9,
    roughness: 0.08,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const mRoll = new THREE.MeshStandardMaterial({
    color: 0x8e98a3,
    roughness: 0.45,
    metalness: 0.5,
  });
  const mHaz = new THREE.MeshStandardMaterial({
    color: 0xf0a800,
    roughness: 0.5,
  });
  function door(x0, y0, x1, y1, kind) {
    const alongX = y0 === y1,
      L = M(alongX ? x1 - x0 : y1 - y0),
      cx = X((x0 + x1) / 2),
      cz = Z((y0 + y1) / 2),
      H = kind === "roll" ? WALLH : 2.3;
    const add = (m, sx, sy, sz, u, y, v) => {
      const o = new THREE.Mesh(
        new THREE.BoxGeometry(alongX ? sx : sz, sy, alongX ? sz : sx),
        m,
      );
      o.position.set(cx + (alongX ? u : v), y, cz + (alongX ? v : u));
      wallGroup.add(o);
      return o;
    };
    for (const s of [-1, 1])
      add(mDoorFrame, 0.12, H, 0.2, s * (L / 2 - 0.06), H / 2, 0);
    add(mDoorFrame, L, 0.14, 0.2, 0, H - 0.07, 0);
    if (kind === "roll") {
      add(mRoll, L - 0.1, 0.5, 0.3, 0, H - 0.4, 0); // hộp cuốn
      add(mRoll, L - 0.24, 1.0, 0.06, 0, H - 1.1, 0); // lá cửa hạ nửa chừng
      for (const s of [-1, 1])
        add(mHaz, 0.18, 0.9, 0.18, s * (L / 2 + 0.25), 0.45, 0.45); // cột chắn vàng
      add(mHaz, L, 0.012, 0.35, 0, 0.012, 0); // vạch vàng ngưỡng cửa
    } else {
      const n = kind === "single" ? 1 : 2,
        lw = (L - 0.24) / n;
      for (let i = 0; i < n; i++) {
        const u = -L / 2 + 0.12 + lw * (i + 0.5);
        add(mDoorGlass, lw - 0.04, H - 0.2, 0.05, u, (H - 0.14) / 2, 0.06);
        add(mDoorFrame, lw - 0.04, 0.08, 0.07, u, 0.04, 0.06);
        add(
          mDoorFrame,
          0.05,
          0.35,
          0.07,
          u + (i ? -1 : 1) * (lw / 2 - 0.12),
          1.05,
          0.1,
        );
      } // tay nắm
    }
  }
  // chỗ hở trên vách theo bản vẽ → cửa
  door(81000, 73000, 81000, 78500, "roll");
  door(81000, 95000, 81000, 99500, "roll"); // trục 5: kho thành phẩm ↔ khối giữa
  door(115800, 57000, 115800, 61000, "roll");
  door(115800, 96000, 115800, 100500, "roll"); // trục 8: khối giữa ↔ nhà cắt
  door(90500, 77300, 92800, 77300, "swing");
  door(88000, 92500, 91500, 92500, "swing"); // phòng dò kim
  door(96000, 112500, 100000, 112500, "roll"); // tổ hoàn thiện ra hành lang nam
  door(155700, 96500, 155700, 101500, "roll"); // nhà cắt ↔ kho nguyên liệu (lối xe nâng)
  // cửa đi các phòng nhỏ
  door(62200, 112500, 64000, 112500, "single");
  door(177200, 112500, 179000, 112500, "single"); // 2 phòng bốc công
  door(56400, 57300, 58200, 57300, "single"); // KV nén khí
  door(207650, 59200, 207650, 63100, "swing"); // Phòng LAB
  door(207650, 69050, 207650, 76150, "swing"); // Phòng mac ↔ seam (cửa rộng 7 m)
  door(208300, 95720, 208300, 98820, "swing"); // lối ra khu phía đông
  door(97500, 57200, 99000, 57200, "single"); // Phòng bắn mác
  door(198343, 57200, 199843, 57200, "single");
  door(205279, 57200, 206729, 57200, "single"); // Phòng bảo quản lông vũ
  door(52600, 112350, 52600, 114200, "single");
  door(52600, 117980, 52600, 119500, "single"); // 2 phòng kiểm hàng
  // cửa các ngăn WC
  [
    [72800, 77700, 81800],
    [161500, 165650, 170550],
  ].forEach(([a, m, b]) => {
    door(a + 1800, 57200, a + 2900, 57200, "single");
    door(m + 1800, 57200, m + 2900, 57200, "single");
  });
  stairs.forEach(([a, b, c, d]) => {
    const m = (a + c) / 2,
      y = b === BY0 ? BY0 : BY1;
    door(m - 1000, y, m + 1000, y, "swing");
  }); // cửa chân buồng thang mặt bắc & nam
  // cửa cuốn 2 cửa bốc hàng mặt nam: kéo lên hết cho xe lùi vào
  [
    [60500, 68000],
    [175500, 183000],
  ].forEach(([a, b]) => {
    const d = new THREE.Mesh(
      new THREE.BoxGeometry(M(b - a), 0.5, 0.3),
      new THREE.MeshStandardMaterial({
        color: 0x5d6a78,
        roughness: 0.5,
        metalness: 0.4,
      }),
    );
    d.position.set(X((a + b) / 2), 2.35, Z(BY1));
    wallGroup.add(d);
  });

  // south façade window band markers
  // stair cores
  const mStair = new THREE.MeshStandardMaterial({
    color: 0xcfd4d8,
    roughness: 0.8,
  });
  stairs.forEach(([a, b, c, d]) => {
    const w = M(c - a),
      h = M(d - b),
      n = 10;
    for (let i = 0; i < n; i++) {
      const s = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.45, 0.18 * (i + 1), h / n),
        mStair,
      );
      s.position.set(
        X(a) + w * 0.27,
        0.09 * (i + 1),
        Z(b) + (h * (i + 0.5)) / n,
      );
      s.castShadow = true;
      s.receiveShadow = true;
      wallGroup.add(s);
      const s2 = s.clone();
      s2.position.x = X(a) + w * 0.73;
      s2.position.z = Z(d) - (h * (i + 0.5)) / n;
      wallGroup.add(s2);
    }
  });

  // columns
  const colGeo = new THREE.BoxGeometry(0.6, 4.7, 0.6),
    colMat = new THREE.MeshStandardMaterial({ color: C.col, roughness: 0.85 });
  const colMesh = new THREE.InstancedMesh(
    colGeo,
    colMat,
    GX.length * GY.length,
  );
  let ci = 0;
  const tmp = new THREE.Object3D();
  GX.forEach((gx) =>
    GY.forEach((gy) => {
      tmp.position.set(X(gx), 2.35, Z(gy));
      tmp.scale.set(1, 1, 1);
      tmp.updateMatrix();
      colMesh.setMatrixAt(ci++, tmp.matrix);
    }),
  );
  colMesh.count = ci;
  colMesh.castShadow = true;
  colMesh.receiveShadow = true;
  scene.add(colMesh);
  // red sprinkler mains & ceiling beam hints at column tops (kept light so the inside stays visible)
  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0xc8322b,
    roughness: 0.5,
  });
  GY.forEach((gy, i) => {
    if (i % 2) return;
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, M(BX1 - BX0), 8),
      pipeMat,
    );
    p.rotation.z = Math.PI / 2;
    p.position.set(X((BX0 + BX1) / 2), 4.3, Z(gy) + 0.6);
    scene.add(p);
  });

  // build instanced meshes
  const MATS = {
    rackBlue: { color: C.rackBlue, r: 0.5, m: 0.3 },
    beam: { color: C.beam, r: 0.5, m: 0.2 },
    roll: { r: 0.85 },
    carton: { r: 0.9 },
    bag: { r: 0.85 },
    steelWhite: { color: C.steelWhite, r: 0.5, m: 0.25 },
    cloth: { r: 0.95 },
    table: { r: 0.45 },
    leg: { r: 0.4, m: 0.1 },
    paper: { r: 0.9 },
    machine: { r: 0.45, m: 0.15 },
    cutterBed: { r: 0.7 },
    accent: { r: 0.5 },
    crate: { r: 0.6 },
    legs: { r: 0.8 },
    body: { r: 0.8 },
    head: { r: 0.7 },
    hair: { r: 0.9 },
    galv: { color: 0xc3c9cf, r: 0.4, m: 0.55 },
    galvShelf: { color: 0xb4bbc2, r: 0.45, m: 0.5 },
    board: { r: 0.6 },
    boardRed: { r: 0.6 },
    guard: { r: 0.5 },
    tree: { r: 0.9 },
    trunk: { r: 0.9 },
    car: { r: 0.35, m: 0.3 },
    glassDark: { r: 0.2 },
    roofB: { r: 0.5, m: 0.2 },
  };
  batch.build(scene, MATS, { shadow: (key) => key !== "paper" });

  // ---------- cây xanh thực tế ----------
  // tán = nhiều cụm lá (khối cầu méo, tô sáng trên – tối dưới) chồng lệch tâm, thân thon màu nâu; mỗi cây có sắc xanh riêng
  (function buildTrees() {
    const g = new THREE.IcosahedronGeometry(1, 2),
      pa = g.attributes.position,
      cl = new Float32Array(pa.count * 3);
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i),
        y = pa.getY(i),
        z = pa.getZ(i);
      const n =
        1 +
        0.16 * Math.sin(x * 4.1 + y * 2.3) * Math.cos(z * 3.7 - y * 1.9) +
        0.09 * Math.sin(x * 9 + z * 7 + y * 5);
      pa.setXYZ(i, x * n, y * n, z * n);
      const sh =
        0.58 +
        0.42 * Math.min(1, Math.max(0, (y + 1) / 2)) +
        0.07 * Math.sin(x * 13 + z * 11);
      cl[i * 3] = cl[i * 3 + 1] = cl[i * 3 + 2] = sh;
    }
    g.setAttribute("color", new THREE.BufferAttribute(cl, 3));
    g.computeVertexNormals();
    // sắc tô nhân với ảnh lá thật (ảnh lá đã tối nên màu tô sáng hơn bình thường)
    const GREENS = [
      0xa6cc94, 0x98c487, 0xb4d79e, 0x8fbb82, 0xa9cf98, 0x9dc58c, 0xbddca6,
    ];
    const blobs = [],
      trunks = [],
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      m4 = new THREE.Matrix4(),
      v = new THREE.Vector3(),
      sc = new THREE.Vector3(),
      col = new THREE.Color();
    const blob = (x, y, z, sx, sy, sz, ry, rx, c, br) =>
      blobs.push([x, y, z, sx, sy, sz, ry || 0, rx || 0, c, br || 1]);
    TREES.forEach(([x, z, s, kind]) => {
      const tint = GREENS[Math.floor(rnd() * GREENS.length)],
        pickG = () =>
          rnd() < 0.55 ? tint : GREENS[Math.floor(rnd() * GREENS.length)];
      if (kind === "flower") {
        // bồn hoa đỏ trên nền bụi xanh
        blob(x, 0.3, z, 0.55, 0.3, 0.55, 0, 0, 0x7fb85a);
        for (let k = 0; k < 6; k++)
          blob(
            x + (rnd() - 0.5) * 0.7,
            0.5 + rnd() * 0.12,
            z + (rnd() - 0.5) * 0.7,
            0.2,
            0.16,
            0.2,
            0,
            0,
            pick([0xd8262f, 0xe23b3b, 0xc81e2a]),
          );
        return;
      }
      if (kind === "shrub") {
        for (let k = 0; k < 4; k++) {
          const a = rnd() * 6.28,
            r = rnd() * 0.7 * s;
          blob(
            x + Math.cos(a) * r,
            0.45 * s + rnd() * 0.2,
            z + Math.sin(a) * r,
            0.7 * s,
            0.55 * s,
            0.7 * s,
            rnd() * 6,
            0,
            pickG(),
          );
        }
        return;
      }
      if (kind === "palm") {
        const h = 5.2 + rnd() * 1.6,
          lean = (rnd() - 0.5) * 0.5;
        trunks.push([x, 0, z, 0.17 * s, h * s, lean, 0, 0x7a6a54]);
        const cx = x - Math.sin(lean) * h * s,
          cy = Math.cos(lean) * h * s,
          ang0 = rnd() * 6.28;
        const PG = [0x4fa83a, 0x5db843, 0x3f9a35, 0x68c04b];
        for (let k = 0; k < 13; k++) {
          // mỗi lá cọ = 4 đoạn cong vòm rồi rủ xuống
          const a = ang0 + k * 0.483 + (rnd() - 0.5) * 0.15,
            lift = k % 2 ? 0.12 : 0,
            c = PG[Math.floor(rnd() * PG.length)];
          [
            [0.55, 0.18, 0.45],
            [1.2, 0.4, 0.2],
            [1.9, 0.38, -0.22],
            [2.5, 0.12, -0.6],
          ].forEach(([r, dy, tl], i) =>
            blob(
              cx + Math.cos(a) * r * s,
              cy + (dy + lift) * s,
              z + Math.sin(a) * r * s,
              0.42 * s,
              0.05 * s,
              0.3 * s * (1 - 0.14 * i),
              -a,
              tl,
              c,
              2.2,
            ),
          );
        }
        blob(cx, cy + 0.05, z, 0.4 * s, 0.3 * s, 0.4 * s, 0, 0, 0x7a6a3a);
        for (let k = 0; k < 3; k++)
          blob(
            cx + (rnd() - 0.5) * 0.4,
            cy - 0.25,
            z + (rnd() - 0.5) * 0.4,
            0.14 * s,
            0.14 * s,
            0.14 * s,
            0,
            0,
            0x8a5a2a,
          );
        return;
      }
      const round = kind === "round";
      if (!round) {
        // dáng tháp nhiều tầng tán, tán dày đậm như hàng cây trong ảnh phối cảnh PA6
        const th = (2.2 + rnd() * 0.8) * s,
          H = (6.4 + rnd() * 1.8) * s,
          tiers = 6;
        trunks.push([
          x,
          0,
          z,
          0.2 * s,
          H * 0.85,
          (rnd() - 0.5) * 0.05,
          rnd() * 6.28,
          0x5b4630,
        ]);
        for (let i = 0; i < tiers; i++) {
          const W = kind === "slim" ? 0.5 : 1,
            t = i / (tiers - 1),
            y = th + t * (H - th - 0.5 * s),
            r = (2.0 - 1.4 * t) * s * (0.9 + rnd() * 0.2) * W; // 'slim' = cây mỏng (tán hẹp một nửa, cao như cũ)
          blob(
            x,
            y + (r * 0.35) / W,
            z,
            r,
            (r * 0.62) / W,
            r,
            rnd() * 6,
            0,
            pickG(),
          );
          for (let k = 0; k < 3; k++) {
            const a = rnd() * 6.28;
            blob(
              x + Math.cos(a) * r * 0.6,
              y + (r * 0.3) / W + (rnd() - 0.5) * 0.3,
              z + Math.sin(a) * r * 0.6,
              r * 0.62,
              (r * 0.45) / W,
              r * 0.62,
              rnd() * 6,
              0,
              pickG(),
            );
          }
        }
        blob(
          x,
          H - 0.1 * s,
          z,
          0.5 * s,
          0.7 * s,
          0.5 * s,
          0,
          0,
          GREENS[1 + Math.floor(rnd() * 4)],
        );
        return;
      }
      const th = (round ? 2.0 : 2.5 + rnd() * 0.9) * s,
        cr = (round ? 2.5 : 1.9) * s,
        cy = th + cr * (round ? 0.85 : 1.25);
      trunks.push([
        x,
        0,
        z,
        (0.2 + 0.04 * s) * 1.0,
        th + cr * 0.9,
        (rnd() - 0.5) * 0.06,
        rnd() * 6.28,
        0x5b4630,
      ]);
      blob(x, cy, z, cr, cr * (round ? 0.8 : 1.3), cr, rnd() * 6, 0, pickG());
      const ns = round ? 8 : 7;
      for (let k = 0; k < ns; k++) {
        const a = k * (6.283 / ns) + rnd() * 0.7,
          rad = cr * (0.55 + rnd() * 0.35),
          hy = (rnd() - 0.35) * cr * (round ? 0.7 : 1.7);
        const r = cr * (0.5 + rnd() * 0.3);
        blob(
          x + Math.cos(a) * rad,
          cy + hy,
          z + Math.sin(a) * rad,
          r,
          r * (round ? 0.8 : 1.0),
          r,
          rnd() * 6,
          0,
          pickG(),
        );
      }
      blob(
        x + (rnd() - 0.5) * cr * 0.4,
        cy + cr * (round ? 0.55 : 1.1),
        z + (rnd() - 0.5) * cr * 0.4,
        cr * 0.6,
        cr * 0.5,
        cr * 0.6,
        rnd() * 6,
        0,
        GREENS[1 + Math.floor(rnd() * 5)],
      );
    });
    const lm = new THREE.InstancedMesh(
      g,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: (() => {
          const t = loadTex("leaf");
          t.repeat.set(4, 3);
          return t;
        })(),
        color: new THREE.Color(1.9, 1.95, 1.9),
        roughness: 0.95,
        flatShading: true,
      }),
      blobs.length,
    );
    blobs.forEach((b, i) => {
      e.set(0, b[6], b[7]);
      q.setFromEuler(e);
      v.set(b[0], b[1], b[2]);
      sc.set(b[3], b[4], b[5]);
      m4.compose(v, q, sc);
      lm.setMatrixAt(i, m4);
      col.setHex(b[8]);
      if (b[9] > 1) col.multiplyScalar(b[9]);
      lm.setColorAt(i, col);
    });
    lm.castShadow = true;
    lm.receiveShadow = true;
    siteG.add(lm);
    const tg = new THREE.CylinderGeometry(0.62, 1, 1, 7);
    tg.translate(0, 0.5, 0);
    const tm = new THREE.InstancedMesh(
      tg,
      new THREE.MeshStandardMaterial({ roughness: 0.95 }),
      trunks.length,
    );
    trunks.forEach((t, i) => {
      e.set(0, t[6], t[5]);
      q.setFromEuler(e);
      v.set(t[0], 0, t[2]);
      sc.set(t[3], t[4], t[3]);
      m4.compose(v, q, sc);
      tm.setMatrixAt(i, m4);
      col.setHex(t[7]);
      tm.setColorAt(i, col);
    });
    tm.castShadow = true;
    siteG.add(tm);
    app.trees = [lm, tm]; // để nút "Cây" ẩn/hiện toàn bộ cây
  })();

  // ---------- flow path (luồng hàng) ----------
  const flowGroup = new THREE.Group();
  scene.add(flowGroup);
  const FH = 4.4;
  const fp = [
    [179150, 121000, 1],
    [183800, 94800, 1],
    [181800, 78700, 1],
    [174800, 72900, 1],
    [135000, 74300, 1],
    [131000, 73600, 1],
    [131000, 73600, 2],
    [115000, 72200, 2],
    [94300, 72800, 2],
    [94300, 72800, 1],
    [95500, 80000, 1],
    [98300, 91900, 1],
    [99000, 99200, 1],
    [86100, 93300, 1],
    [67300, 78700, 1],
    [60000, 90400, 1],
    [64250, 121000, 1],
  ].map(([x, y, l]) => new THREE.Vector3(X(x), l === 2 ? 6.9 : FH, Z(y)));
  const curve = new THREE.CatmullRomCurve3(fp, false, "centripetal");
  const flowColor = new THREE.Color(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--flow")
      .trim() || "#e8a400",
  );
  const FLOW_SEGMENTS = 160,
    FLOW_RADIAL = 6;
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, FLOW_SEGMENTS, 0.28, FLOW_RADIAL, false),
    new THREE.MeshStandardMaterial({
      color: flowColor,
      emissive: flowColor,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.55,
      roughness: 0.4,
    }),
  );
  flowGroup.add(tube);
  const NA = 46,
    arrowGeo = new THREE.ConeGeometry(0.9, 2.2, 14);
  arrowGeo.rotateX(Math.PI / 2);
  const arrows = new THREE.InstancedMesh(
    arrowGeo,
    new THREE.MeshStandardMaterial({
      color: flowColor,
      emissive: flowColor,
      emissiveIntensity: 0.5,
      roughness: 0.4,
    }),
    NA,
  );
  flowGroup.add(arrows);
  // drop lines from the flow tube down to each zone so the path reads in 3D
  const dropMat = new THREE.MeshBasicMaterial({
    color: flowColor,
    transparent: true,
    opacity: 0.45,
  });
  [
    [179150, 121000],
    [181800, 78700],
    [135000, 74300],
    [94300, 72800],
    [98300, 91900],
    [67300, 78700],
    [64250, 121000],
  ].forEach(([x, y]) => {
    const d = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, FH, 6),
      dropMat,
    );
    d.position.set(X(x), FH / 2, Z(y));
    flowGroup.add(d);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.0, 28),
      new THREE.MeshBasicMaterial({ color: flowColor, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(X(x), 0.03, Z(y));
    flowGroup.add(ring);
  });

  // ---------- labels ----------
  const labelGroup = new THREE.Group();
  scene.add(labelGroup);
  function label(html, x, y, h, cls) {
    const el = document.createElement("div");
    el.className = "lbl" + (cls ? " " + cls : "");
    el.innerHTML = html;
    const o = new THREE.CSS2DObject(el);
    o.position.set(X(x), h, Z(y));
    labelGroup.add(o);
    return o;
  }
  ZONES.forEach((z) =>
    label(
      `<span class="num" style="background:${z.col}">${z.n}</span>${z.name}`,
      z.lab[0],
      z.lab[1],
      9.5,
    ),
  );
  EXTRA.forEach((e) => label(e.name, e.pos[0], e.pos[1], 3.5, "small"));
  // biển chữ A–D xanh dương trên nóc dãy kệ phụ liệu (như ảnh thực tế)
  KPL_SIGNS.forEach(([t, x, y, z]) => {
    const m = new THREE.MeshStandardMaterial({
      map: letterTex(t, "#1f56c8", "#ffffff"),
      roughness: 0.5,
    });
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.85), m);
    s.position.set(x, y, z);
    scene.add(s);
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.5, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xc3c9cf }),
    );
    p.position.set(x, 2.65, z);
    scene.add(p);
  });
  label("Nhà ăn ca", 158750, 168500, 13, "small");
  if (app.GATE_CENTRAL)
    label("Chòi hút thuốc", 123000 + 3700, 87500 + 69400, 3.4, "small");
  if (app.GATE_CENTRAL)
    label("Khu tập kết", 123000 - 17000, 87500 + 58500, 4.8, "small");
  label("Nhà rác", 123000 - 86700, 87500 - 50500, 6.2, "small");
  label("Trạm bơm", 123000 + 90200, 87500 - 50500, 6.2, "small");

  // ---------- UI ----------
  const list = document.getElementById("zones");
  const allZones = [
    ...ZONES,
    {
      id: "all",
      n: "↺",
      name: "Toàn cảnh xưởng",
      d: "Về góc nhìn phối cảnh tổng thể",
      col: "#5b6875",
    },
  ];
  allZones.forEach((z) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.id = "z-" + z.id;
    b.innerHTML = `<span class="num" style="background:${z.col}">${z.n}</span><span><div class="zn">${z.name}</div><div class="zd">${z.d}</div></span>`;
    b.addEventListener("click", () => {
      document
        .querySelectorAll("ol.zones button")
        .forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      if (z.id === "all") {
        setView("persp");
        return;
      }
      const [a, bb, c, d] = z.r;
      const t = new THREE.Vector3(X((a + c) / 2), 0, Z((bb + d) / 2));
      const dist = z.cam[0] + Math.max(M(c - a), M(d - bb)) * 0.55,
        ang = z.cam[2];
      flyTo(
        new THREE.Vector3(
          t.x + Math.sin(ang) * dist * 0.55,
          dist * 0.62,
          t.z + Math.cos(ang) * dist * 0.85,
        ),
        t,
      );
      setPressed("vPersp", false);
      setPressed("vTop", false);
      extGroup.visible = false;
      setPressed("vExt", false);
      const lblOn =
        document.getElementById("tLabels").getAttribute("aria-pressed") ===
        "true";
      labelGroup.visible = lblOn;
      lr.domElement.style.display = lblOn ? "" : "none";
    });
    li.appendChild(b);
    list.appendChild(li);
  });
  document.getElementById("toggleList").addEventListener("click", (e) => {
    const p = document.getElementById("panel");
    p.classList.toggle("collapsed");
    e.currentTarget.textContent = p.classList.contains("collapsed") ? "▸" : "▾";
  });
  if (window.innerWidth < 640) {
    document.getElementById("panel").classList.add("collapsed");
    document.getElementById("toggleList").textContent = "▸";
  }

  function setPressed(id, v) {
    document
      .getElementById(id)
      .setAttribute("aria-pressed", v ? "true" : "false");
  }
  let fly = null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function flyTo(pos, target) {
    invalidate();
    if (reduce) {
      camera.position.copy(pos);
      controls.target.copy(target);
      controls.update();
      return;
    }
    fly = {
      p0: camera.position.clone(),
      t0: controls.target.clone(),
      p1: pos,
      t1: target,
      s: performance.now(),
      dur: 1100,
    };
  }
  function setView(v) {
    const aspect = stage.clientWidth / stage.clientHeight,
      k = aspect < 1 ? 1.9 : 1;
    const ext = v === "ext";
    extGroup.visible = ext;
    setPressed("vExt", ext);
    const lblOn =
      !ext &&
      document.getElementById("tLabels").getAttribute("aria-pressed") ===
        "true";
    labelGroup.visible = lblOn;
    lr.domElement.style.display = lblOn ? "" : "none";
    if (ext) {
      flyTo(
        new THREE.Vector3(165 * k, 62 * k, 190 * k),
        new THREE.Vector3(0, 4, 15),
      );
      setPressed("vPersp", false);
      setPressed("vTop", false);
      flowGroup.visible = false;
      setPressed("tFlow", false);
      return;
    }
    if (v === "top") {
      flyTo(new THREE.Vector3(0, 250 * k, 0.1), new THREE.Vector3(0, 0, 0));
      setPressed("vTop", true);
      setPressed("vPersp", false);
    } else {
      flyTo(
        new THREE.Vector3(70 * k, 110 * k, 150 * k),
        new THREE.Vector3(-2, 0, 4),
      );
      setPressed("vPersp", true);
      setPressed("vTop", false);
    }
  }
  document.getElementById("vExt").onclick = () => setView("ext");
  document.getElementById("vPersp").onclick = () => setView("persp");
  document.getElementById("vTop").onclick = () => setView("top");
  function tog(id, obj) {
    const b = document.getElementById(id);
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      setPressed(id, on);
      obj.visible = on;
      if (obj === labelGroup) lr.domElement.style.display = on ? "" : "none";
    };
  }
  tog("tFlow", flowGroup);
  tog("tLabels", labelGroup);
  tog("tWalls", wallGroup);
  const spinB = document.getElementById("tSpin");
  document.getElementById("tTrees").onclick = function () {
    const on = this.getAttribute("aria-pressed") !== "true";
    setPressed("tTrees", on);
    (app.trees || []).forEach((m) => {
      m.visible = on;
    });
  };
  spinB.onclick = () => {
    const on = spinB.getAttribute("aria-pressed") !== "true";
    setPressed("tSpin", on);
    controls.autoRotate = on;
    controls.autoRotateSpeed = app.GATE_CENTRAL ? 1.5 : 0.6;
  }; // bản ghép: tự xoay nhanh hơn (0,6 → 1,0 → 1,5)

  // initial camera
  {
    const aspect = stage.clientWidth / stage.clientHeight,
      k = aspect < 1 ? 1.9 : 1;
    camera.position.set(70 * k, 110 * k, 150 * k);
    controls.target.set(-2, 0, 4);
    controls.update();
  }

  function onResize() {
    const w = stage.clientWidth,
      h = stage.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    lr.setSize(w, h);
    invalidate();
  }
  window.addEventListener("resize", onResize);

  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  let off = 0;
  const arrowPoint = new THREE.Vector3(),
    arrowTangent = new THREE.Vector3(),
    arrowTarget = new THREE.Vector3();
  function visibleInScene(object) {
    for (let o = object; o; o = o.parent) if (!o.visible) return false;
    return true;
  }
  function tick(now) {
    frameId = 0;
    if (document.hidden) return;
    // Cap moving views at 30 fps, including on high-refresh-rate displays.
    if (lastFrame && now - lastFrame < 1000 / 30 - 1) {
      frameId = requestAnimationFrame(tick);
      return;
    }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 1 / 30;
    lastFrame = now;
    let animating = false;
    for (const hook of frameHooks) animating = hook(dt, now) || animating;
    if (fly) {
      const t = Math.min(1, (now - fly.s) / fly.dur),
        e = ease(t);
      camera.position.lerpVectors(fly.p0, fly.p1, e);
      controls.target.lerpVectors(fly.t0, fly.t1, e);
      labelsDirty = true;
      if (t >= 1) fly = null;
    }
    const flowVisible = visibleInScene(flowGroup);
    if (flowVisible && (flowDirty || motionEnabled)) {
      if (motionEnabled) off = (off + dt * 0.018) % 1;
      for (let i = 0; i < NA; i++) {
        const u = (i / NA + off) % 1;
        curve.getPointAt(u, arrowPoint);
        curve.getTangentAt(u, arrowTangent);
        tmp.position.copy(arrowPoint);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(1, 1, 1);
        tmp.lookAt(arrowTarget.copy(arrowPoint).add(arrowTangent));
        tmp.updateMatrix();
        arrows.setMatrixAt(i, tmp.matrix);
      }
      arrows.instanceMatrix.needsUpdate = true;
      if (app.f1.__arrowTick) app.f1.__arrowTick(off);
      flowDirty = false;
    }
    // r147 OrbitControls rotates per update; compensate for the capped frame rate.
    const speed = controls.autoRotateSpeed,
      damping = controls.dampingFactor;
    controls.autoRotateSpeed = speed * dt * 60;
    controls.dampingFactor = 1 - Math.pow(1 - damping, dt * 60);
    const cameraChanged = controls.update();
    controls.autoRotateSpeed = speed;
    controls.dampingFactor = damping;
    if (cameraChanged) labelsDirty = true;
    if (motionEnabled && ledTexture) ledTexture.offset.x = (now * 0.00006) % 1;
    skyDome.position.copy(camera.position);
    renderer.render(scene, camera);
    if (labelsDirty) {
      lr.render(scene, camera);
      for (const renderLabels of labelRenderers) renderLabels();
      labelsDirty = false;
    }
    if (
      fly ||
      cameraChanged ||
      controls.autoRotate ||
      animating ||
      (motionEnabled && (flowVisible || ledTexture))
    )
      scheduleFrame();
  }
  controls.addEventListener("change", () => invalidate());
  controls.addEventListener("start", () => {
    fly = null;
    invalidate();
  });
  // Bubble phase runs after the existing toolbar/zone handlers have changed the scene.
  document.addEventListener("click", () => invalidate(true));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else {
      lastFrame = 0;
      invalidate();
    }
  });
  THREE.DefaultLoadingManager.onLoad = () => invalidate(true);
  if (document.fonts) document.fonts.ready.then(() => invalidate());
  const motionButton = document.createElement("button");
  motionButton.id = "tMotion";
  motionButton.textContent = "Chuyển động";
  motionButton.title = "Chạy mũi tên luồng hàng và bảng LED";
  motionButton.setAttribute("aria-pressed", "false");
  document.querySelector(".toolbar").appendChild(motionButton);
  motionButton.onclick = () => {
    motionEnabled = !motionEnabled;
    setPressed("tMotion", motionEnabled);
    invalidate();
  };
  document.getElementById("loading").hidden = true;
  app.f1 = {
    scene,
    camera,
    controls,
    renderer,
    lr,
    labelGroup,
    wallGroup,
    extGroup,
    siteG,
    skyDome,
    ground,
    flyTo,
    setView,
    setPressed,
    flowGroup,
    tube,
    arrows,
    curve,
    NA,
    fp,
    FLOW_SEGMENTS,
    FLOW_RADIAL,
    invalidate,
    frameHooks,
    labelRenderers,
    markFlowDirty: () => {
      flowDirty = true;
    },
  };
  invalidate(true);
  app.ready = true;

  return app.f1;
};
