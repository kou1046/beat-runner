import { useState } from "react";

const useMicrophone = () => {

    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [isGranted, setIsGranted] = useState<boolean>();

    const requestPermission = async () => {
        if (!analyser){
            const audioCtx = new AudioContext();
            const stream = await navigator.mediaDevices.getUserMedia({audio: true}).catch((e) => {
                return null
            });
            if (!stream) {
                setIsGranted(false);
                return
            }

            const input  = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser(); 
            input.connect(analyser);
            setAnalyser(analyser);
            setIsGranted(true);
        }
        else {
            setAnalyser(null);
        }
    }

    return { analyser, requestPermission, isGranted}
}

export default useMicrophone