import { useEffect, useState } from 'react'

export function useAnimatedCollection<T>(items: T[]) {
    const [displayedItems, setDisplayedItems] = useState(items)
    const [isVisible, setIsVisible] = useState(false)
    const hasItems = items.length > 0

    useEffect(() => {
        if (hasItems) {
            setDisplayedItems(items)
        }
    }, [hasItems, items])

    useEffect(() => {
        if (!hasItems) {
            setIsVisible(false)
            return
        }

        let innerAnimationFrameId: number | undefined
        const animationFrameId = window.requestAnimationFrame(() => {
            innerAnimationFrameId = window.requestAnimationFrame(() => {
                setIsVisible(true)
            })
        })

        return () => {
            window.cancelAnimationFrame(animationFrameId)
            if (innerAnimationFrameId !== undefined) {
                window.cancelAnimationFrame(innerAnimationFrameId)
            }
        }
    }, [hasItems])

    return {
        displayedItems,
        hasItems,
        isVisible,
    }
}
