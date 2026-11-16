TNG.features.setupFloors = function (
  { F1, scene, Y2, labelGroup, wallGroup, ceilGroup, X, Z, nSew, lineHeads },
  app,
) {
  // ================= GỘP 2 TẦNG =================
  const f2 = scene;
  const f1root = new THREE.Group();
  F1.scene.add(f1root);
  {
    const keep = new Set([
      F1.skyDome,
      F1.ground,
      F1.siteG,
      F1.extGroup,
      f2,
      f1root,
    ]);
    [...F1.scene.children].forEach((c) => {
      if (c.isLight || keep.has(c)) return;
      f1root.add(c);
    });
  } // toàn bộ nội thất tầng 1 vào 1 nhóm để ẩn/hiện
  document.querySelector(".panel h1").textContent =
    "Nhà máy may TNG Việt Đức · Tầng 1 + Tầng 2";
  document.querySelector(".panel .sub").textContent =
    "Mô hình 3D ghép 2 tầng: tầng 1 theo bản vẽ hoàn công, tầng 2 theo bản vẽ tầng 2 mới nhất và hồ sơ văn phòng";
  document.querySelector(".panel .meta").textContent =
    "≈ 180 × 70 m · 2 tầng · 24 tổ may tầng 2";

  let mode = "both",
    liftT = 0,
    liftNow = 0,
    flowLift = 0;
  const fp = F1.fp,
    isL2 = fp.map((p) => p.y > 5.5); // các điểm của luồng hàng nằm ở tầng 2
  const tb = document.querySelector(".toolbar");
  function mk(id, txt) {
    const b = document.createElement("button");
    b.id = id;
    b.textContent = txt;
    b.setAttribute("aria-pressed", "false");
    return b;
  }
  const sep = document.createElement("span");
  sep.className = "sep";
  tb.appendChild(sep);
  const bT1 = mk("mT1", "Tầng 1"),
    bT2 = mk("mT2", "Tầng 2"),
    bBoth = mk("mBoth", "Cả hai"),
    bSplit = mk("mSplit", "Tách tầng"),
    bCeil = mk("tCeil2", "Trần T2");
  [bT1, bT2, bBoth, bSplit, bCeil].forEach((b) => tb.appendChild(b));
  function setMode(m) {
    mode = m;
    f1root.visible = m !== "f2";
    f2.visible = m !== "f1";
    if (app.cant1) {
      app.cant1.visible = m !== "f2";
      app.cant2.visible = m !== "f1";
    } // nhà ăn: T1 đi theo T1 xưởng, T2 đi theo T2 xưởng
    F1.setPressed("mT1", m === "f1");
    F1.setPressed("mT2", m === "f2");
    F1.setPressed("mBoth", m === "both");
  }
  bT1.onclick = () => setMode("f1");
  bT2.onclick = () => setMode("f2");
  bBoth.onclick = () => setMode("both");
  bSplit.onclick = () => {
    const on = bSplit.getAttribute("aria-pressed") !== "true";
    F1.setPressed("mSplit", on);
    liftT = on ? 26 : 0;
    if (on) setMode("both");
  };
  bCeil.onclick = () => {
    const on = bCeil.getAttribute("aria-pressed") !== "true";
    F1.setPressed("tCeil2", on);
    ceilGroup.visible = on;
  };
  setMode("both");
  // tầng 2 (bản vẽ riêng) nhỏ hơn tầng 1 ~3,5 m mỗi đầu hồi → co giãn cho 4 mặt tường trùng khít tầng 1 (thang bộ + hành lang nằm NGOÀI tường đông)
  f2.scale.set(180.67 / 173.4, 1, 70.29 / 69.8);
  f2.position.x = 0.2;
  document
    .getElementById("vExt")
    .addEventListener("click", () => setMode("both"));
  // mái xưởng (mặt hồi tam giác, 2 mái dốc + pin, dải kính nóc, xà nóc: các khối từ cao độ 10,5 m trở lên) nâng cùng tầng 2 khi "Tách tầng"
  const roofParts = F1.extGroup.children
    .filter((o) => o.position.y >= 10.4)
    .map((o) => [o, o.position.y]);
  let labelState = "",
    lastTubeUpdate = -Infinity;
  F1.frameHooks.push((dt, now) => {
    const moving = Math.abs(liftT - liftNow) > 0.001;
    if (moving) {
      liftNow += (liftT - liftNow) * (1 - Math.pow(0.88, dt * 60));
      if (Math.abs(liftT - liftNow) <= 0.001) liftNow = liftT;
      F1.invalidate(true);
    }
    f2.position.y = Y2 + liftNow;
    roofParts.forEach(([o, y0]) => {
      o.position.y = y0 + liftNow;
    });
    if (app.cant2) {
      app.cant2.position.y = Y2 + liftNow;
      app.cantRoof.visible = F1.extGroup.visible;
    } // tầng 2 nhà ăn ca nâng cùng tầng 2 xưởng khi "Tách tầng"; mái chỉ hiện ở Ngoại cảnh
    // luồng hàng: đoạn đi trên tầng 2 nâng theo tầng 2 → khi "Tách tầng" đoạn lên/xuống tự kéo dài ra, dễ nhìn
    if (
      liftNow !== flowLift &&
      (now - lastTubeUpdate >= 80 || liftNow === liftT)
    ) {
      lastTubeUpdate = now;
      flowLift = liftNow;
      fp.forEach((p, i) => {
        if (isL2[i]) p.y = 6.9 + liftNow;
      });
      F1.curve.updateArcLengths();
      const g = new THREE.TubeGeometry(
        F1.curve,
        F1.FLOW_SEGMENTS,
        0.28,
        F1.FLOW_RADIAL,
        false,
      );
      if (F1.__colAttr) g.setAttribute("color", F1.__colAttr);
      F1.tube.geometry.dispose();
      F1.tube.geometry = g;
      F1.markFlowDirty();
    }
    const lblOn = F1.labelGroup.visible;
    labelGroup.visible = lblOn;
    wallGroup.visible = F1.wallGroup.visible; // nút "Nhãn" và "Tường" điều khiển cả 2 tầng
    // nhãn CSS không tự ẩn theo nhóm cha → tắt từng nhãn theo tầng đang hiện (ẩn tầng nào thì ẩn nhãn tầng đó)
    const on1 = lblOn && f1root.visible,
      on2 = lblOn && f2.visible;
    // CSS2D labels have no depth test, so hide lower interior labels under the slab.
    const lowerLabelsExposed = !f2.visible || liftNow > 1;
    const state = [on1, on2, lowerLabelsExposed].join();
    if (state !== labelState) {
      F1.labelGroup.children.forEach((c) => {
        c.visible = on1 && (lowerLabelsExposed || !c.userData.interiorLabel);
      });
      labelGroup.children.forEach((c) => {
        c.visible = on2;
      });
      labelState = state;
    }
    return liftNow !== liftT;
  });

  // danh sách khu: tầng 1 bay tới thì chỉ hiện tầng 1; thêm các khu tầng 2
  document
    .querySelectorAll("ol.zones button")
    .forEach((b) =>
      b.addEventListener("click", () =>
        setMode(b.id === "z-all" ? "both" : "f1"),
      ),
    );
  const ZONES2 = [
    {
      id: "vp",
      n: "T2·1",
      name: "Khu văn phòng",
      d: "Giám đốc, họp lớn, café, kinh doanh, kỹ thuật, y tế, lễ tân",
      col: "#d6336c",
      c: [927000, 155000],
      dist: 42,
      dh: 30,
    },
    {
      id: "may",
      n: "T2·2",
      name: "24 tổ may",
      d: "Bàn máy may, biển tổ treo đầu chuyền, bàn KCS",
      col: "#1f5fa8",
      c: [862000, 157000],
      dist: 62,
      dh: 36,
    },
    {
      id: "ltr",
      n: "T2·3",
      name: "Khu máy lập trình",
      d: "2 hàng buồng máy may mẫu tự động",
      col: "#7a52b8",
      c: [843000, 132000],
      dist: 55,
      dh: 26,
    },
    {
      id: "la",
      n: "T2·4",
      name: "Bàn kiểm · là hơi",
      d: "Cuối mỗi tổ may",
      col: "#d08a00",
      c: [862000, 180000],
      dist: 55,
      dh: 26,
    },
    {
      id: "nhoi",
      n: "T2·5",
      name: "Phòng nhồi lông vũ",
      d: "3 phòng dọc đầu hồi phía tây",
      col: "#2f8f6a",
      c: [772000, 158000],
      dist: 50,
      dh: 30,
    },
    {
      id: "wc",
      n: "T2·6",
      name: "WC · thang bộ",
      d: "WC nam/nữ và 5 buồng thang xuống tầng 1",
      col: "#5b6875",
      c: [809000, 187000],
      dist: 34,
      dh: 22,
    },
  ];
  {
    const zl = document.getElementById("zones"),
      all = document.getElementById("z-all").parentNode;
    const hd = document.createElement("li");
    hd.innerHTML =
      '<div style="padding:10px 10px 4px;font:700 12px var(--f-ui);color:var(--muted);letter-spacing:.04em">TẦNG 2</div>';
    zl.insertBefore(hd, all);
    ZONES2.forEach((z) => {
      const li = document.createElement("li"),
        b = document.createElement("button");
      b.type = "button";
      b.id = "z2-" + z.id;
      b.innerHTML = `<span class="num" style="background:${z.col};font-size:9px">${z.n}</span><span><div class="zn">${z.name}</div><div class="zd">${z.d}</div></span>`;
      b.addEventListener("click", () => {
        document
          .querySelectorAll("ol.zones button")
          .forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        if (mode === "f1") setMode("both");
        const t = new THREE.Vector3(X(z.c[0]), f2.position.y, Z(z.c[1]));
        F1.flyTo(new THREE.Vector3(t.x - 6, t.y + z.dh, t.z + z.dist), t);
        F1.extGroup.visible = false;
        F1.setPressed("vExt", false);
        F1.setPressed("vPersp", false);
        F1.setPressed("vTop", false);
      });
      li.appendChild(b);
      zl.insertBefore(li, all);
    });
  }
  // ---------- luồng hàng: màu chuyển dần từ ĐỎ (đầu vào) → vàng → XANH LÁ (đầu ra) ----------
  {
    const cRed = new THREE.Color(0xe02424),
      cGreen = new THREE.Color(0x1fb83a);
    const gc = (u) => {
      const t = Math.max(0, Math.min(1, (u - 0.4) / 0.2));
      return cRed.clone().lerp(cGreen, t * t * (3 - 2 * t));
    }; // chỉ 2 màu: đỏ (đầu vào) chuyển dần sang xanh lá (đầu ra), chuyển ở giữa đường
    const pts = F1.curve.getPoints(400),
      NS = pts.length - 1;
    const nearU = (p, flat) => {
      let bi = 0,
        bd = 1e12;
      for (let i = 0; i <= NS; i++) {
        const q = pts[i];
        if (flat && q.y > 5.5) continue;
        const dx = q.x - p.x,
          dz = q.z - p.z,
          dy = flat ? 0 : q.y - p.y,
          d = dx * dx + dz * dz + dy * dy;
        if (d < bd) {
          bd = d;
          bi = i;
        }
      }
      return bi / NS;
    };
    // ống luồng hàng: tô màu theo từng đoạn dọc đường
    const geo = F1.tube.geometry,
      nv = geo.attributes.position.count,
      rad = F1.FLOW_RADIAL + 1,
      cols = new Float32Array(nv * 3);
    for (let i = 0; i < nv; i++) {
      const c = gc(Math.floor(i / rad) / F1.FLOW_SEGMENTS);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    const colAttr = new THREE.BufferAttribute(cols, 3);
    geo.setAttribute("color", colAttr);
    F1.__colAttr = colAttr;
    const tm = F1.tube.material;
    tm.vertexColors = true;
    tm.color.setHex(0xffffff);
    tm.emissive.setHex(0x101010);
    tm.opacity = 0.95;
    tm.needsUpdate = true;
    // mũi tên chạy: màu theo vị trí hiện tại trên đường
    const am = F1.arrows.material;
    am.color.setHex(0xffffff);
    am.emissive.setHex(0x101010);
    am.needsUpdate = true;
    const cc = new THREE.Color();
    F1.arrows.setColorAt(0, cc.setHex(0xffffff));
    F1.__arrowTick = (off) => {
      for (let i = 0; i < F1.NA; i++) {
        const u = (i / F1.NA + off) % 1,
          t = Math.max(0, Math.min(1, (u - 0.4) / 0.2));
        F1.arrows.setColorAt(
          i,
          cc.copy(cRed).lerp(cGreen, t * t * (3 - 2 * t)),
        );
      }
      F1.arrows.instanceColor.needsUpdate = true;
    };
    // cọc + vòng đánh dấu các điểm dừng: đỏ ở điểm đầu → xanh ở điểm cuối
    F1.flowGroup.children.forEach((c) => {
      if (c === F1.tube || c === F1.arrows) return;
      c.material = c.material.clone();
      c.material.color.copy(gc(nearU(c.position, true)));
    });
  }
  F1.markFlowDirty();
  // chú thích tổng diện tích xây dựng (nút "Diện tích" ẩn/hiện)
  {
    const el = document.createElement("div");
    el.className = "lbl";
    el.style.cssText =
      "font-size:15px;padding:8px 16px;background:#1f5fa8;color:#fff;border-color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.35)";
    el.innerHTML =
      'Tổng diện tích xây dựng <b style="font-size:17px">40.521 m²</b>';
    // lớp CSS2D riêng, không bị ảnh hưởng khi chuyển chế độ Ngoại cảnh / tắt Nhãn
    const stg = document.getElementById("stage"),
      lr2 = new THREE.CSS2DRenderer();
    lr2.setSize(stg.clientWidth, stg.clientHeight);
    lr2.domElement.style.cssText =
      "position:absolute;inset:0;pointer-events:none";
    stg.appendChild(lr2.domElement);
    const sc2 = new THREE.Scene(),
      o = new THREE.CSS2DObject(el);
    o.position.set(0, 24, 0);
    sc2.add(o);
    window.addEventListener("resize", () =>
      lr2.setSize(stg.clientWidth, stg.clientHeight),
    );
    F1.labelRenderers.push(() => lr2.render(sc2, F1.camera));
    const b = document.createElement("button");
    b.id = "tArea";
    b.textContent = "Diện tích";
    b.setAttribute("aria-pressed", "true");
    document.querySelector(".toolbar").appendChild(b);
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      F1.setPressed("tArea", on);
      o.visible = on;
    };
  }
  // Batch opaque static leaves locally. Parent groups retain floor/wall/ceiling toggles.
  // Keep movable roof pieces, animated flow, transparent surfaces and existing instances.

  const batchStatic = TNG.core.createStaticBatcher(F1);
  const batchStats = {
    meshesBefore: 0,
    batches: 0,
    removedGeometries: new Set(),
  };
  batchStatic(F1.scene, batchStats);
  const retainedGeometries = new Set();
  F1.scene.traverse((o) => {
    if (o.geometry) retainedGeometries.add(o.geometry);
  });
  for (const g of batchStats.removedGeometries)
    if (!retainedGeometries.has(g)) g.dispose();
  app.batchStats = {
    meshesBefore: batchStats.meshesBefore,
    batches: batchStats.batches,
  };
  F1.invalidate(true);
  app.f2 = { f2, f1root, setMode };
  app.stats2 = { sew: nSew, heads: lineHeads.length };
};
