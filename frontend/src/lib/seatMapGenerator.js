function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateSeatMap(cinema) {
  const rows = [];
  for (let r = 0; r < cinema.rows_count; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    const seats = [];
    for (let s = 1; s <= cinema.seats_per_row; s++) {
      const isVip = s >= 5 && s <= 8;
      const isDisabled = s === 1 || s === cinema.seats_per_row;
      const seed = cinema.id * 1000 + r * 100 + s;
      seats.push({
        id: `${rowLetter}${s}`,
        type: isDisabled ? 'DISABLED' : isVip ? 'VIP' : 'NORMAL',
        available: seededRandom(seed) > 0.3,
      });
    }
    rows.push({ row: rowLetter, seats });
  }
  return rows;
}
