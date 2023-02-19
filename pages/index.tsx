import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import useSynth from "@/ilb/hooks/useSynth";
import useMeasurementBpm from "@/ilb/hooks/useMeasurementBpm";
import Chart from "chart.js/auto";
import AccelerationChart from "@/ilb/components/chart/AccelerationChart";
import useAcceleration from "@/ilb/hooks/useAcceleration";
import useInterval from "@/ilb/hooks/useInterval";
import classNames from "classnames";

Chart.register();

const partNames = ["キック", "ハイハット1", "ハイハット2", "ビープ", "バス"];

export default function Home() {
  const { bpms, measureBpm, setBpms } = useMeasurementBpm(true);
  const { accs, requestPermission, isGranted } = useAcceleration();
  const accsChartRef = useRef<Chart<"line">>(null);
  const startOverTime = useRef<number>(0);
  const [parts, setParts] = useState<Array<Tone.Part | Tone.Loop>>([]);
  const { createKickPart, createClosedHihatPart, createBleepLoop, createOpenHihatPart, createBassPart } = useSynth();

  useInterval(() => {
    if (!accsChartRef.current) return;

    const chart = accsChartRef.current;
    const values = chart.data.datasets[0].data as Array<{ x: number; y: number } | undefined>;
    const recentValue = values[values.length - 1];

    if (!recentValue) return;

    const thresholds = chart.data.datasets[1].data;
    const recentThreshold = (thresholds[thresholds.length - 1]! as { x: number; y: number }).y;

    //センサー値が閾値を超えたら時間を計測開始
    if (recentValue.y > recentThreshold) {
      startOverTime.current = Date.now();
    }

    //100ms以内に閾値を下回ったらBPM計測
    if (recentValue.y < recentThreshold && Date.now() - startOverTime.current < 100) {
      measureBpm();
      startOverTime.current = 0;
    }
  }, 20);

  const updateParts = (createNewParts: Array<() => Tone.Loop | Tone.Part>) => {
    parts.map((part) => part.dispose());
    Tone.Transport.stop();
    const newParts = createNewParts.map((callback) => callback().start());
    Tone.Transport.start();
    setParts(newParts);
  };

  useEffect(() => {
    if (!bpms.length) {
      updateParts([]);
      return;
    }

    if (bpms.length === 8) {
      updateParts([createKickPart]);
    }

    if (bpms.length === 16) {
      updateParts([createKickPart, createClosedHihatPart]);
    }

    if (bpms.length === 24) {
      updateParts([createKickPart, createClosedHihatPart, createOpenHihatPart]);
    }

    if (bpms.length === 32) {
      updateParts([createKickPart, createClosedHihatPart, createOpenHihatPart, createBleepLoop]);
    }

    if (bpms.length === 40) {
      updateParts([createKickPart, createClosedHihatPart, createOpenHihatPart, createBassPart, createBleepLoop]);
    }
    Tone.Transport.bpm.value = bpms.reduce((prev, cur) => prev + cur) / bpms.length;
  }, [bpms]);

  return (
    <>
      <main>
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1
            className={classNames({
              "animate-wobble-ver-right": bpms.length,
              " text-red-500": parts.length,
            })}
          >
            BPM: {bpms.length ? Math.ceil(bpms.reduce((prev, cur) => prev + cur) / bpms.length) : null}
          </h1>
          <div
            aria-label="acc-circle"
            className="flex h-[200px] w-[200px] cursor-pointer
                       flex-col items-center justify-center overflow-hidden rounded-full
                       bg-gradient-to-r from-cyan-200 to-blue-400 shadow-2xl transition
                       hover:scale-105 hover:border-2 hover:border-black sm:h-[300px] sm:w-[300px] 
                       "
            onClick={() => {
              if (!accs) return;
              measureBpm();
            }}
          >
            {accs ? (
              <div>
                <AccelerationChart accs={accs} chartRef={accsChartRef} />
              </div>
            ) : (
              <button
                className="h-full w-full"
                onClick={async () => {
                  await Tone.start();
                  requestPermission();
                }}
              >
                <h1>Start</h1>
              </button>
            )}
          </div>
          <div className="space-y-4">
            {parts
              ? parts.map((_, i) => (
                  <div className="flex animate-wobble-ver-right items-center space-x-4">
                    <div className="rounded-full  bg-blue-200 px-10">
                      <h1>
                        {i + 1}. {partNames[i]}
                      </h1>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </main>
    </>
  );
}
