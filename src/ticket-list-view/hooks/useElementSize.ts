import {useEffect, useState} from 'react'

type Listener = (entry: [number, number]) => void

const behaviours: Map<Element, Listener> = new Map()

let globalObserver: ResizeObserver | null = null

function getResizeObserver() {
    if (globalObserver) return globalObserver

    globalObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const callback = behaviours.get(entry.target)
            if (callback) {
                const [{blockSize: height, inlineSize: width}] =
                    entry.borderBoxSize
                callback([width, height])
            }
        }
    })

    return globalObserver
}

export default function useElementSize(element: HTMLElement | null) {
    const [size, setSize] = useState<[number, number]>([0, 0])

    const observer = getResizeObserver()

    useEffect(() => {
        if (!element) return

        behaviours.set(element, setSize)
        observer.observe(element)

        return () => {
            observer.unobserve(element)
            behaviours.delete(element)
        }
    }, [element, observer])

    return size
}
