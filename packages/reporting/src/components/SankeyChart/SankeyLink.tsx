import type { LinkProps } from 'recharts/types/chart/Sankey'

import type { SankeyLinkClickPayload, SankeyNodeItem } from './types'

import css from './SankeyChart.less'

export type ResolvedLink = {
    source: number
    target: number
    value: number
    color?: string
    isClickable?: boolean
    strokeOpacity?: number
}

type SankeyLinkRendererOptions = {
    links: ResolvedLink[]
    nodes: SankeyNodeItem[]
    onLinkClick?: (payload: SankeyLinkClickPayload) => void
    onLinkHoverChange?: (
        tooltip: {
            value: number
            x: number
            y: number
            label?: string
            targetLabel?: string
        } | null,
    ) => void
    onLinkSourceHover?: (
        sourceNodeIndex: number | null,
        targetColor: string | null,
    ) => void
    minLinkWidth: number
    minNodeHeight?: number
}

export const createLinkRenderer =
    ({
        links,
        nodes,
        onLinkClick,
        onLinkHoverChange,
        onLinkSourceHover,
        minLinkWidth,
        minNodeHeight = 0,
    }: SankeyLinkRendererOptions) =>
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

        const d = `M${(sourceX ?? 0) - 1},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${(targetX ?? 0) + 1},${targetY}`
        const clampedWidth = Math.max(
            minLinkWidth,
            minNodeHeight,
            linkWidth ?? 0,
        )

        const linkData = links[index]
        if (!linkData) {
            return (
                <path
                    d={d}
                    fill="none"
                    stroke="#ccc"
                    strokeWidth={clampedWidth}
                    strokeLinecap="butt"
                    className={css.link}
                    style={{ strokeOpacity: 0.15 }}
                />
            )
        }

        const isClickable = linkData.isClickable ?? false
        const baseOpacity = linkData.strokeOpacity ?? 0.15
        const sourceNode = nodes[linkData.source]
        const targetNode = nodes[linkData.target]
        const linkColor = linkData.color ?? sourceNode?.color ?? '#ccc'
        const hoverColor = targetNode?.color ?? linkColor

        const handleMouseEnter = () => {
            onLinkSourceHover?.(linkData.source, targetNode?.color ?? null)
        }

        const handleMouseLeave = () => {
            onLinkHoverChange?.(null)
            onLinkSourceHover?.(null, null)
        }

        const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
            onLinkHoverChange?.({
                value: linkData.value,
                x: e.clientX,
                y: e.clientY,
                label: sourceNode?.name,
                targetLabel: targetNode?.name,
            })
        }

        const handleClick = () => {
            if (!isClickable || !onLinkClick) return

            onLinkClick({
                source: nodes[linkData.source],
                target: nodes[linkData.target],
                value: linkData.value,
                linkIndex: index,
            })
        }

        const linkStyle = isClickable
            ? ({
                  strokeOpacity: baseOpacity,
                  '--hover-color': hoverColor,
              } as React.CSSProperties)
            : { strokeOpacity: baseOpacity }

        return (
            <path
                d={d}
                fill="none"
                stroke={linkColor}
                strokeWidth={clampedWidth}
                strokeLinecap="butt"
                className={isClickable ? css.clickableLink : css.link}
                style={linkStyle}
                onClick={isClickable ? handleClick : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-label={
                    isClickable
                        ? `Link from ${payload.source.name} to ${payload.target.name}`
                        : undefined
                }
                onMouseEnter={isClickable ? handleMouseEnter : undefined}
                onMouseLeave={isClickable ? handleMouseLeave : undefined}
                onMouseMove={isClickable ? handleMouseMove : undefined}
            />
        )
    }
