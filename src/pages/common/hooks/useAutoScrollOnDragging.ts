import {useEffect, useRef, useState} from 'react'
import {useDragDropManager} from 'react-dnd'
import {Unsubscribe} from 'redux'

const useAutoScrollOnDragging = (speedRatio = 30) => {
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const dragDropManager = useDragDropManager()
    const monitor = dragDropManager.getMonitor()
    const timerRef = useRef<NodeJS.Timer>()
    const unsubscribeRef = useRef<Unsubscribe>()
    const scrollableAreaRef = useRef<HTMLDivElement>(null)

    const setScrollInterval = (speed: number, container: HTMLElement) => {
        timerRef.current = setInterval(() => {
            container.scrollBy(0, speed)
        }, 1)
    }

    useEffect(() => {
        if (isDragging) {
            unsubscribeRef.current = monitor.subscribeToOffsetChange(() => {
                const offset = monitor.getClientOffset()

                if (scrollableAreaRef.current && offset) {
                    const margin = 100
                    const {bottom, top} =
                        scrollableAreaRef.current.getBoundingClientRect()
                    const topLimit = top + margin
                    const bottomLimit = bottom - margin

                    if (offset.y < topLimit) {
                        const speed = (offset.y - topLimit) / speedRatio
                        timerRef.current && clearInterval(timerRef.current)
                        setScrollInterval(speed, scrollableAreaRef.current)
                    } else if (offset.y > bottomLimit) {
                        const speed = (offset.y - bottomLimit) / speedRatio
                        timerRef.current && clearInterval(timerRef.current)
                        setScrollInterval(speed, scrollableAreaRef.current)
                    } else if (offset.y > topLimit && offset.y < bottomLimit) {
                        timerRef.current && clearInterval(timerRef.current)
                    }
                }
            })
        } else if (unsubscribeRef.current) {
            timerRef.current && clearInterval(timerRef.current)
            unsubscribeRef.current()
        }
    }, [scrollableAreaRef, isDragging, monitor, speedRatio])

    useEffect(() => {
        const unsubscribe = monitor.subscribeToStateChange(() => {
            if (monitor.isDragging()) {
                setIsDragging(true)
            } else {
                setIsDragging(false)
            }
        })

        return () => {
            unsubscribe()
        }
    }, [monitor])

    return {scrollableAreaRef}
}

export default useAutoScrollOnDragging
