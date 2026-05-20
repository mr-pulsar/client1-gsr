export default function BarcodeStrip({ value }) {
  const bars = Array.from(String(value || '')).map((char, index) => ({
    height: 20 + ((char.charCodeAt(0) + index * 7) % 26),
    width: index % 3 === 0 ? 3 : 2,
  }));

  return (
    <div className="flex items-end gap-[2px] rounded-xl bg-white px-3 py-2">
      {bars.map((bar, index) => (
        <div key={index} className="bg-slate-950" style={{ width: bar.width, height: bar.height }} />
      ))}
    </div>
  );
}