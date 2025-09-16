export function fmtPrice(v, unitIsThousand = true) {
  let amount = Number(v || 0);
  if (unitIsThousand) amount *= 1000;
  return amount.toLocaleString("vi-VN");
}

export function fmtVND(v, unitIsThousand = true) {
  return `${fmtPrice(v, unitIsThousand)} đ`;
}
