import React from "react";

type Props = { data: number[]; height?: number; color?: string };

const MiniSparkline: React.FC<Props> = ({
  data,
  height = 40,
  color = "primary",
}) => {
  if (!data || data.length === 0)
    return <svg className="w-full" style={{ height }} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((value - min) / range) * 100;
      return `${x},${100 - y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`text-${color} opacity-80`}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="currentColor"
        className={`text-${color} opacity-10`}
      />
    </svg>
  );
};

export default MiniSparkline;
