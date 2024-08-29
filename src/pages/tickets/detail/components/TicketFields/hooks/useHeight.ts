import {RefObject, useEffect, useLayoutEffect, useMemo, useState} from 'react'

const useHeight = (ref: RefObject<HTMLElement>) => {
    const [height, setHeight] = useState<number>()
    const [last, setLast] = useState<DOMRect>()

    useEffect(() => {
        setHeight(ref.current?.scrollHeight)
    }, [ref])

    const observer = useMemo(
        () =>
            new ResizeObserver(() => {
                const data = ref.current?.getBoundingClientRect()
                if (
                    data?.width !== last?.width &&
                    data?.height === last?.height
                ) {
                    setHeight(undefined)
                    setHeight(ref.current?.scrollHeight)
                }
                setLast(data)
            }),
        [last?.height, last?.width, ref]
    )

    useLayoutEffect(() => {
        if (!ref.current) return
        setLast(ref.current.getBoundingClientRect())
        observer.observe(ref.current)
        return () => {
            observer.disconnect()
        }
    }, [observer, ref])

    return height
}

export default useHeight
