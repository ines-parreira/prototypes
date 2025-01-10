// This file is currently being ignored in the codecov.yaml.
// Since we are still finalising the logic of how sizes are affected
// when panels appear and disappear I've chosen to ignore coverage for
// this file for the time being - tests will follow once we settle on
// how we'd like this to behave
import type {PanelConfig} from '../types'
import sum from './sum'

type Options = {
    availableSize: number
    configs: Record<string, PanelConfig>
    order: string[]
    previousOrder: string[]
    previousSizes: Record<string, number>
}

type PanelDelta = [string, number]

export default function calculateSizes({
    availableSize,
    configs,
    order,
    previousOrder,
    previousSizes,
}: Options) {
    // 1.
    // Scale all panels up to their minimum, regardless of how much space there is
    // available, if this does not fit, a scroll bar will need to be shown
    const sizes = order.reduce(
        (acc, name) => ({...acc, [name]: configs[name].minSize}),
        {} as Record<string, number>
    )

    let remainingSize = availableSize - sum(Object.values(sizes))
    if (remainingSize <= 0) return sizes

    // TODO: think of better names, maybe something like applyDelta, since
    // that's essentially what's happening. These functions can also be used
    // to apply negative deltas
    // Distribute remainingSize evenly across panels up to given delta
    const evenDistribute = (panels: PanelDelta[]) => {
        if (!remainingSize) return
        let remainingCount = panels.length
        panels.forEach(([name, delta]) => {
            const averageSize = Math.round(remainingSize / remainingCount)
            const fillSize = Math.min(delta, averageSize)
            sizes[name] += fillSize
            remainingSize -= fillSize
            remainingCount--
        })
    }

    // Distribute remainingSize across panels in given order up to given delta
    const priorityDistribute = (panels: PanelDelta[]) => {
        if (!remainingSize) return
        panels.forEach(([name, delta]) => {
            const fillSize = Math.min(delta, remainingSize)
            sizes[name] += fillSize
            remainingSize -= fillSize
        })
    }

    let panels: PanelDelta[] = []

    // 2.
    // Next, we determine which panels were added, removed and existing
    const addedPanels =
        previousOrder.length > 0
            ? order.filter((name) => !previousOrder.includes(name))
            : order

    const removedPanels =
        previousOrder.length > 0
            ? previousOrder.filter((name) => !order.includes(name))
            : []

    const existingPanels =
        previousOrder.length > 0
            ? order.filter((name) => previousOrder.includes(name))
            : []

    // 3.
    // If there are existing panels, we want to maintain their sizes as much as
    // possible between renders, so we need to check which of these panels are
    // still on the page, and what their previous sizes were. Since these sizes
    // couldh ave restored from localstorage, we want to also make sure that we
    // cap it using the `maxSize` as well
    if (existingPanels.length) {
        panels = existingPanels
            .map<PanelDelta>((name) => [
                name,
                Math.min(previousSizes[name], configs[name].maxSize) -
                    sizes[name],
            ])
            .sort((a, b) => b[1] - a[1])
        priorityDistribute(panels)
    }

    // 4.
    // At this point we're dealing only with new panels, whether it's a fresh
    // render or users are going from page to page, whatever width we have we want
    // to distribute in a somewhat logical manner. We'll create sets of panels and
    // deltas to then distribute widths based on, either evenly or "outward"
    // depending on the scenario
    if (addedPanels.length && remainingSize) {
        panels = addedPanels
            .filter((name) => configs[name].defaultSize !== Infinity)
            .map<PanelDelta>((name) => [
                name,
                configs[name].defaultSize - sizes[name],
            ])
            .sort((a, b) => a[1] - b[1])
        evenDistribute(panels)

        // -> Then we deal with panels that have an infinite `defaultSize`
        panels = addedPanels
            .filter((name) => configs[name].defaultSize === Infinity)
            .map<PanelDelta>((name) => [name, Infinity])
        evenDistribute(panels)

        // -> And finally fill panels up to their maxSize
        panels = addedPanels
            .map<PanelDelta>((name) => [
                name,
                configs[name].maxSize - sizes[name],
            ])
            .sort((a, b) => a[1] - b[1])
        evenDistribute(panels)
    }

    if (removedPanels.length && remainingSize) {
        // previous index of the removed panel
        const panelIndex = Math.max(
            ...removedPanels.map((name) => previousOrder.indexOf(name))
        )

        // divide the remaining size over panels to the right of the removed
        // panel first, and then to the left
        panels = [
            ...order.slice(panelIndex),
            ...order.slice(0, panelIndex).reverse(),
        ].map((name) => [name, configs[name].maxSize - sizes[name]])
        priorityDistribute(panels)
    }

    return sizes
}
