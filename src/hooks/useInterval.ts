import { useEffect, useRef } from 'react'

export default function useInterval(
    callback: () => void,
    delay?: number | null,
) {
    const savedCallback = useRef(callback)
    savedCallback.current = callback

    useEffect(() => {
        if (delay !== null) {
            const interval = setInterval(
                () => savedCallback.current(),
                delay || 0,
            )
            return () => clearInterval(interval)
        }
    }, [delay])
}
