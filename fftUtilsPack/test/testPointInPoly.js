
//计算一个点是否在多边形里,参数:点,多边形数组
function PointInPoly(pt, poly) {
    let c = false;
    for (let i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
        && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);
    return c;
}

let pt = [9.8, 16.79000000000002];
var _poly=[[4, 27.2],
    [4, 23.35],
    [8.58, 23.35],
    [10.8, 14.89],
    [10.8, 27.2]
];
console.log(PointInPoly(pt, _poly));
