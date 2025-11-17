import type { Config, PanelConfig } from '../types'
import clamp from './clamp'

type Options = {
    config: Config
    totalWidth: number
}

export default function computeDefaultWidths({ config, totalWidth }: Options) {
    const widths = config.map(([w, min, max]) =>
        w === Infinity ? 0 : clamp(w, min || 0, max || Infinity),
    )

    const consumedWidth = widths
        .filter((w) => w !== 0)
        .reduce((acc, w) => acc + w, 0)

    let remainingWidth = totalWidth - consumedWidth

    const indexedConfig = config.map(
        (panelConfig, index): [number, PanelConfig] => [index, panelConfig],
    )

    const leftovers = indexedConfig.filter(([, [w]]) => w === Infinity)

    // first we fill panels that have a minimum width up to their
    // minimum and remove that width from the remaining width
    leftovers.forEach(([index, [, min]]) => {
        if (!min || min === Infinity) return

        widths[index] = min
        remainingWidth -= min
    })

    if (remainingWidth === 0) {
        return widths
    }

    // subtract from the panel widths that are still not at their
    // minimum width until they reach their minimum
    if (remainingWidth < 0) {
        for (let i = 0; i < widths.length; i++) {
            const currentWidth = widths[i]
            const [, min = 0] = config[i]

            const subtractedWidth = currentWidth + remainingWidth
            if (subtractedWidth >= min) {
                widths[i] = subtractedWidth
                break
            }
        }

        return widths
    }

    if (!!leftovers.length) {
        // then we divvy up the remaining width across all panels, we
        // floor this to avoid weird sub-pixel alignments
        const averageRemainingWidth = Math.floor(
            remainingWidth / leftovers.length,
        )

        leftovers.forEach(([index]) => {
            const currentWidth = widths[index] !== Infinity ? widths[index] : 0
            widths[index] = currentWidth + averageRemainingWidth
        })

        // recalculate the actual remaining width using the floored average
        remainingWidth =
            remainingWidth - averageRemainingWidth * leftovers.length

        // then we map over all the widths and see if any of them exceeded
        // their maximum widths. If so, we remove the excess and add it back
        // to the remaining width
        leftovers.forEach(([index, [, , max]]) => {
            if (!max || max === Infinity) return

            if (widths[index] > max) {
                const excessWidth = widths[index] - max
                remainingWidth += excessWidth
                widths[index] = max
            }
        })
    }

    // check how many panels there are with NO max width, and divide
    // the actual remaining width evenly across those. We again want
    // to make sure we don't do sub-pixel division, so we calculate the
    // average again and give the first panel a little extra
    const noMaxLeftovers = indexedConfig.filter(
        ([, [, , max]]) => !max || max === Infinity,
    )

    const averageRemainingWidth = Math.floor(
        remainingWidth / noMaxLeftovers.length,
    )
    const excessWidth =
        remainingWidth - averageRemainingWidth * noMaxLeftovers.length

    noMaxLeftovers.forEach(([index], i) => {
        widths[index] += averageRemainingWidth
        if (i === 0) widths[index] += excessWidth
    })

    return widths
}
