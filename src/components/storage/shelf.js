(function () {
  "use strict";
  TNG.components.shelf = function createShelf({box, X, Z, M, rnd, pick, garments}) {

function shelf(x,y,w,h,opts){
  opts=opts||{};
  const alongX=w>=h, L=M(alongX?w:h), D=M(alongX?h:w);
  const x0=X(x), z0=Z(y);
  const P=(u,v)=>alongX?[x0+u,z0+v]:[x0+v,z0+u];
  const S=(su,sv)=>alongX?[su,sv]:[sv,su];
  const H=opts.H||2.5, lv=opts.levels||[0.15,0.95,1.75,2.45];
  const bays=Math.max(1,Math.round(L/2)), bw=L/bays;
  for(let i=0;i<=bays;i++)for(const v of [0.03,D-0.03]){const [px,pz]=P(i*bw,v);box('steelWhite',px,H/2,pz,0.05,H,0.05)}
  for(const ly of lv){const [px,pz]=P(L/2,D/2);const [sx,sz]=S(L,D);box('steelWhite',px,ly,pz,sx,0.03,sz)}
  const pal=opts.pal||garments;
  for(let i=0;i<bays;i++)for(let li=0;li<lv.length-(opts.topEmpty?1:0);li++){
    if(rnd()<0.12) continue;
    const n=3;
    for(let j=0;j<n;j++){
      if(rnd()<0.15) continue;
      const hh=0.15+rnd()*(li===lv.length-1?0.55:0.5);
      const [px,pz]=P(i*bw+bw*(j+0.5)/n,D/2);const [sx,sz]=S(bw/n-0.06,D*0.85);
      box('cloth',px,lv[li]+0.015+hh/2,pz,sx,hh,sz,pick(pal));
    }
  }
}
    return shelf;
  };
})();
