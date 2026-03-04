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

export type SankeyChartProps = {
    title: string
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: SankeyChartData
    isLoading?: boolean
    onLinkClick?: (payload: SankeyLinkClickPayload) => void
    nodeWidth?: number
    nodePadding?: number
    labelWidth?: number
    valueFormatter?: (value: number) => string
    minLinkWidth?: number
}
