// This file is currently being ignored in the codecov.yaml.
// Since we are still finalising the logic of how sizes are affected
// when panels appear and disappear I've chosen to ignore coverage for
// this file for the time being - tests will follow once we settle on
// how we'd like this to behave
import type { PanelConfig, Sizes } from '../types'
import { sum } from './sum'

type Options = {
    availableSize: number
    configs: Record<string, PanelConfig>
    order: string[]
    previousOrder: string[]
    previousSizes: Sizes
    savedSizes: Sizes
}

type PanelDelta = [string, number]

const hasSavedSize = (savedSizes: Sizes, name: string) =>
    savedSizes[name] !== undefined

export function calculateSizes({
    availableSize,
    configs,
    order,
    previousOrder,
    previousSizes,
    savedSizes,
}: Options) {
    const sizes = order.reduce(
        (acc, name) => ({ ...acc, [name]: configs[name].minSize }),
        {} as Record<string, number>,
    )

    let remainingSize = availableSize - sum(Object.values(sizes))
    if (remainingSize <= 0) return sizes

    // apply deltas equally across given panels
    const evenApplyDeltas = (deltas: PanelDelta[]) => {
        let count = deltas.length
        deltas.forEach(([name, delta]) => {
            const average = Math.round(remainingSize / count)
            const actual = Math.min(delta, average)
            sizes[name] += actual
            remainingSize -= actual
            count--
        })
    }

    // apply deltas across panels, in order
    const orderedApplyDeltas = (deltas: PanelDelta[]) => {
        deltas.forEach(([name, delta]) => {
            const actual = Math.min(delta, remainingSize)
            sizes[name] += actual
            remainingSize -= actual
        })
    }

    const existingPanels =
        previousOrder.length > 0
            ? order.filter((name) => previousOrder.includes(name))
            : []
    const addedPanels =
        previousOrder.length > 0
            ? order.filter((name) => !previousOrder.includes(name))
            : order
    const getExistingPanelSize = (name: string) => {
        if (configs[name].prioritise && hasSavedSize(savedSizes, name)) {
            return savedSizes[name]
        }

        return previousSizes[name]
    }
    const hasSavedPrioritisedSize = (name: string) =>
        !!configs[name].prioritise && hasSavedSize(savedSizes, name)

    const existingPrioritisedPanels = existingPanels.filter(
        hasSavedPrioritisedSize,
    )
    if (existingPrioritisedPanels.length) {
        orderedApplyDeltas(
            existingPrioritisedPanels.map<PanelDelta>((name) => [
                name,
                savedSizes[name] - sizes[name],
            ]),
        )
    }

    const prioritisedPanels = order.filter(
        (name) =>
            !!configs[name].prioritise &&
            !existingPanels.includes(name) &&
            hasSavedSize(savedSizes, name),
    )
    if (prioritisedPanels.length) {
        orderedApplyDeltas(
            prioritisedPanels.map<PanelDelta>((name) => [
                name,
                savedSizes[name] - sizes[name],
            ]),
        )
    }

    const savedAddedPanels = addedPanels.filter(
        (name) =>
            !prioritisedPanels.includes(name) && hasSavedSize(savedSizes, name),
    )
    if (savedAddedPanels.length) {
        orderedApplyDeltas(
            savedAddedPanels
                .map<PanelDelta>((name) => [
                    name,
                    savedSizes[name] - sizes[name],
                ])
                .sort((a, b) => a[1] - b[1]),
        )
    }

    if (existingPanels.length) {
        orderedApplyDeltas(
            existingPanels
                .filter((name) => !existingPrioritisedPanels.includes(name))
                .map<PanelDelta>((name) => [
                    name,
                    Math.min(
                        getExistingPanelSize(name),
                        configs[name].maxSize,
                    ) - sizes[name],
                ])
                .sort((a, b) => a[1] - b[1]),
        )
    }

    if (remainingSize <= 0) return sizes

    if (addedPanels.length) {
        evenApplyDeltas(
            addedPanels
                .filter((name) => !hasSavedSize(savedSizes, name))
                .filter((name) => configs[name].defaultSize !== Infinity)
                .map<PanelDelta>((name) => [
                    name,
                    configs[name].defaultSize - sizes[name],
                ])
                .sort((a, b) => a[1] - b[1]),
        )

        if (remainingSize <= 0) return sizes

        evenApplyDeltas(
            addedPanels
                .filter((name) => !hasSavedSize(savedSizes, name))
                .filter((name) => configs[name].defaultSize === Infinity)
                .map<PanelDelta>((name) => [
                    name,
                    configs[name].maxSize - sizes[name],
                ])
                .sort((a, b) => a[1] - b[1]),
        )
    }

    if (remainingSize <= 0) return sizes

    const removedPanels =
        previousOrder.length > 0
            ? previousOrder.filter((name) => !order.includes(name))
            : []

    if (removedPanels.length) {
        const panelIndex = Math.max(
            ...removedPanels.map((name) => previousOrder.indexOf(name)),
        )
        const growablePanels = [
            ...order.slice(panelIndex),
            ...order.slice(0, panelIndex),
        ].filter((name) => !hasSavedPrioritisedSize(name))
        orderedApplyDeltas(
            growablePanels
                .map<PanelDelta>((name) => [
                    name,
                    configs[name].maxSize - sizes[name],
                ])
                .sort((a, b) => b[1] - a[1]),
        )
    }

    if (remainingSize <= 0) return sizes

    evenApplyDeltas(
        order
            .filter((name) => !hasSavedPrioritisedSize(name))
            .map<PanelDelta>((name) => [
                name,
                configs[name].maxSize - sizes[name],
            ])
            .sort((a, b) => a[1] - b[1]),
    )

    return sizes
}
