import { memo, RefObject } from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import StreamingPlugin from "chartjs-plugin-streaming";
import "chartjs-adapter-moment";
import { Acceleration } from "../../hooks/useAcceleration";

Chart.register(StreamingPlugin);

type PropsType = {
  chartRef?: RefObject<Chart<"line">>;
  threshold?: number;
  accs: Acceleration;
};

const AccelerationChart = ({ accs, chartRef, threshold = 0.5 }: PropsType) => {
  const data = {
    datasets: [
      {
        label: "acceleration",
        data: [],
        borderColor: "black",
        pointRadius: 0,
        borderWidth: 3,
      },
      {
        label: "threshold",
        data: [],
        borderColor: "red",
        pointRadius: 0,
        borderWidth: 3,
      },
    ],
  };

  const options: any = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
        type: "realtime",
        realtime: {
          duration: 2000,
          refresh: 50,
          onRefresh: (chart: Chart<"line">) => {
            const { x, y, z } = accs;
            const ys = (chart.data.datasets[0].data as Array<{ x: number; y: number }>).map(({ y }) => y);
            if (!ys.length) {
              chart.data.datasets[0].data.push({ x: Date.now(), y: z as number });
              chart.data.datasets[1].data.push({ x: Date.now(), y: threshold });
            } else {
              const [max, min] = ys.reduce((prev, cur) => [Math.max(prev[0], cur), Math.min(prev[1], cur)], [0, 0]);
              let newThreshold = (max + min) / 2;
              if (newThreshold < threshold) {
                newThreshold = threshold;
              }
              chart.data.datasets[0].data.push({ x: Date.now(), y: z as number });
              chart.data.datasets[1].data.push({ x: Date.now(), y: newThreshold });
            }
          },
        },
      },
      y: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
  };
  return <Line data={data} options={options} ref={chartRef} />;
};

export default memo(AccelerationChart);
