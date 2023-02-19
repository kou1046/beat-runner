import { useCallback, useState } from "react"

const useMeasurementBpm = (autoReset: boolean = true) => {

    const [bpms, setBpms] = useState<Array<number>>([]);
    const [pushCount, setPushCount] = useState<number>(0);
    const [startTime, setStartTime] = useState<number>(0);

    const measureBpm = useCallback(() => {
        if (!pushCount){
            setStartTime(Date.now())
            setPushCount(prev => prev+1)
            return 
           }
       const endTime = Date.now();
       const intervalSec = (endTime - startTime) / 1000;
       const newBpm = Math.round((1 / intervalSec) * 60)

       if (pushCount > 1){
            if (autoReset && (newBpm*1.5 < bpms[bpms.length - 1] || newBpm/1.5 > bpms[bpms.length - 1])){
                setPushCount(0);
                setBpms([]);
                return
            }
       }

       setStartTime(endTime);
       setBpms([...bpms, newBpm]);
       setPushCount(prev => prev+1);
    }, [pushCount])

    return { bpms, setBpms, measureBpm }
}

export default useMeasurementBpm