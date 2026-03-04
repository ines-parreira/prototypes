import type { NodeProps } from 'recharts/types/chart/Sankey'

import type { SankeyNodeItem } from './types'

import css from './SankeyChart.less'

type SankeyNodeRendererProps = {
    nodes: SankeyNodeItem[]
    totalSourceValue: number
    valueFormatter?: (value: number) => string
}

export const createNodeRenderer =
    ({ nodes, totalSourceValue, valueFormatter }: SankeyNodeRendererProps) =>
    (props: NodeProps) => {
        const { x, y, width, height, index, payload } = props

        const numX = x ?? 0
        const numY = y ?? 0
        const numWidth = width ?? 0
        const numHeight = height ?? 0

        const node = nodes[index]
        if (!node) return <g />

        const nodeValue = (payload as { value?: number })?.value ?? 0
        const percentage =
            totalSourceValue > 0
                ? ((nodeValue / totalSourceValue) * 100).toFixed(1)
                : '0.0'
        const formattedValue = valueFormatter
            ? valueFormatter(nodeValue)
            : nodeValue.toLocaleString()

        return (
            <g>
                <rect
                    x={numX}
                    y={numY}
                    width={numWidth}
                    height={numHeight}
                    fill={node.color}
                    rx={2}
                    ry={2}
                />
                <g>
                    <text
                        x={numX + numWidth + 8}
                        y={numY + numHeight / 2 - 10}
                        className={css.nodeLabel}
                        dominantBaseline="middle"
                    >
                        {node.name}
                    </text>
                    <text
                        x={numX + numWidth + 8}
                        y={numY + numHeight / 2 + 6}
                        className={css.nodeValue}
                        dominantBaseline="middle"
                    >
                        {formattedValue}
                    </text>
                    <text
                        x={numX + numWidth + 8}
                        y={numY + numHeight / 2 + 22}
                        className={css.nodePercentage}
                        dominantBaseline="middle"
                    >
                        {percentage}%
                    </text>
                </g>
            </g>
        )
    }
