import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

export default function useHoverable(): {
    hovered: boolean
    setRef: Dispatch<SetStateAction<HTMLElement | null>>
} {
    const [hovered, setHovered] = useState(false)
    const [element, setRef] = useState<HTMLElement | null>(null)

    const handleMouseEnter = () => setHovered(true)
    const handleMouseLeave = () => setHovered(false)

    useEffect(() => {
        if (element) {
            element.addEventListener('mouseenter', handleMouseEnter)
            element.addEventListener('mouseleave', handleMouseLeave)

            return () => {
                element.removeEventListener('mouseenter', handleMouseEnter)
                element.removeEventListener('mouseleave', handleMouseLeave)
            }
        }
    }, [element])

    return { hovered, setRef }
}
