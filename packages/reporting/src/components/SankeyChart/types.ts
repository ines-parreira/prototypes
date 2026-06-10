import type { SizeValue } from '@gorgias/axiom'

export type SankeyNodeItem<NodeName extends string = string> = {
    name: NodeName
    color: string
}

export type SankeyLinkItem<NodeName extends string = string> = {
    source: NodeName
    target: NodeName
    value: number
    color?: string
    isClickable?: boolean
    strokeOpacity?: number
}

export type SankeyChartData<NodeName extends string = string> = {
    nodes: SankeyNodeItem<NodeName>[]
    links: SankeyLinkItem<NodeName>[]
}

export type SankeyLinkClickPayload = {
    source: SankeyNodeItem
    target: SankeyNodeItem
    value: number
    linkIndex: number
}

export type SankeyChartProps<NodeName extends string = string> = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: SankeyChartData<NodeName>
    isLoading?: boolean
    onLinkClick?: (payload: SankeyLinkClickPayload) => void
    nodeWidth?: number
    nodePadding?: number
    labelWidth?: number
    valueFormatter?: (value: number) => string
    minLinkWidth?: number
    minNodeHeight?: number
    maxNodeHeight?: number
    hoverableNodeNames?: NodeName[]
    minHeightToShowLabel?: number
    /**
     * When true, the node label shows the value and percentage on a single line
     * as `value (percentage%)` instead of stacking them on separate lines.
     */
    showPercentageWithValue?: boolean
    /**
     * Controls horizontal node placement. `'justify'` (default) pushes terminal
     * nodes to the rightmost column; `'left'` keeps every node at its natural
     * depth, so siblings like inbound/outbound line up in the same column.
     */
    nodeAlign?: 'left' | 'justify'
    /**
     * Controls vertical node placement within a column. `'justify'` (default)
     * spreads nodes to fill the height; `'top'` stacks them from the top.
     */
    verticalAlign?: 'top' | 'justify'
}
