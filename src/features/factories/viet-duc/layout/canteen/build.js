TNG.areas.buildCanteen = function (F1, CSEG, app) {
  // ================= NHÀ ĂN CA (2 tầng: tầng 1 để xe máy, tầng 2 nhà ăn công nhân) — theo bản vẽ DWG + ảnh thực tế =================
  {
    const X0 = 15.4,
      Z0 = 60.0,
      FH = 4.7,
      EAVE = 6.4,
      RIDGE = 8.6; // lx,lz (m) trong bản vẽ → thế giới: x=X0+lx, z=Z0+lz; sàn tầng 2 cao 4,7 m ngang sàn tầng 2 xưởng
    const O = [1031083, 188922]; // gốc bản vẽ (mm): góc tây-bắc nhà ăn (trục 1 / trục f)
    const LX = (x) => (x - O[0]) / 1000 + X0,
      LZ = (y) => (O[1] - y) / 1000 + Z0;
    const c2 = new THREE.Group();
    F1.siteG.add(c2);
    app.cant2 = c2;
    c2.position.y = FH; // tầng 2 (đi theo "Tách tầng")
    const g1 = new THREE.Group();
    F1.siteG.add(g1);
    app.cant1 = g1; // tầng 1 nhà ăn (xe máy, cột, thang) — ẩn/hiện cùng tầng 1 xưởng
    const roofG = new THREE.Group();
    c2.add(roofG);
    app.cantRoof = roofG; // mái chỉ hiện ở chế độ Ngoại cảnh
    const mat = (c, r, m) =>
      new THREE.MeshStandardMaterial({
        color: c,
        roughness: r == null ? 0.75 : r,
        metalness: m || 0,
      });
    const M = {
      white: mat(0xf2f3f0, 0.8),
      slab: mat(0xbfc1c0, 0.85),
      floor: mat(0x9d9c97, 0.4, 0.08),
      dark: mat(0x1f2327, 0.5, 0.35),
      roof: mat(0x2aa4e0, 0.5, 0.15),
      conc: mat(0xdad9d4, 0.9),
      yel: mat(0xf2b705, 0.6),
      steel: mat(0xcfd4d8, 0.28, 0.8),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x9fc2d3,
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.32,
      }),
      tglass: new THREE.MeshStandardMaterial({
        color: 0x6d8686,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.6,
      }),
    };
    const B = (p, m, x, y, z, sx, sy, sz, ry, cast) => {
      const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
      o.position.set(x, y, z);
      if (ry) o.rotation.y = ry;
      o.castShadow = !!cast;
      o.receiveShadow = true;
      p.add(o);
      return o;
    };
    // ---- sàn tầng 2: tấm bê tông bao cả ban công, khoét 3 ô cho 3 thang bộ ----
    const SX0 = LX(1027300 - 0),
      SX1 = X0 + 47.4,
      SZ0 = Z0 - 0.1,
      SZ1 = Z0 + 40.5,
      SX0b = X0; // bỏ hành lang phía tây: sàn tầng 2 dừng ở tường tây
    const CR = 1.9; // bán kính bo góc ban công (góc đông nam, đông bắc)
    const holes = [
      [X0 + 45.5, Z0 + 3.5, X0 + 47.3, Z0 + 11.3],
      [X0 + 2.0, Z0 + 37.9, X0 + 9.8, Z0 + 39.9],
    ];
    {
      const CRn = CR;
      const sh = new THREE.Shape();
      sh.moveTo(SX0b, SZ0);
      sh.lineTo(SX1 - CRn, SZ0);
      sh.quadraticCurveTo(SX1, SZ0, SX1, SZ0 + CRn);
      sh.lineTo(SX1, SZ1 - CRn);
      sh.quadraticCurveTo(SX1, SZ1, SX1 - CRn, SZ1);
      sh.lineTo(SX0b + CRn, SZ1);
      sh.quadraticCurveTo(SX0b, SZ1, SX0b, SZ1 - CRn);
      sh.closePath();
      holes.forEach(([a, b, c, d]) => {
        const h = new THREE.Path();
        h.moveTo(a, b);
        h.lineTo(c, b);
        h.lineTo(c, d);
        h.lineTo(a, d);
        h.closePath();
        sh.holes.push(h);
      });
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.4,
        bevelEnabled: false,
      });
      g.rotateX(Math.PI / 2);
      const s = new THREE.Mesh(g, M.slab);
      s.receiveShadow = true;
      s.castShadow = true;
      c2.add(s);
      const g2 = new THREE.ExtrudeGeometry(
        (() => {
          const q = new THREE.Shape();
          q.moveTo(X0, Z0);
          q.lineTo(X0 + 45.39, Z0);
          q.lineTo(X0 + 45.39, Z0 + 37.1);
          q.lineTo(X0, Z0 + 37.1);
          q.closePath();
          return q;
        })(),
        { depth: 0.02, bevelEnabled: false },
      );
      g2.rotateX(Math.PI / 2);
      const f = new THREE.Mesh(g2, M.floor);
      f.position.y = 0.02;
      f.receiveShadow = true;
      c2.add(f);
    } // mặt sàn epoxy xám trong nhà ăn
    // ---- tầng 1: nền bê tông, cột lưới 7,5 × 7 m ----
    B(
      g1,
      mat(0xaeb0ad, 0.95),
      (SX0b + SX1) / 2,
      0.005,
      (SZ0 + SZ1) / 2,
      SX1 - SX0b,
      0.03,
      SZ1 - SZ0,
      0,
      false,
    );
    const colX = [0, 1, 2, 3, 4, 5, 6].map((k) => X0 + 0.2 + 7.5 * k),
      colZ = [2, 9, 16, 23, 30, 37.1].map((v) => Z0 + v);
    colX.forEach((x) =>
      colZ.forEach((z) =>
        B(g1, M.white, x, (FH - 0.4) / 2, z, 0.5, FH - 0.4, 0.5, 0, true),
      ),
    );
    // ---- xe máy đỗ tầng 1: các dãy đôi dọc theo nhịp cột ----
    {
      const bz = [2, 9, 16, 23, 30].map((v) => Z0 + v),
        pal = [
          0x1b1d20, 0x1b1d20, 0xc8202a, 0xf0f0f0, 0x2f6fd6, 0x8d959e, 0x6b1d22,
          0x1b1d20,
        ];
      const items = [];
      for (const z0 of bz) {
        for (const row of [0, 1]) {
          const zc = z0 + 1.5 + row * 1.95 + 0.95,
            s = row ? 1 : -1;
          for (let x = X0 + 1.1; x < X0 + 44.5; x += 0.78) {
            if (colX.some((c) => Math.abs(c - x) < 0.5)) continue;
            if (Math.random() < 0.1) continue;
            items.push([x, zc, s, pal[Math.floor(Math.random() * pal.length)]]);
          }
        }
      }
      const mk = (geo, m, col) => {
        const im = new THREE.InstancedMesh(geo, m, items.length);
        im.castShadow = false;
        im.receiveShadow = false;
        g1.add(im);
        return im;
      };
      const dm = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.2,
      });
      const body = mk(new THREE.BoxGeometry(0.4, 0.34, 0.95), dm),
        seat = mk(new THREE.BoxGeometry(0.3, 0.12, 0.6), mat(0x15171a)),
        bar = mk(new THREE.BoxGeometry(0.62, 0.05, 0.05), mat(0x15171a)),
        fork = mk(
          new THREE.BoxGeometry(0.05, 0.55, 0.05),
          mat(0x2b2f33, 0.5, 0.5),
        );
      const wg = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12);
      wg.rotateZ(Math.PI / 2);
      const wh1 = mk(wg, mat(0x16181b)),
        wh2 = mk(wg, mat(0x16181b));
      const m4 = new THREE.Matrix4(),
        col = new THREE.Color();
      items.forEach(([x, z, s, c], i) => {
        const put = (im, dx, y, dz) => {
          m4.makeTranslation(x + dx, y, z + dz * s);
          im.setMatrixAt(i, m4);
        };
        put(body, 0, 0.5, 0);
        put(seat, 0, 0.74, -0.15);
        put(bar, 0, 0.98, 0.42);
        put(fork, 0, 0.68, 0.42);
        put(wh1, 0, 0.28, 0.55);
        put(wh2, 0, 0.28, -0.55);
        body.setColorAt(i, col.setHex(c));
      });
      [body, seat, bar, fork, wh1, wh2].forEach((im) => {
        im.instanceMatrix.needsUpdate = true;
      });
      body.instanceColor.needsUpdate = true;
    }
    // ---- tường bao nhà ăn: kính + khung đen, nền tường trắng thấp, dầm trên ----
    const wallRun = (x1, z1, x2, z2, glass) => {
      const L = Math.hypot(x2 - x1, z2 - z1),
        cx = (x1 + x2) / 2,
        cz = (z1 + z2) / 2,
        ry = Math.atan2(-(z2 - z1), x2 - x1);
      B(c2, M.white, cx, 0.45, cz, L, 0.9, 0.3, ry, false); // chân tường 0,9 m
      if (glass) {
        B(c2, M.glass, cx, 3.15, cz, L, 4.5, 0.06, ry, false);
        B(c2, M.white, cx, 5.9, cz, L, 1.0, 0.3, ry, false);
        const n = Math.max(1, Math.round(L / 3.75));
        for (let i = 0; i <= n; i++) {
          const t = i / n,
            px = x1 + (x2 - x1) * t,
            pz = z1 + (z2 - z1) * t;
          B(c2, M.dark, px, 3.15, pz, 0.22, 4.5, 0.22, ry, false);
        }
        B(c2, M.dark, cx, 3.15, cz, L, 0.12, 0.14, ry, false);
      } else
        B(c2, M.white, cx, EAVE / 2 + 0.45, cz, L, EAVE - 0.9, 0.3, ry, false);
    };
    const hx0 = X0,
      hx1 = X0 + 45.39,
      hz0 = Z0,
      hz1 = Z0 + 37.1,
      bx = 34.5;
    wallRun(hx0, hz1, hx0, hz0 + 0.3, true);
    wallRun(hx1, hz0 + 0.3, hx1, hz1, true); // đầu hồi tây, đông
    wallRun(hx0, hz1, hx0 + 8, hz1, true);
    wallRun(hx0 + 8, hz1, hx1, hz1, true); // mặt nam
    wallRun(hx0, hz0, X0 + 8.4, hz0, true);
    wallRun(X0 + 9.8, hz0, bx - 1.6, hz0, true);
    wallRun(bx + 1.6, hz0, hx1, hz0, true); // mặt bắc (bếp) chừa cửa cho cầu nối
    // ---- tường trong khu bếp & phòng phụ lấy từ bản vẽ (lớp TUONG) ----
    // xoay khu bếp + phòng phụ (dải phía bắc) 90° sang dải phía tây (phía chòi hút thuốc): bắc→tây, tây→nam, đông→bắc; chiều dài dải 45,4 m co lại vừa chiều sâu nhà 36,5 m
    const RS = 36.5 / 45.4,
      ROT = (lx, lz) => [X0 + lz, Z0 + 0.3 + (45.4 - lx) * RS];
    CSEG.wall.forEach(([a, b, c, d]) => {
      let x1 = LX(a),
        x2 = LX(c),
        z1 = LZ(b),
        z2 = LZ(d);
      if (
        Math.hypot(x2 - x1, z2 - z1) < 0.25 ||
        Math.hypot(x2 - x1, z2 - z1) > 60 ||
        Math.min(x1, x2) < X0 - 0.3 ||
        Math.max(x1, x2) > X0 + 45.8 ||
        Math.max(z1, z2) > Z0 + 37.5
      )
        return;
      {
        const lx0 = Math.min(x1, x2) - X0,
          lzm = Math.max(z1, z2) - Z0;
        if (lzm <= 0.35) return; // tường bắc nay là vách kính (wallRun) — bỏ các nét tường đặc của bản vẽ để lộ cửa
        if (lzm <= 13.2 && lzm > 0.35 && lx0 >= 0.9) {
          [x1, z1] = ROT(x1 - X0, z1 - Z0);
          [x2, z2] = ROT(x2 - X0, z2 - Z0);
        }
      }
      const L = Math.hypot(x2 - x1, z2 - z1);
      B(
        c2,
        M.white,
        (x1 + x2) / 2,
        1.7,
        (z1 + z2) / 2,
        L,
        3.4,
        0.08,
        Math.atan2(-(z2 - z1), x2 - x1),
        false,
      );
    });
    // ---- bếp: bếp tròn dọc tường bắc, 8 bàn soạn chia inox, quầy chia cơm dài ----
    for (const px of [830, 880, 930, 980, 1030, 1075, 1120]) {
      const [x, z] = ROT(LX(1020000 + px * 38.89) - X0, 1.1);
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.9, 16),
        M.steel,
      );
      c.position.set(x, 0.45, z);
      c2.add(c);
      B(c2, M.dark, x, 0.95, z, 0.9, 0.1, 0.9, 0, false);
    }
    for (const cx of [18.8, 22.7, 26.6, 30.5])
      for (const cz of [8.3, 10.7]) {
        const [px, pz] = ROT(cx, cz);
        B(c2, M.steel, px, 0.43, pz, 1.2, 0.86, 2.4, 0, false);
      }
    {
      const [qx, qz] = ROT(24.4, 13.45);
      B(c2, M.steel, qx, 0.5, qz, 1.2, 1.0, 11.4, 0, false);
      B(c2, mat(0x2a2f35, 0.4, 0.3), qx, 1.03, qz, 1.3, 0.06, 11.5, 0, false);
    }
    // ---- bàn kính chân đen khung thép + ghế đẩu inox dạng lồng (theo ảnh camera nhà ăn) ----
    {
      const tl = 4.5,
        tw = 1.1,
        tcx = [17.25, 22.05, 26.85, 32.85, 37.65, 42.45],
        rz = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
          (k) => Z0 + 3.1 + 2.6 * k,
        ),
        n = rz.length * tcx.length;
      const merge = (parts) => {
        const pos = [],
          nor = [];
        parts.forEach(([g, mx]) => {
          g.applyMatrix4(mx);
          const t = g.toNonIndexed();
          pos.push(...t.attributes.position.array);
          nor.push(...t.attributes.normal.array);
        });
        const r = new THREE.BufferGeometry();
        r.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        r.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
        return r;
      };
      const T = (x, y, z, rx) => {
        const m = new THREE.Matrix4().makeTranslation(x, y, z);
        if (rx) m.multiply(new THREE.Matrix4().makeRotationX(rx));
        return m;
      };
      // ghế đẩu: mặt tròn + 3 vành + 10 thanh đứng
      const sp = [
        [new THREE.CylinderGeometry(0.17, 0.17, 0.03, 16), T(0, 0.43, 0)],
      ];
      for (const y of [0.05, 0.22, 0.38])
        sp.push([
          new THREE.TorusGeometry(0.165, 0.011, 5, 16),
          T(0, y, 0, Math.PI / 2),
        ]);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        sp.push([
          new THREE.CylinderGeometry(0.009, 0.009, 0.4, 4),
          T(Math.cos(a) * 0.165, 0.22, Math.sin(a) * 0.165),
        ]);
      }
      const top = new THREE.InstancedMesh(
        new THREE.BoxGeometry(tl, 0.014, tw),
        M.tglass,
        n,
      );
      const legs = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.09, 0.76, 0.09),
          M.dark,
          n * 4,
        ),
        endb = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.06, 0.06, tw - 0.2),
          M.dark,
          n * 2,
        ),
        midb = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.05, 0.05, tw - 0.2),
          M.dark,
          n * 3,
        ),
        lon = new THREE.InstancedMesh(
          new THREE.BoxGeometry(tl - 0.3, 0.05, 0.05),
          M.dark,
          n,
        );
      const stool = new THREE.InstancedMesh(
        merge(sp),
        new THREE.MeshStandardMaterial({
          color: 0xd5dade,
          roughness: 0.3,
          metalness: 0.9,
        }),
        n * 10,
      );
      [top, legs, endb, midb, lon, stool].forEach((m) => c2.add(m));
      const m4 = new THREE.Matrix4();
      let ti = 0,
        li = 0,
        ei = 0,
        mi = 0,
        oi = 0,
        si = 0;
      for (const z of rz)
        for (const cx of tcx) {
          const x = X0 + cx;
          m4.makeTranslation(x, 0.766, z);
          top.setMatrixAt(ti++, m4);
          for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
              m4.makeTranslation(
                x + sx * (tl / 2 - 0.12),
                0.38,
                z + sz * (tw / 2 - 0.1),
              );
              legs.setMatrixAt(li++, m4);
            }
            m4.makeTranslation(x + sx * (tl / 2 - 0.12), 0.72, z);
            endb.setMatrixAt(ei++, m4);
          }
          for (const o of [-1.4, 0, 1.4]) {
            m4.makeTranslation(x + o, 0.72, z);
            midb.setMatrixAt(mi++, m4);
          }
          m4.makeTranslation(x, 0.7, z);
          lon.setMatrixAt(oi++, m4);
          for (const sz of [-1, 1])
            for (let k = 0; k < 5; k++) {
              m4.makeTranslation(
                x - 1.9 + k * 0.95 + (((k * 7 + ti) % 5) - 2) * 0.05,
                0.0,
                z + sz * (tw / 2 + 0.2 + ((k * 3 + ti) % 3) * 0.05),
              );
              stool.setMatrixAt(si++, m4);
            }
        }
      [top, legs, endb, midb, lon, stool].forEach(
        (m) => (m.instanceMatrix.needsUpdate = true),
      );
      // vạch vàng kẻ lối đi quanh 2 cụm bàn
      const yl = (x0, z0, x1, z1) => {
        const t = 0.12;
        B(c2, M.yel, (x0 + x1) / 2, 0.045, z0, x1 - x0, 0.01, t, 0, false);
        B(c2, M.yel, (x0 + x1) / 2, 0.045, z1, x1 - x0, 0.01, t, 0, false);
        B(c2, M.yel, x0, 0.045, (z0 + z1) / 2, t, 0.01, z1 - z0, 0, false);
        B(c2, M.yel, x1, 0.045, (z0 + z1) / 2, t, 0.01, z1 - z0, 0, false);
      };
      yl(X0 + 14.75, Z0 + 1.4, X0 + 29.35, Z0 + 35.4);
      yl(X0 + 30.35, Z0 + 1.4, X0 + 44.95, Z0 + 35.4);
    }
    // ---- ban công + lan can sắt đen quanh mép sàn (trừ miệng 3 thang) ----
    {
      const dk = M.dark,
        x0 = SX0b + 0.06,
        x1 = SX1 - 0.06,
        z0 = SZ0 + 0.06,
        z1 = SZ1 - 0.06,
        R = CR - 0.06; // lan can chạy theo mép sàn, bo tròn 2 góc ngoài phía đông
      const pts = [],
        st = 0.14,
        push = (x, z, yaw) => pts.push([x, z, yaw]);
      for (let z = Z0 + 37.1; z < z1 - R; z += st) push(x0, z, -Math.PI / 2); // mép tây đầu hành lang phía nam
      for (let k = 0; k <= 12; k++) {
        const t = Math.PI - ((k / 12) * Math.PI) / 2;
        push(
          x0 + R + R * Math.cos(t),
          z1 - R + R * Math.sin(t),
          Math.PI / 2 - t,
        );
      } // bo góc tây nam
      for (let x = x0 + R; x < x1 - R; x += st) push(x, z1, 0); // mặt nam
      for (let k = 0; k <= 12; k++) {
        const t = Math.PI / 2 - ((k / 12) * Math.PI) / 2;
        push(
          x1 - R + R * Math.cos(t),
          z1 - R + R * Math.sin(t),
          -(t - Math.PI / 2),
        );
      } // bo góc đông nam
      for (let z = z1 - R; z > z0 + R; z -= st) push(x1, z, Math.PI / 2); // mặt đông
      for (let k = 0; k <= 12; k++) {
        const t = ((-k / 12) * Math.PI) / 2;
        push(
          x1 - R + R * Math.cos(t),
          z0 + R + R * Math.sin(t),
          -(t - Math.PI / 2),
        );
      } // bo góc đông bắc
      const n = pts.length,
        q = new THREE.Quaternion(),
        m4 = new THREE.Matrix4(),
        one = new THREE.Vector3(1, 1, 1),
        up = new THREE.Vector3(0, 1, 0);
      const bal = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.02, 0.95, 0.02),
          dk,
          n,
        ),
        r1 = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.2, 0.05, 0.05),
          dk,
          n,
        ),
        r2 = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.2, 0.05, 0.05),
          dk,
          n,
        ),
        post = new THREE.InstancedMesh(
          new THREE.BoxGeometry(0.07, 1.1, 0.07),
          dk,
          Math.ceil(n / 10) + 1,
        );
      let pi = 0;
      pts.forEach(([x, z, yaw], i) => {
        q.setFromAxisAngle(up, yaw);
        m4.compose(new THREE.Vector3(x, 0.55, z), q, one);
        bal.setMatrixAt(i, m4);
        m4.compose(new THREE.Vector3(x, 0.55, z), q, one);
        r1.setMatrixAt(i, m4);
        m4.compose(new THREE.Vector3(x, 1.1, z), q, one);
        r2.setMatrixAt(i, m4);
        if (i % 10 === 0) {
          m4.compose(new THREE.Vector3(x, 0.55, z), q, one);
          post.setMatrixAt(pi++, m4);
        }
      });
      post.count = pi;
      [bal, r1, r2, post].forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
        c2.add(m);
      });
    }
    // ---- 3 thang bộ bê tông, tay vịn sắt đen (trục 1'-1 phía tây bắc, 7-7' phía đông bắc, đoạn nam phía đông nam) ----
    {
      const n = 26,
        rise = FH / n,
        run = 0.3,
        L = n * run,
        a = Math.atan(FH / L),
        len = Math.hypot(L, FH);
      const flight = (tx, tz, dx, dz, w) => {
        const g = new THREE.Group();
        g.position.set(tx, FH, tz);
        g.rotation.y = Math.atan2(-dz, dx);
        g1.add(g);
        const sl = B(
          g,
          M.conc,
          L / 2,
          -FH / 2 - 0.12,
          0,
          len,
          0.25,
          w,
          0,
          true,
        );
        sl.rotation.z = -a;
        for (let i = 0; i < n; i++)
          B(
            g,
            M.conc,
            (i + 0.5) * run,
            -(i + 0.5) * rise,
            0,
            run,
            rise,
            w,
            0,
            false,
          );
        for (const s of [-1, 1]) {
          const zz = s * (w / 2 - 0.03);
          for (const hh of [0.5, 1.0]) {
            const r = B(
              g,
              M.dark,
              L / 2,
              -FH / 2 + hh,
              zz,
              len,
              0.045,
              0.045,
              0,
              false,
            );
            r.rotation.z = -a;
          }
          for (let i = 0; i <= n; i += 3)
            B(
              g,
              M.dark,
              i * run,
              -i * rise + 0.5,
              zz,
              0.06,
              1.0,
              0.06,
              0,
              false,
            );
        }
      };
      flight(X0 + 46.4, Z0 + 11.3, 0, -1, 1.9);
      flight(X0 + 9.8, Z0 + 38.9, -1, 0, 1.9);
      flight(X0 + 7.8, Z0 - 0.95, -1, 0, 1.9); // thang thứ 4: mặt bắc, chân thang ở góc tây bắc, đi lên về phía đông tới cửa phụ bếp
      B(c2, M.slab, X0 + 8.9, -0.2, Z0 - 0.95, 2.2, 0.4, 1.9, 0, true); // sàn chờ đầu thang
      for (const y of [0.55, 1.1]) {
        B(c2, M.dark, X0 + 8.9, y, Z0 - 1.9, 2.2, 0.05, 0.05, 0, false);
        B(c2, M.dark, X0 + 10.0, y, Z0 - 0.95, 0.05, 0.05, 1.9, 0, false);
      }
      for (const [x, z] of [
        [X0 + 7.8, Z0 - 1.9],
        [X0 + 8.9, Z0 - 1.9],
        [X0 + 10.0, Z0 - 1.9],
        [X0 + 10.0, Z0 - 0.95],
      ])
        B(c2, M.dark, x, 0.55, z, 0.07, 1.1, 0.07, 0, false);
    }
    // ---- mái tôn xanh 2 dốc + kèo thép (chỉ hiện ở Ngoại cảnh, đồng bộ với mái xưởng) ----
    {
      const rx0 = X0 - 1.4,
        rx1 = hx1 + 1.4,
        rz0 = hz0 - 0.9,
        rz1 = hz1 + 1.0,
        half = (rz1 - rz0) / 2,
        zm = (rz0 + rz1) / 2,
        ang = Math.atan2(RIDGE - EAVE, half),
        sl = Math.hypot(half, RIDGE - EAVE);
      for (const s of [-1, 1]) {
        const r = B(
          roofG,
          M.roof,
          (rx0 + rx1) / 2,
          (EAVE + RIDGE) / 2 + 0.15,
          zm + (s * half) / 2,
          rx1 - rx0,
          0.3,
          sl,
          0,
          true,
        );
        r.rotation.x = s * ang;
      }
      for (let x = X0; x <= hx1 + 0.1; x += 7.5) {
        for (const s of [-1, 1]) {
          const r = B(
            roofG,
            M.dark,
            x,
            (EAVE + RIDGE) / 2 - 0.1,
            zm + ((s * half) / 2) * 0.98,
            0.18,
            0.18,
            sl * 0.98,
            0,
            false,
          );
          r.rotation.x = s * ang;
        }
      }
    }
  }
};
