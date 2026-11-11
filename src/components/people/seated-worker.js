(function () {
  "use strict";
  TNG.components.worker = function createWorker({
    box,
    cyl,
    sph,
    rnd,
    SHIRTS,
    SKIN,
  }) {
    function worker(px, pz, fx, fz) {
      const sh = SHIRTS[Math.floor(rnd() * SHIRTS.length)],
        sk = SKIN[Math.floor(rnd() * 3)],
        ax = Math.abs(fx) > 0,
        jean = 0x2a3550;
      const SX = (a, b) => (ax ? [a, b] : [b, a]); // đổi (dọc hướng nhìn, ngang) → (x,z)
      const put = (k, u, y, v, l, hgt, wd, c) => {
        const [sx, sz] = SX(l, wd);
        box(
          k,
          px + (ax ? fx * u : v),
          y,
          pz + (ax ? v : fz * u),
          sx,
          hgt,
          sz,
          c,
        );
      };
      TNG.components.stool({ cyl }, px, pz);
      put("legs", 0.27, 0.5, 0, 0.5, 0.15, 0.3, jean); // đùi
      put("legs", 0.5, 0.25, 0.1, 0.14, 0.5, 0.14, jean);
      put("legs", 0.5, 0.25, -0.1, 0.14, 0.5, 0.14, jean); // cẳng chân
      put("legs", 0.52, 0.04, 0.1, 0.26, 0.07, 0.12, 0x23272c);
      put("legs", 0.52, 0.04, -0.1, 0.26, 0.07, 0.12, 0x23272c); // giày
      const [bx, bz] = [px + (ax ? fx * 0.07 : 0), pz + (ax ? 0 : fz * 0.07)];
      cyl("body", bx, 0.95, bz, 0.18, 0.52, "y", sh); // thân
      put("arm", 0.3, 0.92, 0.2, 0.46, 0.09, 0.09, sh);
      put("arm", 0.3, 0.92, -0.2, 0.46, 0.09, 0.09, sh); // 2 tay duỗi ra bàn
      put("hand", 0.54, 0.86, 0.2, 0.1, 0.06, 0.08, sk);
      put("hand", 0.54, 0.86, -0.2, 0.1, 0.06, 0.08, sk);
      const hu = 0.17,
        hx = px + (ax ? fx * hu : 0),
        hz = pz + (ax ? 0 : fz * hu);
      sph("head", hx, 1.36, hz, 0.115, sk); // đầu cúi
      sph(
        "hair",
        px + (ax ? fx * (hu - 0.04) : 0),
        1.4,
        pz + (ax ? 0 : fz * (hu - 0.04)),
        0.12,
        rnd() < 0.85 ? 0x15110e : 0x3a2a1d,
      );
      if (rnd() < 0.7)
        put("mask", hu + 0.07, 1.31, 0, 0.06, 0.07, 0.15, 0xf2f4f5); // khẩu trang
    }
    return worker;
  };
})();
