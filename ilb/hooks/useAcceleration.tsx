import { useCallback, useRef, useState } from "react"

export type Acceleration = {
    x: number | null, 
    y: number | null, 
    z: number | null,
}

const useAcceleration = () => {

    const [ accs, setAccs ] = useState<Acceleration | null>(null); 
    const [ isGranted, setIsGranted ] = useState<boolean>();

    const getAcceleration = useCallback((e: DeviceMotionEvent) => {
        if (e.acceleration) {
            const {x, y, z} = e.acceleration; 

            setAccs((prevAccs) => { 
                //初回のみオブジェクトの書き換え　以降は中身の書き換えのみを行い，オブジェクト自体は更新しない（再レンダリングしない）
                if (!prevAccs) return {x, y, z}
                prevAccs.x = x; 
                prevAccs.y = y;
                prevAccs.z = z;
                return prevAccs
            })
        }
    }, [])       

    const requestPermission = () => {
        if (navigator.userAgent.match('iPhone|iPad')) {
            (window.DeviceMotionEvent as any).requestPermission().then((res: string) => {
                if (res != 'granted') {
                    setIsGranted(false);
                    return
                }
              }
            )
        }
        if (!accs){
            window.addEventListener('devicemotion', getAcceleration);
            setIsGranted(true);
        }
        else{
            window.removeEventListener('devicemotion', getAcceleration);
            setAccs(null);
        }
    }

    return { accs, isGranted, requestPermission }
}

export default useAcceleration