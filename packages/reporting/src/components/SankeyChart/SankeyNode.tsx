import type { NodeProps } from 'recharts/types/chart/Sankey'

import type { SankeyNodeItem } from './types'

import css from './SankeyChart.less'

type SankeyNodeRendererProps = {
    nodes: SankeyNodeItem[]
    totalSourceValue: number
    valueFormatter?: (value: number) => string
    minNodeHeight?: number
    maxNodeHeight?: number
    hoverableNodeNames?: string[]
    hoveredNodeHighlight?: { nodeIndex: number; color: string } | null
}

export const createNodeRenderer =
    ({
        nodes,
        totalSourceValue,
        valueFormatter,
        minNodeHeight = 0,
        maxNodeHeight = Infinity,
        hoverableNodeNames,
        hoveredNodeHighlight,
    }: SankeyNodeRendererProps) =>
    (props: NodeProps) => {
        const { x, y, width, height, index, payload } = props

        const numX = x ?? 0
        const numY = y ?? 0
        const numWidth = width ?? 0
        const numHeight = height ?? 0

        const displayHeight = Math.min(
            maxNodeHeight,
            Math.max(minNodeHeight, numHeight),
        )
        const displayY = numY - (displayHeight - numHeight) / 2

        const node = nodes[index]
        if (!node) return <g />

        const nodeValue = (payload as { value?: number })?.value ?? 0
        const labelY = numY + numHeight / 2
        const isHoverable = hoverableNodeNames?.includes(node.name) ?? false

        const percentage =
            totalSourceValue > 0
                ? ((nodeValue / totalSourceValue) * 100).toFixed(1)
                : '0.0'
        const formattedValue = valueFormatter
            ? valueFormatter(nodeValue)
            : nodeValue.toLocaleString()

        const className = isHoverable ? css.nodeContainer : undefined

        return (
            <g className={className}>
                <rect
                    x={numX}
                    y={displayY}
                    width={numWidth}
                    height={displayHeight}
                    fill={
                        hoveredNodeHighlight?.nodeIndex === index
                            ? hoveredNodeHighlight.color
                            : node.color
                    }
                    rx={2}
                    ry={2}
                />
                <g className={css.nodeLabelGroup}>
                    <text
                        x={numX + numWidth + 8}
                        y={labelY - 10}
                        className={css.nodeLabel}
                        dominantBaseline="middle"
                    >
                        {node.name}
                    </text>
                    <text
                        x={numX + numWidth + 8}
                        y={labelY + 6}
                        className={css.nodeValue}
                        dominantBaseline="middle"
                    >
                        {formattedValue}
                    </text>
                    <text
                        x={numX + numWidth + 8}
                        y={labelY + 22}
                        className={css.nodePercentage}
                        dominantBaseline="middle"
                    >
                        {percentage}%
                    </text>
                </g>
            </g>
        )
    }
