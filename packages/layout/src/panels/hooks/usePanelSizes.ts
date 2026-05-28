import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject, SetStateAction } from 'react'
import { useTimeout } from '@repo/hooks'

import { calculateSizes } from '../helpers/calculateSizes'
import { scaleSizes } from '../helpers/scaleSizes'
import type { SizeSnapshot } from '../helpers/scaleSizes'
import type { PanelConfig, Sizes } from '../types'

const RESIZE_DEBOUNCE_MS = 50

type PreviousLayout = {
    availableSize: number | null
    order: string[]
}

const getMissingDefaultSizes = (
    configs: Record<string, PanelConfig>,
    order: string[],
    savedSizes: Sizes,
) =>
    order.reduce((acc, name) => {
        const defaultSize = configs[name].defaultSize

        if (savedSizes[name] !== undefined || !Number.isFinite(defaultSize)) {
            return acc
        }

        return { ...acc, [name]: defaultSize }
    }, {} as Sizes)

const haveSameOrder = (a: string[], b: string[]) =>
    a.length === b.length && a.every((name, index) => name === b[index])

const haveSizesForOrder = (sizes: Sizes, order: string[]) =>
    order.every((name) => sizes[name] !== undefined)

const pickSizes = (sizes: Sizes, order: string[]) =>
    order.reduce((acc, name) => ({ ...acc, [name]: sizes[name] }), {} as Sizes)

export function usePanelSizes(
    availableSize: number,
    configs: Record<string, PanelConfig>,
    savedSizes: MutableRefObject<Sizes>,
    persistSizes: (sizes: Sizes) => void,
    order: string[],
) {
    const previousLayout = useRef<PreviousLayout>({
        availableSize: null,
        order: [],
    })
    const resizeSnapshot = useRef<SizeSnapshot | null>(null)
    const sizesRef = useRef<Sizes>({})
    const [sizes, setSizesState] = useState<Sizes>({})
    const [setResizeTimeout, clearResizeTimeout] = useTimeout()

    const clearPendingResize = useCallback(() => {
        clearResizeTimeout()
        resizeSnapshot.current = null
    }, [clearResizeTimeout])

    const applySizes = useCallback((nextSizes: SetStateAction<Sizes>) => {
        const resolvedSizes =
            typeof nextSizes === 'function'
                ? nextSizes(sizesRef.current)
                : nextSizes

        sizesRef.current = resolvedSizes
        setSizesState(resolvedSizes)
    }, [])

    const setSizes = useCallback(
        (nextSizes: SetStateAction<Sizes>) => {
            clearPendingResize()
            applySizes(nextSizes)
        },
        [applySizes, clearPendingResize],
    )

    useEffect(() => {
        const rememberCurrentLayout = () => {
            previousLayout.current = { availableSize, order }
        }

        if (!order.length) {
            clearPendingResize()
            rememberCurrentLayout()
            applySizes({})
            return
        }

        const missingDefaultSizes = getMissingDefaultSizes(
            configs,
            order,
            savedSizes.current,
        )
        const effectiveSavedSizes = {
            ...savedSizes.current,
            ...missingDefaultSizes,
        }

        if (Object.keys(missingDefaultSizes).length) {
            persistSizes(missingDefaultSizes)
        }

        const currentSizes = sizesRef.current
        const previous = previousLayout.current
        const previousAvailableSize = previous.availableSize
        const isResizing =
            previousAvailableSize !== null &&
            previousAvailableSize !== availableSize &&
            haveSameOrder(previous.order, order) &&
            haveSizesForOrder(currentSizes, order)

        if (isResizing) {
            const snapshot = resizeSnapshot.current ?? {
                availableSize: previousAvailableSize,
                sizes: pickSizes(currentSizes, order),
            }
            resizeSnapshot.current = snapshot
            const scaledSizes = scaleSizes({
                availableSize,
                configs,
                order,
                snapshot,
            })

            setResizeTimeout(() => {
                persistSizes(scaledSizes)
                clearPendingResize()
            }, RESIZE_DEBOUNCE_MS)

            rememberCurrentLayout()
            applySizes(scaledSizes)

            return
        }

        clearPendingResize()
        const newSizes = calculateSizes({
            availableSize,
            configs,
            order,
            previousOrder: previous.order,
            previousSizes: currentSizes,
            savedSizes: effectiveSavedSizes,
        })
        rememberCurrentLayout()
        applySizes(newSizes)
    }, [
        availableSize,
        applySizes,
        clearPendingResize,
        configs,
        order,
        persistSizes,
        savedSizes,
        setResizeTimeout,
    ])

    return [sizes, setSizes] as const
}
