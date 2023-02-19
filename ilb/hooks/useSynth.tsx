import { useState, useEffect } from "react";
import * as Tone from "tone";

const useSynth = () => {
  const createKickPart = () => {
    const kickEnvelope = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
    }).toDestination();

    const kick = new Tone.Oscillator("A2").connect(kickEnvelope).start();

    const kickSnapEnv = new Tone.FrequencyEnvelope({
      attack: 0.005,
      decay: 0.01,
      sustain: 0,
      baseFrequency: "A2",
      octaves: 2.7,
    }).connect(kick.frequency);

    const kickPart = new Tone.Loop((time) => {
      kickEnvelope.triggerAttack(time);
      kickSnapEnv.triggerAttack(time);
    }, "4n");
    return kickPart;
  };

  const createOpenHihatPart = () => {
    const lowPass = new Tone.Filter({
      frequency: 14000,
    }).toDestination();
    const openHiHat = new Tone.NoiseSynth({
      volume: -10,
      envelope: {
        attack: 0.01,
        decay: 0.5,
      },
    }).connect(lowPass);

    const openHiHatPart = new Tone.Part(
      (time) => {
        openHiHat.triggerAttack(time);
      },
      [{ "8n": 2 }, { "8n": 6 }]
    );

    return openHiHatPart;
  };

  const createClosedHihatPart = () => {
    const lowPass = new Tone.Filter({
      frequency: 14000,
    }).toDestination();
    const closedHiHat = new Tone.NoiseSynth({
      volume: -10,
      envelope: {
        attack: 0.01,
        decay: 0.15,
      },
    }).connect(lowPass);
    const closedHiHatPart = new Tone.Part(
      (time) => {
        closedHiHat.triggerAttack(time);
      },
      [0, { "16n": 1 }, { "8n": 1 }, { "8n": 3 }, { "8n": 4 }, { "8n": 5 }, { "8n": 7 }, { "8n": 8 }]
    );
    return closedHiHatPart;
  };

  const createBassPart = () => {
    const bassEnvelope = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
    }).toDestination();

    const bassFilter = new Tone.Filter({
      frequency: 600,
      Q: 8,
    });

    const bass = new Tone.PulseOscillator("A2", 0.4).chain(bassFilter, bassEnvelope);
    bass.start();

    const bassPart = new Tone.Part(
      (time, note) => {
        bass.frequency.setValueAtTime(note, time);
        bassEnvelope.triggerAttack(time);
      },
      [
        ["0:0", "A1"],
        ["0:2", "G1"],
        ["0:2:2", "C2"],
        ["0:3:2", "A1"],
      ]
    );
    return bassPart;
  };

  const createBleepLoop = () => {
    const bleepEnvelope = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.4,
      sustain: 0,
    }).toDestination();

    const bleep = new Tone.Oscillator("A4").connect(bleepEnvelope);
    bleep.start();

    const bleepLoop = new Tone.Loop((time) => {
      bleepEnvelope.triggerAttack(time);
    }, "2n");
    return bleepLoop;
  };

  useEffect(() => {
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = "1:0";
    Tone.Transport.start();
  }, []);

  return { createKickPart, createOpenHihatPart, createClosedHihatPart, createBassPart, createBleepLoop };
};

export default useSynth;
