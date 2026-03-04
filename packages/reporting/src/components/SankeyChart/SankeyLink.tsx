import type { LinkProps } from 'recharts/types/chart/Sankey'

import type { SankeyLinkClickPayload, SankeyNodeItem } from './types'

import css from './SankeyChart.less'

export type ResolvedLink = {
    source: number
    target: number
    value: number
    color?: string
    isClickable?: boolean
}

type SankeyLinkRendererOptions = {
    links: ResolvedLink[]
    nodes: SankeyNodeItem[]
    onLinkClick?: (payload: SankeyLinkClickPayload) => void
    minLinkWidth: number
}

export const createLinkRenderer =
    ({ links, nodes, onLinkClick, minLinkWidth }: SankeyLinkRendererOptions) =>
    (props: LinkProps) => {
        const {
            sourceX,
            targetX,
            sourceY,
            targetY,
            sourceControlX,
            targetControlX,
            linkWidth,
            index,
            payload,
        } = props

        const d = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`
        const clampedWidth = Math.max(minLinkWidth, linkWidth ?? 0)

        const linkData = links[index]
        if (!linkData) {
            return (
                <path
                    d={d}
                    fill="none"
                    stroke="#ccc"
                    strokeWidth={clampedWidth}
                    strokeOpacity={0.25}
                />
            )
        }

        const isClickable = linkData.isClickable ?? false
        const sourceNode = nodes[linkData.source]
        const linkColor = linkData.color ?? sourceNode?.color ?? '#ccc'

        const handleClick = () => {
            if (!isClickable || !onLinkClick) return

            onLinkClick({
                source: nodes[linkData.source],
                target: nodes[linkData.target],
                value: linkData.value,
                linkIndex: index,
            })
        }

        return (
            <path
                d={d}
                fill="none"
                stroke={linkColor}
                strokeWidth={clampedWidth}
                strokeOpacity={0.25}
                className={isClickable ? css.clickableLink : css.link}
                onClick={isClickable ? handleClick : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-label={
                    isClickable
                        ? `Link from ${payload.source.name} to ${payload.target.name}`
                        : undefined
                }
            />
        )
    }
