import {useEffect, useRef} from 'react'

// calls the callback provided once the passed value becomes non null for the first time
export default function useOnLoaded(value: Maybe<any>, callback: () => void) {
    const isInit = useRef(false)
    useEffect(() => {
        if (isInit.current) return
        if (!value) return
        isInit.current = true
        callback()
    }, [value, callback])
}
