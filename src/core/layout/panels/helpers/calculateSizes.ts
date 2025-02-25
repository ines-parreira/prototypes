// This file is currently being ignored in the codecov.yaml.
// Since we are still finalising the logic of how sizes are affected
// when panels appear and disappear I've chosen to ignore coverage for
// this file for the time being - tests will follow once we settle on
// how we'd like this to behave
import type { PanelConfig, Sizes } from '../types'
import sum from './sum'

type Options = {
    availableSize: number
    configs: Record<string, PanelConfig>
    order: string[]
    previousOrder: string[]
    previousSizes: Sizes
    savedSizes: Sizes
}

type PanelDelta = [string, number]

export default function calculateSizes({
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

    const prioritisedPanels = order.filter(
        (name) =>
            !!configs[name].prioritise &&
            !existingPanels.includes(name) &&
            !!savedSizes[name],
    )
    if (prioritisedPanels.length) {
        orderedApplyDeltas(
            prioritisedPanels.map<PanelDelta>((name) => [
                name,
                savedSizes[name] - sizes[name],
            ]),
        )
    }

    if (existingPanels.length) {
        orderedApplyDeltas(
            existingPanels
                .map<PanelDelta>((name) => [
                    name,
                    Math.min(previousSizes[name], configs[name].maxSize) -
                        sizes[name],
                ])
                .sort((a, b) => a[1] - b[1]),
        )
    }

    if (remainingSize <= 0) return sizes

    const addedPanels =
        previousOrder.length > 0
            ? order.filter((name) => !previousOrder.includes(name))
            : order

    if (addedPanels.length) {
        orderedApplyDeltas(
            addedPanels
                .filter((name) => !!savedSizes[name])
                .map<PanelDelta>((name) => [
                    name,
                    savedSizes[name] - sizes[name],
                ])
                .sort((a, b) => a[1] - b[1]),
        )

        if (remainingSize <= 0) return sizes

        evenApplyDeltas(
            addedPanels
                .filter((name) => !savedSizes[name])
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
                .filter((name) => !savedSizes[name])
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
        orderedApplyDeltas([
            ...order
                .slice(panelIndex)
                .map<PanelDelta>((name) => [
                    name,
                    configs[name].maxSize - sizes[name],
                ])
                .sort((a, b) => b[1] - a[1]),
            ...order
                .slice(0, panelIndex)
                .map<PanelDelta>((name) => [
                    name,
                    configs[name].maxSize - sizes[name],
                ])
                .sort((a, b) => b[1] - a[1]),
        ])
    }

    if (remainingSize <= 0) return sizes

    evenApplyDeltas(
        order
            .map<PanelDelta>((name) => [
                name,
                configs[name].maxSize - sizes[name],
            ])
            .sort((a, b) => a[1] - b[1]),
    )

    return sizes
}
