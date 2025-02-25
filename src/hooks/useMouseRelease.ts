import { useCallback } from 'react'

export default function useMouseRelease(callback: () => void) {
    const handleMouseUp = useCallback(() => {
        document.body.removeEventListener('mouseup', handleMouseUp)
        callback()
    }, [callback])

    const handleMouseDown = useCallback(() => {
        document.body.addEventListener('mouseup', handleMouseUp)
    }, [handleMouseUp])

    return handleMouseDown
}
