import type { Config } from '../types'
import clamp from './clamp'

type Options = {
    config: Config
    currentWidths: number[]
    handle: number
    delta: number
    totalWidth: number
}

export default function mutatePanels({
    config,
    currentWidths,
    delta,
    handle,
    totalWidth,
}: Options) {
    const newWidths = [...currentWidths]
    if (delta === 0) return newWidths

    // depending on the direction of the drag, we lock the widths of the
    // panels we are dragging away from while panels the drag is going
    // towards are eligible for resizing

    // maximum widths are dynamic since they are either defined in the
    // config, or they are calculated based on the constraints of all
    // the panels around them
    const maxWidths: number[] = []

    // minimum widths are just whatever's in the config
    const minWidths = config.map(([, min]) => min || 0)

    // dragging to the left
    if (delta < 0) {
        // we need to figure out the maximum width for each panel
        for (let i = 0; i < currentWidths.length; i++) {
            // we get the current widths of all the panels to the right,
            // since these widths are locked
            const rightWidths = currentWidths
                .slice(i + 1)
                .reduce((acc, w) => acc + w, 0)

            // we then get the MINIMUM widths of all the panels to the
            // left, since we need to respect this constraint
            const leftWidths = minWidths
                .slice(0, i)
                .reduce((acc, w) => acc + w, 0)

            // the remaining width is a simple calculation, but we need
            // to constrain this based on the max width in the config
            const remainingWidth = totalWidth - leftWidths - rightWidths
            maxWidths.push(Math.min(remainingWidth, config[i][2] || Infinity))
        }

        // since the amount of panels is dynamic, and some panels may
        // have a minimum width set, we want to divide the delta of the
        // drag over all panels that are eligible - for every panel that
        // is resized, the `remainingDelta` is adjusted
        let remainingDelta = delta

        // we know what handle is being dragged, so we start from the
        // panel to the right of the handle (handle 0 is in between
        // panels 0 and 1), and go left - all panels to the right of
        // that have their widths locked
        for (let i = handle + 1; i >= 0; i--) {
            // we cache the current width of the panel we're currently
            // processing in order to recalculate the delta every step
            // of the way. `minWidth` and `maxWidth` are just convenient
            const curWidth = currentWidths[i]
            const minWidth = minWidths[i]
            const maxWidth = maxWidths[i]

            // the panel to the right of the handle is a special case,
            // since we want add the INVERSE of the delta to it - it is
            // the only one that will behave differently
            if (i === handle + 1) {
                newWidths[i] = clamp(
                    curWidth + -remainingDelta,
                    minWidth,
                    maxWidth,
                )

                // we also constrain the remainingDelta here to figure
                // out the ACTUAL delta - even if the mouse cursor moves
                // further, a max width constraint on the panel to the
                // right of the handle can influence this
                remainingDelta = curWidth - newWidths[i]
            } else {
                // for every other panel (all the ones to the left of
                // the handle), we add the remaining delta to the panel.
                // keep in mind the remainingDelta is always < 0 here
                newWidths[i] = clamp(
                    curWidth + remainingDelta,
                    minWidth,
                    maxWidth,
                )

                // we adjust the remaining delta by substracting the
                // difference between the panel's current width with the
                // newly calculated width
                remainingDelta -= newWidths[i] - curWidth
            }
        }

        return newWidths
    }

    // here we are dragging right, so it's basically the same logic as
    // above, but mirrored. Panels to the left of the drag are now locked
    // while panels on the right are eligible for resizing. I will keep
    // the comments in this section to a minimum

    for (let i = 0; i < currentWidths.length; i++) {
        // panels to the left use current widths since those are locked
        const leftWidths = currentWidths
            .slice(0, i)
            .reduce((acc, w) => acc + w, 0)

        // panels to the right use min widths
        const rightWidths = minWidths
            .slice(i + 1)
            .reduce((acc, w) => acc + w, 0)

        // we once again constrain each width by the max width in the config
        const remainingWidth = totalWidth - leftWidths - rightWidths
        maxWidths.push(Math.min(remainingWidth, config[i][2] || Infinity))
    }

    // calculations below are the same as above, but in reverse
    let remainingDelta = delta
    for (let i = handle; i < currentWidths.length; i++) {
        const curWidth = currentWidths[i]
        const minWidth = minWidths[i]
        const maxWidth = maxWidths[i]

        if (i === handle) {
            newWidths[i] = clamp(curWidth + remainingDelta, minWidth, maxWidth)
            remainingDelta = newWidths[i] - curWidth
        } else {
            newWidths[i] = clamp(curWidth + -remainingDelta, minWidth, maxWidth)
            remainingDelta -= curWidth - newWidths[i]
        }
    }

    return newWidths
}
