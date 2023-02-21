import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import useSynth from "@/ilb/hooks/useSynth";
import useSynth2 from "@/ilb/hooks/useSynth2";
import useMeasurementBpm from "@/ilb/hooks/useMeasurementBpm";
import Chart from "chart.js/auto";
import AccelerationChart from "@/ilb/components/chart/AccelerationChart";
import useAcceleration from "@/ilb/hooks/useAcceleration";
import useInterval from "@/ilb/hooks/useInterval";
import classNames from "classnames";
import AnimationBox from "@/ilb/components/chart/Effect";
import Effect from "@/ilb/components/chart/Effect";

Chart.register();

export default function Home() {
  const { bpms, measureBpm, setBpms } = useMeasurementBpm(true);
  const { accs, requestPermission, isGranted } = useAcceleration();
  const accsChartRef = useRef<Chart<"line">>(null);
  const startOverTime = useRef<number>(0);
  const [parts, setParts] = useState<Array<Tone.Part | Tone.Loop | Tone.Sequence>>([]);
  const [partNames, setPartNames] = useState<Array<string>>([]);
  const { createKickPart, createClosedHihatPart, createBleepLoop, createOpenHihatPart, createBassPart } = useSynth();
  const {
    createBassPart: createBassPart2,
    createKickPart: createKickPart2,
    createSnarePart: createSnarePart2,
    createPianoPart: createPianoPart2,
  } = useSynth2();

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

  const updateParts = (createNewParts: Array<() => Tone.Loop | Tone.Part | Tone.Sequence>) => {
    parts.map((part) => part.dispose());
    Tone.Transport.stop();
    const newParts = createNewParts.map((callback) => callback().start());
    Tone.Transport.start();
    setParts(newParts);
  };

  useEffect(() => {
    if (!bpms.length) {
      updateParts([]);
      setPartNames([]);
      return;
    }

    const aveBpm = bpms.reduce((prev, cur) => prev + cur) / bpms.length;

    if (aveBpm < 140) {
      if (bpms.length === 8) {
        updateParts([createKickPart2]);
        setPartNames(["キック"]);
      }

      if (bpms.length === 16) {
        updateParts([createKickPart2, createSnarePart2]);
        setPartNames((prev) => [...prev, "スネア"]);
      }

      if (bpms.length === 24) {
        updateParts([createKickPart2, createSnarePart2, createBassPart2]);
        setPartNames((prev) => [...prev, "バス"]);
      }

      if (bpms.length === 32) {
        updateParts([createKickPart2, createSnarePart2, createPianoPart2, createBassPart2]);
        setPartNames((prev) => [...prev, "メロディー(ピアノ)"]);
      }
    } else {
      if (bpms.length === 8) {
        updateParts([createKickPart]);
        setPartNames((prev) => [...prev, "キック"]);
      }

      if (bpms.length === 16) {
        updateParts([createKickPart, createClosedHihatPart]);
        setPartNames((prev) => [...prev, "ハイハット1"]);
      }

      if (bpms.length === 24) {
        updateParts([createKickPart, createClosedHihatPart, createOpenHihatPart]);
        setPartNames((prev) => [...prev, "ハイハット2"]);
      }

      if (bpms.length === 32) {
        updateParts([createKickPart, createClosedHihatPart, createOpenHihatPart, createBleepLoop]);
        setPartNames((prev) => [...prev, "ビープ"]);
      }

      if (bpms.length === 40) {
        updateParts([createKickPart, createClosedHihatPart, createOpenHihatPart, createBassPart, createBleepLoop]);
        setPartNames((prev) => [...prev, "バス"]);
      }
    }

    Tone.Transport.bpm.value = aveBpm;
  }, [bpms]);

  return (
    <>
      <main className="h-screen">
        <Effect deps={[bpms]} animationName="animate-wobble-ver-right">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1
              className={classNames({
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
                    requestPermission();
                    await Tone.start();
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
                        <h2>
                          {i + 1}. {partNames[i]}
                        </h2>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </Effect>
      </main>
      <button onClick={() => {}}>test</button>
    </>
  );
}
