TNG.areas.buildFloor2 = function (app) {
  const loadTex = TNG.core.loadTexture;
  ("use strict");
  // ---------- ảnh nền cắt từ bản phối cảnh PA6 (bầu trời, cỏ, tán lá) để cảnh ngoài trời trông thật ----------

  const D = TNG.data.D;
  const W2 = TNG.data.W2;
  const T3 = TNG.data.T3;

  // ---------- toạ độ: bản vẽ tầng 2 (mm, y hướng lên) → thế giới (m); bắc ở phía -z, tâm nhà xưởng ở gốc ----------
  const OX = 853545,
    OY = 155673;
  const { X, Z } = TNG.core.createCoordinates(OX, OY, -1);
  const { rnd, pick } = TNG.core.createRandom(11);

  const batch = TNG.core.createInstanceBatch();
  const { box, cyl, sph } = batch;

  const BX0 = 766895,
    BX1 = 940195,
    BY0 = 120773,
    BY1 = 190573; // chân khung tầng 2 theo bản vẽ
  const x0w = X(BX0),
    x1w = X(BX1),
    zN = Z(BY1),
    zS = Z(BY0);
  const LX = x1w - x0w,
    LZ = zS - zN,
    CXW = (x0w + x1w) / 2,
    CZW = (zN + zS) / 2;

  // ---------- bảng màu ----------
  const C = {
    floor: 0x5d646a,
    officeFloor: 0xe8eaec,
    line: 0xf0b400,
    table: 0xa97c4e,
    leg: 0x1c1f23,
    chair: 0x2b2f34,
    deskW: 0xe9ecee,
    deskTop: 0xc9ced3,
    uniform: [0x2f5fa8, 0x3c76c4, 0x2f5fa8, 0x4a86d0, 0xf1f1f1],
    crate: 0x1f4fbf,
  };

  // ---------- đồ nội thất theo bản vẽ (mỗi hình chữ nhật trong bản vẽ → một món đồ) ----------
  const tableAt = TNG.components.tableAt({ box, C });
  // công nhân ngồi may (theo ảnh thực tế): ghế đẩu, đùi + cẳng chân, thân nghiêng về phía bàn, 2 tay đặt lên bàn, đầu cúi, tóc buộc, khẩu trang; áo xanh đồng phục là chủ yếu
  const SHIRTS = [
    0x2d63c8, 0x2d63c8, 0x2d63c8, 0x3a72d6, 0x2d63c8, 0x1d2a44, 0xf1f1f1,
  ];
  const SKIN = [0xe0b48f, 0xd9a57d, 0xe8c3a0];
  const worker = TNG.components.worker({ box, cyl, sph, rnd, SHIRTS, SKIN });
  function personSeated(x, z, face) {
    worker(x, z, 0, face);
  }
  const chairAt = TNG.components.chairAt({ box, cyl, C });
  const lineHeads = []; // [x,z,y_dwg] đầu mỗi tổ may (để treo biển)
  const sewingZones = [];
  let nSew = 0;
  D.fur.forEach(([cx, cy, w, h, L]) => {
    const x = X(cx),
      z = Z(cy),
      sx = w / 1000,
      sz = h / 1000;
    if (L === 1) {
      // khu máy lập trình: máy may mẫu tự động JACK theo ảnh thực tế — tủ trắng, mặt bàn kem 3 mảnh, thanh ray + đầu máy trắng sọc xanh, xích cáp đen, cuộn chỉ, biển số
      const WH = 0xf4f6f7,
        TOP = 0xe3dccb,
        BL = 0x2a8fd6;
      box("pcab", x, 0.36, z + 0.35, 1.35, 0.72, 1.2, WH);
      box("pcabD", x, 0.36, z + 0.96, 1.2, 0.5, 0.02, 0xdfe3e6); // tủ máy trắng + cánh tủ
      for (const a of [-1, 1])
        for (const b of [-1, 1])
          box(
            "pcabD",
            x + a * 0.6,
            0.03,
            z + 0.35 + b * 0.5,
            0.12,
            0.06,
            0.12,
            0x23272c,
          ); // bánh xe
      box("ptop", x, 0.76, z + 0.1, 1.9, 0.05, 1.9, TOP); // mặt bàn chính
      box("ptop", x - 1.25, 0.76, z - 0.55, 0.9, 0.05, 1.4, TOP);
      box("ptop", x + 1.25, 0.76, z - 0.55, 0.9, 0.05, 1.4, TOP); // 2 cánh mở rộng
      box("ptopE", x, 0.735, z + 0.1, 1.92, 0.02, 1.92, 0x2a2d31); // viền đen dưới mặt bàn
      box("prail", x, 0.9, z - 0.85, sx * 0.88, 0.12, 0.14, 0xdfe3e6); // ray ngang bằng nhôm
      box("pchain", x - 0.55, 0.86, z - 0.78, 0.9, 0.05, 0.05, 0x15171a);
      box("pchain", x - 0.1, 0.9, z - 0.55, 0.05, 0.05, 0.5, 0x15171a); // xích cáp đen
      box("parm", x, 1.0, z - 0.1, 0.38, 0.34, 1.5, WH);
      box("parmS", x, 1.0, z - 0.1, 0.4, 0.05, 1.52, BL); // thân đầu máy trắng + sọc xanh
      box("phead", x, 1.2, z + 0.5, 0.34, 0.5, 0.42, WH); // cụm kim phía trước
      box("pbox", x + 0.45, 0.8, z + 0.45, 0.28, 0.12, 0.22, 0x2f5aa8); // hộp phụ kiện xanh
      cyl("cone", x - 0.7, 0.9, z - 0.2, 0.075, 0.24, "y", 0xe9854a);
      cyl("cone", x - 0.5, 0.88, z - 0.2, 0.075, 0.2, "y", 0x555b61);
      if (rnd() < 0.8) worker(x, z + 1.55, 0, -1); // cuộn chỉ cam + xám
      box("psign", x + 0.5, 1.02, z - 0.55, 0.22, 0.26, 0.03, 0x2a4fbf);
      box("psignT", x + 0.5, 1.02, z - 0.535, 0.16, 0.18, 0.012, 0xffffff); // biển số máy
      cyl("pole", x + 0.95, 1.7, z + 0.7, 0.03, 3.4, "y", 0xf1f4f6); // cột trắng treo dây điện
      return;
    }
    if (L === 2) {
      if (w === 2000 && h === 5000) {
        box("podium", x, 0.2, z, sx, 0.4, sz, 0xd8465c);
        return;
      } // bục trao thưởng
      if (w >= 6000 || h >= 6000) {
        tableAt(x, z, sx, sz, 0.75, C.table, C.leg);
        return;
      } // bàn họp / bàn dài
      return; // các khung thang, giữ trống
    }
    if (w === 1200 && h === 600) {
      // bàn máy may + người ngồi (ảnh thực tế: khung trắng, mặt xám)
      nSew++;
      box("deskTop", x, 0.78, z, sx, 0.04, sz, C.deskTop);
      for (const a of [-1, 1])
        box(
          "deskW",
          x + a * (sx / 2 - 0.03),
          0.39,
          z,
          0.04,
          0.78,
          sz * 0.85,
          C.deskW,
        );
      box("mach", x + 0.12, 0.9, z, 0.38, 0.2, 0.24, 0x30343a);
      if (rnd() < 0.92) personSeated(x, z - 0.72, 1);
      return;
    }
    if (w === 2800 && h === 900) {
      tableAt(x, z, sx, sz, 0.8, C.deskTop, C.deskW);
      lineHeads.push([x, z]);
      box("crate", x - 0.6, 0.95, z, 0.5, 0.25, 0.4, C.crate);
      return;
    }
    if (w === 2800 && h === 1300) {
      tableAt(x, z, sx, sz, 0.8, 0xd6e4ea, C.deskW);
      box("machTop", x, 1.1, z, sx * 0.5, 0.5, 0.04, 0x34414a);
      return;
    } // bàn KCS
    if (w === 2800 && h === 4100) {
      // khu là hơi: chỉ vạch sàn
      for (const [bx, bz, bw, bh] of [
        [x, z - sz / 2, sx + 0.08, 0.08],
        [x, z + sz / 2, sx + 0.08, 0.08],
        [x - sx / 2, z, 0.08, sz],
        [x + sx / 2, z, 0.08, sz],
      ])
        box("mark", bx, 0.012, bz, bw, 0.012, bh, C.line);
      return;
    }
    if (w === 2800 && h === 1700) {
      tableAt(x, z, sx, sz, 0.82, C.deskTop, C.deskW);
      box("crate", x - 0.8, 0.95, z, 0.5, 0.25, 0.4, C.crate);
      box("crate", x + 0.7, 0.95, z, 0.5, 0.25, 0.4, 0xe8b400);
      return;
    }
    if (w === 1200 && h === 1200) {
      box("cart", x, 0.3, z, sx * 0.85, 0.5, sz * 0.85, 0xe9ecee);
      box("crate", x, 0.68, z, sx * 0.7, 0.26, sz * 0.7, C.crate);
      return;
    }
    if (w === 1100 && h === 600) {
      tableAt(x, z, sx, sz, 0.76, C.deskTop, C.deskW);
      return;
    }
    if (w === 500 && h === 500) {
      chairAt(x, z);
      return;
    }
    if (w === 700 && h === 700) {
      // chậu cây
      cyl("pot", x, 0.25, z, 0.3, 0.5, "y", 0xd9d6cf);
      sph("plant", x, 0.85, z, 0.45, 0x3f8a3a);
      return;
    }
    if (w === 550 && h === 1150) {
      box("cart", x, 0.25, z, sx, 0.5, sz, 0x2a5fb0);
      return;
    }
    if (Math.min(w, h) <= 650 && Math.max(w, h) >= 1500) {
      box("cab", x, 0.55, z, sx, 1.1, sz, 0x9a7048);
      return;
    } // tủ/quầy thấp
    tableAt(x, z, sx, sz, 0.75, C.table, C.leg); // bàn làm việc văn phòng
  });

  // ---------- gắn tầng 2 vào cảnh tầng 1 (tầng 2 nằm trên sàn cao 4,7 m, ngang đỉnh chiếu nghỉ cầu thang) ----------
  const Y2 = 4.7;
  const F1 = app.f1;
  const scene = new THREE.Group();
  scene.position.y = Y2;
  F1.scene.add(scene); // "scene" của đoạn mã tầng 2 = nhóm tầng 2
  const camera = F1.camera,
    controls = F1.controls;

  // sàn tầng 2: epoxy xám đậm bóng như ảnh thực tế; khu văn phòng sàn sáng
  // ô thủng sàn cho thang bộ phía đông (toạ độ nội bộ tầng 2; sau co giãn ≈ x 85,4…87,5 · z 26,1…đầu hồi nam): sàn chia 3 mảnh quanh ô thủng
  const HX0 = 81.4,
    HX1 = 83.4,
    HZ0 = 25.9,
    floorMat = new THREE.MeshStandardMaterial({
      color: C.floor,
      roughness: 0.28,
      metalness: 0.12,
    }),
    officeMat = new THREE.MeshStandardMaterial({
      color: C.officeFloor,
      roughness: 0.45,
    });
  const slabPart = (x0, x1, z0, z1, h, y, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  slabPart(
    CXW - LX / 2,
    CXW + LX / 2,
    CZW - LZ / 2,
    CZW + LZ / 2,
    0.4,
    -0.2,
    floorMat,
  ); // (tầng 2 được thu gọn ở đầu hồi đông bằng co giãn nhóm, không cần ô thủng)
  {
    const ox0 = 914500,
      ox1 = 939800,
      oy0 = 126500,
      oy1 = 183500;
    slabPart(X(ox0), X(ox1), Z(oy1), Z(oy0), 0.02, 0.012, officeMat);
  }
  function M(v) {
    return v / 1000;
  }

  // vạch vàng sàn (lớp "san hoan thien" của bản vẽ)
  {
    const mat = new THREE.MeshStandardMaterial({
      color: C.line,
      roughness: 0.6,
    });
    [].forEach(([o, k, a, b]) => {
      const len = M(b - a),
        g = new THREE.BoxGeometry(
          o === "h" ? len : 0.14,
          0.012,
          o === "h" ? 0.14 : len,
        );
      const m = new THREE.Mesh(g, mat);
      m.position.set(
        o === "h" ? X((a + b) / 2) : X(k),
        0.01,
        o === "h" ? Z(k) : Z((a + b) / 2),
      );
      scene.add(m);
    });
  }

  // cột (ô vuông 0,8 m dọc chu vi)
  D.cols.forEach(([cx, cy]) =>
    box("col", X(cx), 2.9, Z(cy), 0.8, 5.8, 0.8, 0xf3f4f5),
  );

  // vách đặc (phòng WC, buồng thang, phòng văn phòng) + vách kính
  const wallGroup = new THREE.Group();
  scene.add(wallGroup);
  const mWallW = new THREE.MeshStandardMaterial({
    color: 0xf3f4f5,
    roughness: 0.85,
  });
  const mCap = new THREE.MeshStandardMaterial({
    color: 0x2e353d,
    roughness: 0.8,
  });
  const mGlass = new THREE.MeshPhysicalMaterial({
    color: 0xa9c7c4,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  function seg(o, k, a, b, H, mat, t, frame) {
    const len = M(b - a),
      g = new THREE.BoxGeometry(o === "h" ? len : t, H, o === "h" ? t : len);
    const m = new THREE.Mesh(g, mat);
    m.position.set(
      o === "h" ? X((a + b) / 2) : X(k),
      H / 2,
      o === "h" ? Z(k) : Z((a + b) / 2),
    );
    m.castShadow = mat === mWallW;
    wallGroup.add(m);
    if (frame) {
      const c = new THREE.Mesh(
        new THREE.BoxGeometry(
          o === "h" ? len + 0.04 : t + 0.04,
          0.07,
          o === "h" ? t + 0.04 : len + 0.04,
        ),
        mCap,
      );
      c.position.set(m.position.x, H + 0.035, m.position.z);
      wallGroup.add(c);
      const n = Math.max(1, Math.round(len / 2.4));
      for (let i = 0; i <= n; i++) {
        const u = -len / 2 + (len * i) / n;
        const p = new THREE.Mesh(
          new THREE.BoxGeometry(
            o === "h" ? 0.06 : t + 0.02,
            H,
            o === "h" ? t + 0.02 : 0.06,
          ),
          mCap,
        );
        p.position.set(
          m.position.x + (o === "h" ? u : 0),
          H / 2,
          m.position.z + (o === "h" ? 0 : u),
        );
        wallGroup.add(p);
      }
    }
  }
  D.walls.forEach(([o, k, a, b]) => seg(o, k, a, b, 3.2, mWallW, 0.2, false));
  const notEdge = (o, k) =>
    !(o === "h"
      ? k < BY0 + 1500 || k > BY1 - 1500
      : k < BX0 + 1500 || k > BX1 - 1500);
  W2.office.forEach(([o, k, a, b]) => {
    if (notEdge(o, k)) seg(o, k, a, b, 3.0, mGlass, 0.1, true);
  }); // vách kính các phòng văn phòng
  W2.other.forEach(([o, k, a, b]) => {
    if (notEdge(o, k)) seg(o, k, a, b, 3.2, mWallW, 0.2, false);
  }); // phòng WC, buồng thang, phòng kỹ thuật
  seg("v", 776450, 125483, 128981, 3.2, mWallW, 0.15, false);
  seg("v", 776450, 181500, 185863, 3.2, mWallW, 0.15, false); // vách đầu hồi phía tây (3 phòng nhồi lông vũ dựng riêng bên dưới)
  D.glass.forEach(([o, k, a, b]) => {
    // bỏ phần trùng chu vi (khung kính ngoài dựng riêng)
    const edge =
      o === "h"
        ? k < BY0 + 1500 || k > BY1 - 1500
        : k < BX0 + 1500 || k > BX1 - 1500;
    if (edge) return;
    seg(o, k, a, b, 3.0, mGlass, 0.1, true);
  });

  // khung kính chu vi: kính cao 5,6 m khung thép đen
  const extGroup = new THREE.Group();
  scene.add(extGroup);
  {
    const mSteel = new THREE.MeshStandardMaterial({
      color: 0x1d2329,
      roughness: 0.5,
      metalness: 0.4,
    });
    const mG = new THREE.MeshPhysicalMaterial({
      color: 0x8fb6cc,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const H = 5.8,
      add = (g, m, x, y, z) => {
        const o = new THREE.Mesh(g, m);
        o.position.set(x, y, z);
        extGroup.add(o);
        return o;
      };
    for (const z of [zN, zS]) {
      add(new THREE.BoxGeometry(LX, H, 0.1), mG, CXW, H / 2, z);
      for (let x = x0w; x <= x1w + 0.1; x += 5.75)
        add(new THREE.BoxGeometry(0.3, H, 0.3), mSteel, x, H / 2, z);
      for (const y of [2.8, H])
        add(new THREE.BoxGeometry(LX, 0.18, 0.3), mSteel, CXW, y, z);
    }
    for (const x of [x0w, x1w]) {
      add(new THREE.BoxGeometry(0.1, H, LZ), mG, x, H / 2, CZW);
      for (let z = zN; z <= zS + 0.1; z += 4.9)
        add(new THREE.BoxGeometry(0.3, H, 0.3), mSteel, x, H / 2, z);
      for (const y of [2.8, H])
        add(new THREE.BoxGeometry(0.3, 0.18, LZ), mSteel, x, y, CZW);
    }
  }
  // trần màng trắng (như ảnh thực tế), mặc định ẩn để nhìn từ trên xuống
  const ceilGroup = new THREE.Group();
  ceilGroup.visible = false;
  scene.add(ceilGroup);
  {
    const c = new THREE.Mesh(
      new THREE.PlaneGeometry(LX, LZ),
      new THREE.MeshStandardMaterial({
        color: 0xf2f0ea,
        roughness: 0.9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      }),
    );
    c.rotation.x = Math.PI / 2;
    c.position.set(CXW, 7.0, CZW);
    ceilGroup.add(c);
  }

  // ---------- biển treo đầu mỗi tổ may (như ảnh: "TỔ MAY n" + thương hiệu) ----------
  function signTex(n, brand) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 192;
    const g = c.getContext("2d");
    g.fillStyle = "#22262c";
    g.fillRect(0, 0, 512, 192);
    g.fillStyle = "#fff";
    g.font = '700 40px "Be Vietnam Pro",sans-serif';
    g.fillText("TỔ MAY", 22, 60);
    g.font = '800 96px "Be Vietnam Pro",sans-serif';
    g.fillText(String(n).padStart(2, "0"), 22, 162);
    g.fillStyle = "#f2f2f2";
    g.fillRect(250, 20, 244, 152);
    g.fillStyle = "#111";
    g.font = '700 56px "Be Vietnam Pro",sans-serif';
    g.fillText(brand, 266, 112);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }
  lineHeads
    .sort((a, b) => a[0] - b[0])
    .forEach(([x, z], i) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.64, 0.05),
        new THREE.MeshBasicMaterial({
          map: signTex(i + 1, i % 2 ? "IFG Corp" : "adidas"),
        }),
      );
      m.position.set(x, 4.3, z - 1.0);
      scene.add(m);
      for (const s of [-1, 1])
        box("wire", x + s * 0.8, 5.6, z - 1.0, 0.012, 2.8, 0.012, 0x555b61);
    });

  // ---------- thang xuống tầng 1 (lõi thang theo bản vẽ) ----------
  const STAIRS = [
    [769500, 776600, 186000, 190200],
    [919100, 925800, 186000, 190200],
    [769500, 776600, 121000, 125500],
    [836500, 845500, 121000, 125500],
    [919100, 925800, 121000, 125500],
  ];
  STAIRS.forEach(([a, b, c, d]) => {
    const w = M(b - a),
      h = M(d - c),
      cx = X((a + b) / 2),
      cz = Z((c + d) / 2);
    box("hole", cx, 0.015, cz, w * 0.8, 0.01, h * 0.7, 0x15181b);
    for (const s of [-1, 1])
      box(
        "glassDark",
        cx + s * (w * 0.4),
        0.55,
        cz,
        0.04,
        1.1,
        h * 0.7,
        0x7fb2c9,
      );
    box("glassDark", cx, 0.55, cz + h * 0.35, w * 0.8, 1.1, 0.04, 0x7fb2c9);
  });
  {
    // hành lang tầng 2 chạy hết mặt đông (dải 2 m trong khung ngoài, từ đỉnh thang bộ tới đầu hồi bắc): sàn bê tông + lan can sắt đen phía ngoài; toạ độ nội bộ tầng 2 (sau co giãn ≈ x 88,2…90,25)
    const cx0 = 86.65,
      cx1 = 88.57,
      zc0 = CZW - LZ / 2,
      zc1 = 20.95,
      dk = 0x23282d,
      ex = cx1 - 0.05,
      zm = (zc0 + zc1) / 2;
    box("slab", (cx0 + cx1) / 2, -0.1, zm, cx1 - cx0, 0.2, zc1 - zc0, 0xb9c0c6);
    for (const y of [0.55, 1.0]) {
      box("col", ex, y, zm, 0.045, 0.045, zc1 - zc0, dk);
      box("col", (cx0 + cx1) / 2, y, zc0 + 0.03, cx1 - cx0, 0.045, 0.045, dk);
    }
    for (let z = zc0; z <= zc1 + 0.01; z += 1.4)
      box("col", ex, 0.5, z, 0.07, 1.0, 0.07, dk); // trụ lan can
    for (let z = zc0 + 0.12; z < zc1; z += 0.14)
      box("col", ex, 0.5, z, 0.02, 0.95, 0.02, dk); // con tiện đứng
  }

  // ================= NỘI THẤT THEO PHỐI CẢNH KHU VĂN PHÒNG (vị trí lấy từ nhãn trong bản vẽ) =================
  const OAK = 0xd9bf94,
    MARBLE = 0xf1f3f4,
    SOFA = 0xe9e6df,
    DARK = 0x23282d;
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  }
  const addMesh = (g, m, x, y, z, parent) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    (parent || scene).add(o);
    return o;
  };

  // dải kính mờ có chữ TNG trên vách kính văn phòng (như phối cảnh)
  const bandTex0 = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#9aa3ab";
    g.font = '800 40px "Be Vietnam Pro",sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("TNG", w / 2, h / 2 + 2);
  });
  function frostBand(o, k, a, b) {
    const len = M(b - a);
    if (len < 1.2) return;
    const t = bandTex0.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(len / 2.4, 1);
    t.needsUpdate = true;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(
        o === "h" ? len : 0.13,
        0.42,
        o === "h" ? 0.13 : len,
      ),
      new THREE.MeshBasicMaterial({
        map: t,
        transparent: true,
        depthWrite: false,
      }),
    );
    m.position.set(
      o === "h" ? X((a + b) / 2) : X(k),
      1.35,
      o === "h" ? Z(k) : Z((a + b) / 2),
    );
    wallGroup.add(m);
  }
  W2.office.forEach(([o, k, a, b]) => {
    if (notEdge(o, k)) frostBand(o, k, a, b);
  });

  // --- vách logo + quầy lễ tân (nhãn "VÁCH LOGO" tại 938206,154919) ---
  {
    const wx = X(939350),
      zc = Z(154900),
      woodM = new THREE.MeshStandardMaterial({ color: OAK, roughness: 0.7 });
    addMesh(new THREE.BoxGeometry(0.2, 3.3, 8.4), woodM, wx, 1.65, zc); // vách ốp gỗ sáng
    const logoTex = canvasTex(1024, 360, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#1f56c8";
      g.font = 'italic 900 230px "Be Vietnam Pro",sans-serif';
      g.textBaseline = "alphabetic";
      g.textAlign = "center";
      g.fillText("TNG", w / 2, 230);
      g.fillStyle = "rgba(255,255,255,0.95)";
      g.font = '600 46px "Be Vietnam Pro",sans-serif';
      g.fillText("CHI NHÁNH MAY VIỆT ĐỨC", w / 2, 320);
    });
    // logo xoay 90° nằm dọc theo vách kính giữa (vách y=155400, x 934407…939837 chạy từ vách logo ra phía lễ tân), dán cả 2 mặt vách
    {
      const lx = X((934407 + 939837) / 2),
        lz = Z(155400);
      for (const s of [1, -1]) {
        const logo = new THREE.Mesh(
          new THREE.PlaneGeometry(4.8, 1.68),
          new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }),
        );
        logo.rotation.y = s > 0 ? 0 : Math.PI;
        logo.position.set(lx, 1.9, lz + s * 0.06);
        scene.add(logo);
      }
    }
    const led = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [
      [-3.4, 1.4, 0.9, 1.9],
      [-2.0, 0.6, 2.6, 0.9],
      [0.4, 2.6, 2.1, -0.7],
      [2.2, 0.9, 2.9, 0.5],
      [3.6, 2.4, 1.5, 0.8],
      [-0.8, 0.5, 1.6, -1.1],
      [1.4, 1.8, 2.2, 1.0],
    ].forEach(([dz, y, len, ang]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, len), led);
      m.position.set(wx - 0.11, y + 0.4, zc + dz);
      m.rotation.x = ang;
      scene.add(m);
    });
    // quầy lễ tân đá trắng 2 khối so le, chân gỗ
    const marbleM = new THREE.MeshStandardMaterial({
      color: MARBLE,
      roughness: 0.25,
      metalness: 0.05,
    });
    const qx = X(937300);
    addMesh(
      new THREE.BoxGeometry(0.85, 1.05, 4.2),
      marbleM,
      qx,
      0.525,
      zc + 1.6,
    );
    addMesh(new THREE.BoxGeometry(0.8, 0.1, 4.1), woodM, qx, 0.05, zc + 1.6);
    addMesh(
      new THREE.BoxGeometry(0.8, 0.85, 2.4),
      marbleM,
      qx + 0.35,
      0.425,
      zc - 1.7,
    );
    addMesh(
      new THREE.BoxGeometry(0.75, 0.1, 2.3),
      woodM,
      qx + 0.35,
      0.05,
      zc - 1.7,
    );
    box("machTop", qx + 0.05, 1.28, zc + 2.6, 0.05, 0.38, 0.58, 0xdfe3e6);
    box("machTop", qx + 0.05, 1.1, zc + 2.6, 0.2, 0.04, 0.2, 0xcfd4d8); // màn hình iMac
    chairAt(qx - 1.0, zc + 2.6);
    for (const [dz, dh] of [
      [-2.4, 0.35],
      [-1.6, 0.28],
      [-0.9, 0.3],
    ]) {
      cyl("pot", qx + 0.4, 0.93 + dh * 0.0, zc + dz, 0.1, 0.18, "y", 0xffffff);
      sph("plant", qx + 0.4, 1.12, zc + dz, 0.16, 0x3f8a3a);
    } // chậu cây nhỏ trên quầy
    cyl("pot", wx - 1.0, 0.35, zc - 2.0, 0.32, 0.7, "y", 0xd9d6cf);
    sph("plant", wx - 1.0, 1.35, zc - 2.0, 0.65, 0x3f8a3a); // cây lớn cạnh vách logo
    // trần lam gỗ trên khu lễ tân (hiện cùng nút "Trần")
    const slatM = new THREE.MeshStandardMaterial({
      color: 0xcfa97a,
      roughness: 0.7,
    });
    for (let i = 0; i < 54; i++)
      addMesh(
        new THREE.BoxGeometry(5.0, 0.1, 0.09),
        slatM,
        wx - 2.5,
        3.45,
        zc - 4.2 + i * 0.157,
        ceilGroup,
      );
  }

  // --- ghế sofa dài + 2 bàn cao (nhãn "SOFA DÀI" tại 929987,149710) ---
  {
    const sx = X(931200),
      sz = Z(151600),
      sofaM = new THREE.MeshStandardMaterial({ color: SOFA, roughness: 0.95 });
    for (let i = 0; i < 7; i++) {
      addMesh(
        new THREE.BoxGeometry(0.9, 0.45, 0.95),
        sofaM,
        sx - 2.7 + i * 0.9,
        0.28,
        sz - 0.2,
      );
    }
    addMesh(new THREE.BoxGeometry(6.3, 0.55, 0.25), sofaM, sx, 0.55, sz - 0.72);
    for (const dx of [-1.6, 1.6])
      tableAt(sx + dx, sz + 1.5, 1.8, 0.6, 1.0, OAK, DARK);
  }

  // --- bộ sofa tiếp khách (sofa góc + 2 ghế đơn + bàn trà) cho phòng giám đốc / phó giám đốc / khách hàng ---
  const sofaSet = TNG.components.sofaSet({ X, Z, SOFA, addMesh });
  sofaSet(934000, 159300, 1);
  sofaSet(935800, 174000, 1);
  sofaSet(920000, 162300, 1);

  // --- phòng y tế: 2 giường bệnh khung trắng nệm xanh, bàn bác sĩ + hộp cứu thương, tủ thuốc ---
  {
    const mx = X(934600),
      mz = Z(124300),
      frameM = new THREE.MeshStandardMaterial({
        color: 0xf2f3f4,
        roughness: 0.5,
        metalness: 0.2,
      }),
      blueM = new THREE.MeshStandardMaterial({
        color: 0x2f4fc0,
        roughness: 0.8,
      });
    for (const dz of [-0.9, 0.9]) {
      addMesh(
        new THREE.BoxGeometry(2.0, 0.12, 0.9),
        frameM,
        mx - 2.2,
        0.5,
        mz + dz,
      );
      addMesh(
        new THREE.BoxGeometry(1.9, 0.18, 0.82),
        blueM,
        mx - 2.2,
        0.64,
        mz + dz,
      );
      addMesh(
        new THREE.BoxGeometry(0.08, 0.6, 0.9),
        frameM,
        mx - 3.2,
        0.8,
        mz + dz,
      );
      addMesh(
        new THREE.BoxGeometry(0.35, 0.1, 0.55),
        frameM,
        mx - 2.95,
        0.8,
        mz + dz,
      );
      for (const a of [-1, 1])
        for (const b of [-1, 1])
          addMesh(
            new THREE.BoxGeometry(0.05, 0.45, 0.05),
            frameM,
            mx - 2.2 + a * 0.9,
            0.24,
            mz + dz + b * 0.4,
          );
    }
    tableAt(mx + 0.9, mz - 0.2, 1.5, 0.7, 0.75, OAK, DARK);
    chairAt(mx + 0.9, mz - 1.0);
    addMesh(
      new THREE.BoxGeometry(0.4, 0.22, 0.3),
      frameM,
      mx + 0.6,
      0.88,
      mz - 0.2,
    );
    const red = new THREE.MeshBasicMaterial({ color: 0xd8262f });
    addMesh(
      new THREE.BoxGeometry(0.2, 0.02, 0.05),
      red,
      mx + 0.6,
      1.0,
      mz - 0.2,
    );
    addMesh(
      new THREE.BoxGeometry(0.05, 0.02, 0.2),
      red,
      mx + 0.6,
      1.0,
      mz - 0.2,
    );
    addMesh(
      new THREE.BoxGeometry(0.5, 1.7, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xe9ecee, roughness: 0.6 }),
      mx + 2.2,
      0.85,
      mz + 0.8,
    );
  }

  // --- quầy café (nhãn "P. CAFE" tại 936130,147383): quầy bar khung đen, ghế đẩu, kệ kính có chai ---
  {
    const bx = X(937600),
      bz = Z(146200),
      darkM = new THREE.MeshStandardMaterial({
        color: DARK,
        roughness: 0.5,
        metalness: 0.3,
      });
    addMesh(
      new THREE.BoxGeometry(0.75, 1.05, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.5 }),
      bx,
      0.525,
      bz,
    );
    addMesh(
      new THREE.BoxGeometry(0.95, 0.06, 5.8),
      new THREE.MeshStandardMaterial({ color: OAK, roughness: 0.6 }),
      bx,
      1.08,
      bz,
    );
    for (let i = 0; i < 7; i++) {
      const z = bz - 2.4 + i * 0.8;
      cyl("stool", bx - 0.9, 0.7, z, 0.19, 0.05, "y", OAK);
      cyl("stool", bx - 0.9, 0.35, z, 0.025, 0.7, "y", DARK);
    }
    const sh = X(939000);
    for (const y of [0.4, 1.0, 1.6, 2.2]) {
      addMesh(
        new THREE.BoxGeometry(0.3, 0.03, 5.2),
        new THREE.MeshStandardMaterial({
          color: 0xaec9d0,
          transparent: true,
          opacity: 0.6,
        }),
        sh,
        y,
        bz,
      );
      for (let i = 0; i < 14; i++)
        addMesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8),
          new THREE.MeshStandardMaterial({
            color: pick([0x1f4a3a, 0x8a3a2a, 0xcfc9b8, 0x2a3b66]),
          }),
          sh,
          y + 0.15,
          bz - 2.4 + i * 0.37,
        );
    }
    for (const z of [-2.7, 2.7])
      addMesh(new THREE.BoxGeometry(0.06, 2.5, 0.06), darkM, sh, 1.25, bz + z);
  }

  // ================= 7 TỔ CHUYỀN TREO (JACK) — khu phía tây, theo khối "吊挂站" trong bản vẽ =================
  // mỗi tổ: khung cổng nhôm trắng + dải JACK + biển "TỔ MAY nn · Sewing Line" ở đầu tổ, ray treo + vòng móc xanh rủ xuống từng trạm,
  // ống gió tròn bạc chạy giữa tổ, 2 dãy bàn máy may điện tử có người ngồi, cụm bàn máy phía nam, bàn là
  {
    const AL = 0xf1f4f6,
      HB = 0x2c8fd6,
      TX0 = 781396,
      TP = 4500,
      TY0 = 139100,
      TY1 = 183400;
    const zS = Z(TY0),
      zNn = Z(TY1),
      zMid = (zS + zNn) / 2,
      zLen = Math.abs(zS - zNn);
    const treoSign = (n) =>
      canvasTex(512, 192, (g, w, h) => {
        g.fillStyle = "#3a3f47";
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#fff";
        g.font = '700 46px "Be Vietnam Pro",sans-serif';
        g.fillText("TỔ MAY", 150, 70);
        g.font = '800 120px "Be Vietnam Pro",sans-serif';
        g.textAlign = "right";
        g.fillText(String(n), w - 26, 168);
        g.textAlign = "left";
        g.font = '500 30px "Be Vietnam Pro",sans-serif';
        g.fillStyle = "#cfd6dc";
        g.fillText("Sewing Line", 150, 112);
      });
    const jackTex = canvasTex(512, 96, (g, w, h) => {
      g.fillStyle = "#fff";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#2a9bdc";
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(w * 0.62, 0);
      g.lineTo(w * 0.5, h);
      g.lineTo(0, h);
      g.fill();
      g.fillStyle = "#1b5fa8";
      g.font = 'italic 800 62px "Be Vietnam Pro",sans-serif';
      g.textBaseline = "middle";
      g.fillText("JACK", w * 0.3, h / 2 + 3);
    });
    for (let k = 0; k < 7; k++) {
      const xc = X(TX0 + k * TP);
      for (let y = TY0 + 500; y <= TY1; y += 6000) {
        const z = Z(y);
        for (const s of [-1, 1])
          box("al", xc + s * 2.05, 1.75, z, 0.09, 3.5, 0.09, AL);
        box("al", xc, 3.5, z, 4.2, 0.09, 0.09, AL);
      } // khung cổng nhôm
      box("al", xc, 3.25, zMid, 0.12, 0.12, zLen, 0xdfe3e6); // ray treo
      cyl("duct", xc, 4.6, zMid, 0.28, zLen, "z", 0xcfd5da); // ống gió tròn bạc
      // đầu tổ (phía nam, nhìn ra lối đi chính): dải JACK + biển số tổ
      const zh = Z(TY0 + 400);
      for (const s of [-1, 1])
        box("al", xc + s * 2.05, 1.9, zh, 0.12, 3.8, 0.12, AL);
      box("al", xc, 3.85, zh, 4.3, 0.4, 0.14, AL);
      const jk = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.4),
        new THREE.MeshBasicMaterial({ map: jackTex }),
      );
      jk.position.set(xc + 0.7, 3.85, zh + 0.08);
      scene.add(jk);
      const sg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 0.54),
        new THREE.MeshBasicMaterial({ map: treoSign(25 + k) }),
      );
      sg.position.set(xc - 1.3, 3.85, zh + 0.08);
      scene.add(sg);
    }
    const lineIdx = (x) => Math.max(0, Math.min(6, Math.round((x - TX0) / TP)));
    // bàn máy may điện tử (217 trạm) + người ngồi + vòng móc treo xanh
    T3.mach.forEach(([cx, cy]) => {
      const x = X(cx),
        z = Z(cy),
        xc = X(TX0 + lineIdx(cx) * TP),
        dir = x < xc ? 1 : -1;
      box("deskTop", x, 0.78, z, 1.0, 0.04, 1.2, C.deskTop);
      for (const b of [-1, 1])
        (box(
          "deskW",
          x - dir * 0.45,
          0.39,
          z + b * 0.5,
          0.04,
          0.78,
          0.04,
          C.deskW,
        ),
          box(
            "deskW",
            x + dir * 0.45,
            0.39,
            z + b * 0.5,
            0.04,
            0.78,
            0.04,
            C.deskW,
          ));
      box("mach", x + dir * 0.1, 0.92, z, 0.4, 0.22, 0.3, 0x30343a);
      if (rnd() < 0.92) worker(x - dir * 0.95, z, dir, 0);
      const hx = x + dir * 0.55; // móc treo: ray → trạm
      box("hang", hx, 2.4, z, 0.04, 1.7, 0.04, HB);
      box("hang", (hx + xc) / 2, 3.25, z, Math.abs(hx - xc), 0.04, 0.04, HB);
      box(
        "garm",
        hx,
        1.85,
        z,
        0.12,
        0.5,
        0.34,
        pick([0x1d2740, 0x232a3a, 0x5b4a3a, 0x111418]),
      );
    });
    // bàn dài trắng ở giữa 2 hàng công nhân của từng tổ chuyền (như ảnh thực tế): mặt trắng, chân thép, chồng vải xám đen, túi nhựa, hộp nhựa
    for (let k = 0; k < 7; k++) {
      const xc = X(TX0 + k * TP),
        zA = Z(TY0 + 1500),
        zB = Z(TY1 - 1500),
        zl = Math.abs(zA - zB),
        zm = (zA + zB) / 2;
      box("ctop", xc, 0.81, zm, 1.2, 0.05, zl, 0xf3f5f6);
      for (let z = Math.min(zA, zB) + 1.0; z < Math.max(zA, zB); z += 3.2)
        for (const s of [-1, 1])
          box("leg", xc + s * 0.5, 0.4, z, 0.05, 0.8, 0.05, 0xb9bec4);
      for (
        let z = Math.min(zA, zB) + 0.8;
        z < Math.max(zA, zB) - 0.8;
        z += 1.3 + rnd() * 1.6
      ) {
        const h = 0.12 + rnd() * 0.2,
          o = (rnd() - 0.5) * 0.4;
        box(
          "cloth",
          xc + o,
          0.835 + h / 2,
          z,
          0.55 + rnd() * 0.25,
          h,
          0.6 + rnd() * 0.4,
          pick([0x3a3f48, 0x2b2f36, 0x555b63, 0x1d2740, 0x6b6f76]),
        );
        if (rnd() < 0.35)
          box(
            "bag",
            xc + o + 0.05,
            0.86 + h + 0.06,
            z,
            0.5,
            0.1,
            0.55,
            0xdfe6ea,
          ); // túi nhựa trong
        if (rnd() < 0.25)
          box("crate", xc - 0.3, 0.9, z + 0.5, 0.45, 0.14, 0.32, 0xe8f0f4); // hộp nhựa trong
      }
    }
    // cụm bàn máy may phía nam (8 cụm/tổ): bàn dài 2,85 m, 2 máy, 2 người ngồi 2 đầu
    T3.grp.forEach(([gx, gy]) => {
      const x = X(gx),
        z = Z(gy);
      box("deskTop", x, 0.78, z, 2.85, 0.04, 0.84, C.deskTop);
      for (const a of [-1, 1])
        for (const b of [-1, 1])
          box(
            "deskW",
            x + a * 1.35,
            0.39,
            z + b * 0.36,
            0.04,
            0.78,
            0.04,
            C.deskW,
          );
      for (const a of [-1, 1]) {
        box("mach", x + a * 0.7, 0.92, z, 0.4, 0.22, 0.3, 0x30343a);
        box(
          "cloth",
          x + a * 0.2,
          0.84,
          z,
          0.5,
          0.1 + rnd() * 0.12,
          0.5,
          pick([0x3a3f48, 0x2b2f36, 0x555b63, 0x1d2740]),
        );
        if (rnd() < 0.92) worker(x + a * 1.8, z, -a, 0);
      }
    });
    // bàn là hơi (đầu bắc và giữa tổ)
    T3.iron.forEach(([ix, iy, s]) => {
      const x = X(ix + (s ? -608 : 608)),
        z = Z(iy + (s ? -660 : 660));
      tableAt(x, z, 1.2, 1.5, 0.9, 0xb8bec4, C.deskW);
      box("mach", x, 1.05, z, 0.5, 0.14, 0.8, 0xe9ecef);
      box("crate", x + 0.3, 0.3, z + 0.5, 0.5, 0.3, 0.4, C.crate);
    });
    // giá treo ở 2 đầu tổ + hộp treo trên ray
    T3.hs.forEach(([hx, hy]) => {
      const x = X(hx),
        z = Z(hy);
      tableAt(x, z, 1.97, 0.96, 0.85, C.deskTop, C.deskW);
      box("hang", x, 2.3, z, 0.04, 1.9, 0.04, HB);
      box("garm", x, 1.9, z, 0.12, 0.5, 0.34, 0x1d2740);
    });
    T3.heads.forEach(([hx, hy]) => {
      const x = X(hx),
        z = Z(hy);
      box("al", x, 2.9, z, 0.7, 0.55, 0.55, 0xdfe3e6);
      box("hang", x, 2.2, z, 0.04, 1.4, 0.04, HB);
    });
  }

  // ================= 3 PHÒNG NHỒI BÔNG & LÔNG VŨ theo phương án thiết kế Shenghong (file PPTX "Phương án TNG") =================
  // mỗi phòng 8,95 × 15 m, vách kính khung đen, sàn xám nhạt: khu chính (2 máy nhồi bông có 3 trạm thao tác, máy nhỏ + băng tải xanh,
  // băng tải dài có 4 bàn trung chuyển/hàn miệng, màn hình điều khiển) và phòng nhỏ phía bắc (2 tủ hút bông, máy đập bông có ống dẫn)
  {
    const RX0 = 767500,
      RX1 = 776450,
      W = M(RX1 - RX0),
      RL = 15;
    const x0r = X(RX0);
    const FM = 0xf3f6f8,
      BL = 0x9ed8e8,
      DK = 0x2a2f36,
      GR = 0x2ecc40,
      WOOD = 0x4a3a30;
    [134500, 149500, 166500].forEach((ry0, ri) => {
      const zs = Z(ry0),
        P = (b, a) => [x0r + b, zs - a],
        ry1 = ry0 + RL * 1000;
      addMesh(
        new THREE.BoxGeometry(W, 0.02, RL),
        new THREE.MeshStandardMaterial({ color: 0xb9bec2, roughness: 0.5 }),
        x0r + W / 2,
        0.02,
        zs - RL / 2,
      ); // sàn nền âm
      // vách kính khung đen: 4 mặt (cửa phòng ở vách đông, cửa sang phòng nhỏ ở vách ngăn)
      seg("h", ry0, RX0, RX1, 3.2, mGlass, 0.1, true);
      seg("h", ry1, RX0, RX1, 3.2, mGlass, 0.1, true);
      seg("v", RX0, ry0, ry1, 3.2, mGlass, 0.1, true);
      seg("v", RX1, ry0, ry0 + 3500, 3.2, mGlass, 0.1, true);
      seg("v", RX1, ry0 + 5300, ry1, 3.2, mGlass, 0.1, true);
      seg("h", ry0 + 10800, RX0, RX0 + 3500, 3.2, mGlass, 0.1, true);
      seg("h", ry0 + 10800, RX0 + 5300, RX1, 3.2, mGlass, 0.1, true);
      // 2 máy nhồi bông (thân trắng, nắp xanh nhạt) + quầy + 3 trạm thao tác mỗi máy
      [3.6, 8.0].forEach((a) => {
        const [mx, mz] = P(1.15, a);
        box("fm", mx, 0.9, mz, 0.95, 1.8, 2.4, FM);
        box("fmTop", mx, 1.62, mz, 0.97, 0.38, 2.42, BL);
        box("fmDark", mx + 0.48, 1.0, mz, 0.02, 0.5, 1.6, DK);
        const [qx, qz] = P(2.1, a);
        box("fm", qx, 0.43, qz, 0.5, 0.86, 1.8, FM);
        for (const j of [-1, 0, 1]) {
          const [sx, sz] = P(2.95, a + j * 0.75);
          box("fm", sx, 0.5, sz, 0.55, 1.0, 0.6, 0xeef1f3);
          box("fmDark", sx, 1.0, sz, 0.4, 0.06, 0.45, 0x8f9aa5);
        }
      });
      // máy nhỏ + băng tải xanh ngắn
      {
        const [mx, mz] = P(4.4, 0.9);
        box("fm", mx, 0.6, mz, 1.2, 1.2, 1.0, FM);
        box("fmDark", mx, 1.22, mz, 0.4, 0.04, 0.4, DK);
        const [bx, bz] = P(5.6, 0.9);
        box("conv", bx, 0.4, bz, 1.2, 0.12, 0.7, GR);
      }
      // băng tải dài + 4 bàn trung chuyển / hàn miệng
      {
        const [cx, cz] = P(7.2, 4.3);
        box("conv", cx, 0.85, cz, 0.35, 0.1, 4.6, GR);
        for (const a of [2.4, 3.5, 4.6, 5.7]) {
          const [tx, tz] = P(7.9, a);
          box("top", tx, 0.75, tz, 0.55, 0.05, 0.6, WOOD);
          for (const s of [-1, 1])
            (box(
              "leg",
              tx + 0.22,
              0.37,
              tz + s * 0.25,
              0.04,
              0.74,
              0.04,
              C.leg,
            ),
              box(
                "leg",
                tx - 0.22,
                0.37,
                tz + s * 0.25,
                0.04,
                0.74,
                0.04,
                C.leg,
              ));
        }
      }
      // màn hình điều khiển trung tâm + ki-ốt
      {
        const [sx, sz] = P(8.8, 6.8);
        box("screen", sx, 1.8, sz, 0.05, 0.8, 1.5, 0x1f3f7a);
        const [kx, kz] = P(8.3, 7.8);
        box("fm", kx, 0.55, kz, 0.4, 1.1, 0.4, FM);
      }
      // phòng nhỏ: 2 tủ hút bông cao + máy đập bông + ống dẫn
      {
        for (const a of [12.0, 13.6]) {
          const [tx, tz] = P(0.9, a);
          box("fm", tx, 1.15, tz, 0.7, 2.3, 0.8, FM);
          box("fmDark", tx + 0.36, 1.7, tz, 0.02, 0.3, 0.3, 0xe8b400);
        }
        const [dx, dz] = P(4.6, 13.0);
        box("fm", dx, 1.0, dz, 1.5, 2.0, 1.7, FM);
        box("fmTop", dx, 2.05, dz, 1.5, 0.12, 1.7, 0x7a8794);
        cyl("hose", dx + 0.3, 2.4, dz - 0.4, 0.18, 1.4, "x", 0xb9c2c9);
      }
      // người vận hành đứng/ngồi tại 2 trạm đầu
      {
        const [px, pz] = P(3.6, 3.0);
        personSeated(px, pz, 1);
        const [qx2, qz2] = P(3.6, 7.4);
        personSeated(qx2, qz2, 1);
      }
      D.texts.push([RX0 + 800, ry0 + 13500, "Phòng nhồi lông vũ " + (ri + 1)]);
      if (ri === 0) {
        // chú thích các khu theo sơ đồ quá trình nhồi bông của phương án
        [
          ["Khu vực hút bông", 1500, 12500],
          ["Khu vực đập bông", 5200, 13700],
          ["Khu vực trung chuyển sản phẩm", 3300, 6200],
          ["Khu vực hàn miệng", 7500, 3000],
          ["Khu vực nhồi bông", 2500, 4300],
          ["Khu vực điều khiển chính", 8300, 6800],
        ].forEach(([t, bb, aa]) => D.texts.push([RX0 + bb, ry0 + aa, t]));
      }
    });
  }

  // bàn trắng dài kéo hết chuyền ở giữa 2 cột công nhân của từng tổ may (như ảnh thực tế), có chồng vải + túi nhựa
  {
    const desks = D.fur.filter(
        (f) => f[2] === 1200 && f[3] === 600 && f[4] === 0,
      ),
      xs = [...new Set(desks.map((f) => f[0]))].sort((a, b) => a - b),
      groups = [];
    xs.forEach((x) => {
      const g = groups[groups.length - 1];
      if (g && x - g[g.length - 1] < 2000) g.push(x);
      else groups.push([x]);
    });
    groups.forEach((g) => {
      if (g.length < 2) return;
      const cx = X((g[0] + g[g.length - 1]) / 2),
        ys = desks.filter((f) => g.includes(f[0])).map((f) => f[1]),
        z0 = Z(Math.max(...ys)) - 0.6,
        z1 = Z(Math.min(...ys)) + 0.6,
        zl = Math.abs(z1 - z0),
        zm = (z0 + z1) / 2;
      box("ctop", cx, 0.805, zm, 0.48, 0.03, zl, 0xf6f8f9);
      for (let z = Math.min(z0, z1) + 0.6; z < Math.max(z0, z1); z += 3.3)
        box("leg", cx, 0.4, z, 0.05, 0.8, 0.05, 0xb9bec4);
      for (
        let z = Math.min(z0, z1) + 0.5;
        z < Math.max(z0, z1) - 0.4;
        z += 1.2 + rnd() * 2.4
      ) {
        const h = 0.1 + rnd() * 0.22;
        box(
          "cloth",
          cx + (rnd() - 0.5) * 0.1,
          0.82 + h / 2,
          z,
          0.42,
          h,
          0.5 + rnd() * 0.5,
          pick([0x3a3f48, 0x2b2f36, 0x555b63, 0x1d2740, 0x6b6f76]),
        );
        if (rnd() < 0.3)
          box("bag", cx, 0.84 + h + 0.05, z, 0.4, 0.1, 0.5, 0xdfe6ea);
      }
    });
  }
  // đường kẻ vàng quanh các khu vực làm việc (bản vẽ khoanh đỏ): từng tổ may, từng tổ chuyền treo, 2 hàng máy lập trình, các dãy bàn kiểm/KCS
  {
    const outline = (x0, z0, x1, z1, o) => {
      o = o || {};
      const t = 0.14,
        w = x1 - x0,
        h = z1 - z0,
        cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2;
      const hseg = (za, skip) => {
        if (skip) {
          [
            [x0, Math.min(x1, skip[0])],
            [Math.max(x0, skip[1]), x1],
          ].forEach(([a, b]) => {
            if (b > a)
              box("mark", (a + b) / 2, 0.013, za, b - a + t, 0.012, t, C.line);
          });
        } else box("mark", cx, 0.013, za, w + t, 0.012, t, C.line);
      };
      if (!o.noT) hseg(z0, o.cutT);
      if (!o.noB) hseg(z1, o.cutB);
      if (!o.noL) box("mark", x0, 0.013, cz, t, 0.012, h, C.line);
      if (!o.noR) box("mark", x1, 0.013, cz, t, 0.012, h, C.line);
    };
    // 1) từng tổ may thường: bao 2 cột bàn + chừa lối đi
    const dk = D.fur.filter((f) => f[2] === 1200 && f[3] === 600 && f[4] === 0),
      xs2 = [...new Set(dk.map((f) => f[0]))].sort((a, b) => a - b),
      gs = [];
    xs2.forEach((x) => {
      const g = gs[gs.length - 1];
      if (g && x - g[g.length - 1] < 2000) g.push(x);
      else gs.push([x]);
    });
    // lối đi giữa = khe rộng nhất giữa 2 tổ liền kề: xoá đường dọc (X) và đoạn ngang (vạch đỏ trơn) ở 2 mép sát lối đi theo yêu cầu
    const cen = gs.map((g) => (g[0] + g[g.length - 1]) / 2);
    let aisleI = 1,
      best = 0;
    for (let i = 1; i < cen.length; i++)
      if (cen[i] - cen[i - 1] > best) {
        best = cen[i] - cen[i - 1];
        aisleI = i;
      }
    app.aisleX = X((cen[aisleI] + cen[aisleI - 1]) / 2);
    gs.forEach((g, gi) => {
      const ys = dk.filter((f) => g.includes(f[0])).map((f) => f[1]);
      const left = gi === aisleI - 1,
        right = gi === aisleI,
        o = {};
      outline(X(g[0]) - 1.1, Z(174250), X(g[g.length - 1]) + 1.1, Z(139400), o);
      sewingZones.push({
        minX: X(g[0]) - 1.1,
        maxX: X(g[g.length - 1]) + 1.1,
        minZ: Z(174250),
        maxZ: Z(139400),
      });
    });
    // 2) 7 tổ chuyền treo
    for (let k = 0; k < 7; k++) {
      const xc = X(781396 + k * 4500);
      outline(xc - 2.3, Z(183400) - 0.2, xc + 2.3, Z(139100) + 0.2);
    }
    // 3) 2 hàng máy lập trình (khu vực phía nam)
    const pm = D.fur.filter((f) => f[4] === 1).sort((a, b) => a[1] - b[1]),
      rows = [];
    pm.forEach((f) => {
      const r = rows[rows.length - 1];
      if (r && f[1] - r[r.length - 1][1] < 3000) r.push(f);
      else rows.push([f]);
    });
    D.fur
      .filter((f) => f[4] === 1)
      .forEach((f) =>
        outline(
          X(f[0]) - f[2] / 2000,
          Z(f[1]) - f[3] / 2000,
          X(f[0]) + f[2] / 2000,
          Z(f[1]) + f[3] / 2000,
        ),
      ); // mỗi máy lập trình một ô vàng riêng (bỏ đường dài chạy suốt hàng)
    // 4) dãy bàn kiểm / KCS / bàn cuối chuyền (các dãy 24 bàn rộng 2,8 m, trừ dãy là hơi đã có vạch riêng)
    if (false)
      [
        [2800, 1300],
        [2800, 900],
        [2800, 1700],
      ].forEach(([w, h]) => {
        const it = D.fur.filter((f) => f[2] === w && f[3] === h && f[4] === 0);
        if (it.length < 10) return;
        outline(
          X(Math.min(...it.map((f) => f[0]))) - 1.6,
          Z(Math.max(...it.map((f) => f[1]))) - h / 2000 - 0.5,
          X(Math.max(...it.map((f) => f[0]))) + 1.6,
          Z(Math.min(...it.map((f) => f[1]))) + h / 2000 + 0.5,
          h !== 1700
            ? {
                cutT: [app.aisleX - 2.6, app.aisleX + 2.6],
                cutB: [app.aisleX - 2.6, app.aisleX + 2.6],
              }
            : {},
        );
      });
    // 5) vạch kẻ đường đi theo đúng nét đen anh kẻ (toạ độ đo từ ảnh: 10,24 px/m, lối đi giữa là mốc x, mép trên các tổ là mốc z)
    {
      const aX = app.aisleX,
        gz =
          Z(
            Math.max(
              ...D.fur
                .filter((f) => f[2] === 1200 && f[3] === 600 && f[4] === 0)
                .map((f) => f[1]),
            ),
          ) - 1.3,
        S = 10.24;
      const px = (p) => aX + (p - 712) / S,
        pz = (p) => gz + (p - 148) / S,
        t = 0.14;
      const hl = (a, b, y) =>
        box(
          "mark",
          (px(a) + px(b)) / 2,
          0.013,
          pz(y),
          px(b) - px(a) + t,
          0.012,
          t,
          C.line,
        );
      const vl = (x, a, b) =>
        box(
          "mark",
          px(x),
          0.013,
          (pz(a) + pz(b)) / 2,
          t,
          0.012,
          pz(b) - pz(a) + t,
          C.line,
        );
      // khối bàn kiểm phía bắc
      // khối bàn kiểm phía bắc: mỗi bên lối đi một khung, mép trái/phải trùng đúng mép ô ngoài cùng, cạnh dưới trùng đáy các ô, cạnh trên sát hàng bàn KCS → góc vuông kín
      {
        const c41 = D.fur.filter(
            (f) => f[2] === 2800 && f[3] === 4100 && f[4] === 0,
          ),
          zt = Z(183361 + 450),
          zb = Z(177271);
        [
          c41.filter((f) => X(f[0]) < aX),
          c41.filter((f) => X(f[0]) > aX),
        ].forEach((arr) => {
          if (!arr.length) return;
          const x0 = X(Math.min(...arr.map((f) => f[0]))) - 1.4,
            x1 = X(Math.max(...arr.map((f) => f[0]))) + 1.4;
          box("mark", (x0 + x1) / 2, 0.013, zt, x1 - x0 + t, 0.012, t, C.line);
          box("mark", (x0 + x1) / 2, 0.013, zb, x1 - x0 + t, 0.012, t, C.line);
          box("mark", x0, 0.013, (zt + zb) / 2, t, 0.012, zb - zt + t, C.line);
          box("mark", x1, 0.013, (zt + zb) / 2, t, 0.012, zb - zt + t, C.line);
        });
      }
      // khối tổ may giữa
      /* đã bỏ đường bao quanh toàn khối tổ may giữa theo yêu cầu */
      // đường dọc phía đông
      vl(1422, 35, 625);
      // vạch vàng chạy gần tường phía bắc (cách tường 0,9 m), chỉ nằm dưới các đoạn vách, để trống chỗ cửa vào
      [
        [781209, 794060],
        [794964, 813695],
        [826115, 834395],
        [836475, 845895],
        [847395, 850205],
        [851705, 858475],
        [861475, 880475],
        [893395, 911434],
        [916395, 927895],
        [928115, 931085],
        [933291, 936745],
      ].forEach(([a, b]) => {
        const z = Z(185850) + 0.9,
          x0 = X(a),
          x1 = X(b);
        box("mark", (x0 + x1) / 2, 0.013, z, x1 - x0 + t, 0.012, t, C.line);
      });
      // khu máy lập trình phía nam (cạnh dưới chừa đoạn hở)
      hl(38, 1403, 520);
      hl(38, 1120, 620);
      hl(1215, 1403, 620);
      vl(38, 520, 620);
      vl(1403, 520, 620);
    }
  }
  // ---------- dựng InstancedMesh ----------
  const MATS = {
    top: { r: 0.55 },
    leg: { r: 0.4, m: 0.2 },
    deskTop: { r: 0.5 },
    deskW: { r: 0.5 },
    mach: { r: 0.4, m: 0.3 },
    machW: { r: 0.5 },
    machTop: { r: 0.4, m: 0.3 },
    machHead: { r: 0.5 },
    crate: { r: 0.6 },
    stool: { r: 0.7 },
    chairBack: { r: 0.7 },
    legs: { r: 0.8 },
    body: { r: 0.8 },
    head: { r: 0.7 },
    hair: { r: 0.9 },
    col: { r: 0.8 },
    mark: { r: 0.6 },
    hole: { r: 0.9 },
    glassDark: { r: 0.15 },
    slab: { r: 0.8 },
    stairStep: { r: 0.8 },
    podium: { r: 0.5 },
    cab: { r: 0.6 },
    cart: { r: 0.5 },
    pot: { r: 0.7 },
    plant: { r: 0.9 },
    wire: { r: 0.6 },
  };
  batch.build(scene, MATS, {
    glass: true,
    fallbackColor: false,
    shadow: (key) => key !== "mark" && key !== "hole",
  });

  // ---------- nhãn phòng ----------
  const labelGroup = new THREE.Group();
  scene.add(labelGroup);
  function label(html, x, z, h, cls) {
    const el = document.createElement("div");
    el.className = "lbl" + (cls ? " " + cls : "");
    el.innerHTML = html;
    const o = new THREE.CSS2DObject(el);
    o.position.set(x, h, z);
    labelGroup.add(o);
    return o;
  }
  const seen = {};
  D.texts.forEach(([x, y, t]) => {
    const name = t.replace(/\s+/g, " ").trim();
    if (
      !name ||
      /^(TỔNG|TNG|\{|PHÒNG NHỒI LÔNG VŨ)/.test(name) ||
      y < BY0 ||
      y > BY1 ||
      x < BX0 ||
      x > BX1
    )
      return;
    const key = name + Math.round(x / 4000) + Math.round(y / 4000);
    if (seen[key]) return;
    seen[key] = 1;
    label(name, X(x) + name.length * 0.18, Z(y), 3.4, "small");
  });

  const CSEG = TNG.data.CSEG;

  TNG.areas.buildCanteen(F1, CSEG, app);

  TNG.features.setupFloors(
    { F1, scene, Y2, labelGroup, wallGroup, ceilGroup, X, Z, nSew, lineHeads },
    app,
  );

  // Match interactive areas to the same order as the numbered sewing signs.
  app.f2.sewingTeams = lineHeads.map(([x, z], index) => ({
    id: index + 1,
    name: `Tổ may ${index + 1}`,
    x,
    headZ: z,
    ...sewingZones[index],
  }));

  return app.f2;
};
