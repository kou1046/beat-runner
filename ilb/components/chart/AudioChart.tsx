import { RefObject, memo, useRef, useCallback } from "react";
import Chart from "chart.js/auto";
import StreamingPlugin from "chartjs-plugin-streaming";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

Chart.register(StreamingPlugin);

type PropsType = {
  analyser: AnalyserNode;
  chartRef: RefObject<Chart<"line">>;
  threshold?: number;
};

const AudioChart = ({ analyser, threshold = 160, chartRef }: PropsType) => {
  const onRefresh = (chart: Chart<"line">) => {
    const fftData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(fftData);
    const max = fftData.reduce((prev, cur) => Math.max(prev, cur));
    chart.data.datasets[0].data.push({ x: Date.now(), y: max });
    chart.data.datasets[1].data.push({ x: Date.now(), y: threshold });
  };

  const data = {
    datasets: [
      {
        label: "amplitude",
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
          onRefresh,
        },
      },
      y: {
        max: 1.5 * threshold,
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

export default memo(AudioChart);
