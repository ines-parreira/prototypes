import { useMemo } from 'react'

import { ResponsiveContainer, Sankey } from 'recharts'

import { Box, Card, Heading, Skeleton } from '@gorgias/axiom'

import type { ResolvedLink } from './SankeyLink'
import { createLinkRenderer } from './SankeyLink'
import { createNodeRenderer } from './SankeyNode'
import type { SankeyChartProps } from './types'

import css from './SankeyChart.less'

const CHART_HEIGHT = 400
const DEFAULT_NODE_WIDTH = 10
const DEFAULT_NODE_PADDING = 24
const DEFAULT_LABEL_WIDTH = 160

export const SankeyChart = ({
    title,
    containerHeight,
    containerWidth,
    data,
    isLoading = false,
    onLinkClick,
    nodeWidth = DEFAULT_NODE_WIDTH,
    nodePadding = DEFAULT_NODE_PADDING,
    labelWidth = DEFAULT_LABEL_WIDTH,
    valueFormatter,
}: SankeyChartProps) => {
    const resolvedLinks: ResolvedLink[] = useMemo(() => {
        const nameToIndex = new Map(
            data.nodes.map((node, index) => [node.name, index]),
        )
        return data.links.map((link) => ({
            source: nameToIndex.get(link.source) ?? 0,
            target: nameToIndex.get(link.target) ?? 0,
            value: link.value,
            color: link.color,
            isClickable: link.isClickable,
        }))
    }, [data.nodes, data.links])

    const resolvedData = useMemo(
        () => ({ nodes: data.nodes, links: resolvedLinks }),
        [data.nodes, resolvedLinks],
    )

    const totalSourceValue = useMemo(() => {
        const targetNames = new Set(data.links.map((l) => l.target))
        return data.nodes.reduce((sum, node) => {
            if (targetNames.has(node.name)) return sum
            const nodeOutflow = data.links
                .filter((l) => l.source === node.name)
                .reduce((s, l) => s + l.value, 0)
            return sum + nodeOutflow
        }, 0)
    }, [data.nodes, data.links])

    const nodeRenderer = useMemo(
        () =>
            createNodeRenderer({
                nodes: data.nodes,
                totalSourceValue,
                valueFormatter,
            }),
        [data.nodes, totalSourceValue, valueFormatter],
    )

    const linkRenderer = useMemo(
        () =>
            createLinkRenderer({
                links: resolvedLinks,
                nodes: data.nodes,
                onLinkClick,
            }),
        [resolvedLinks, data.nodes, onLinkClick],
    )

    const chartHeight =
        typeof containerHeight === 'number' ? containerHeight : CHART_HEIGHT

    return (
        <Card className={css.cardContainer} padding="lg">
            <Box flexDirection="column" gap="md">
                <Heading size="sm">{title}</Heading>

                {isLoading ? (
                    <Box
                        height={containerHeight ?? CHART_HEIGHT}
                        width={containerWidth}
                        className={css.skeletonContainer}
                    >
                        <div className={css.skeletonColumn}>
                            <Skeleton height={60} />
                            <Skeleton height={40} />
                            <Skeleton height={30} />
                        </div>
                        <div
                            className={`${css.skeletonColumn} ${css.skeletonCenter}`}
                        >
                            <Skeleton height={CHART_HEIGHT - 40} />
                        </div>
                        <div className={css.skeletonColumn}>
                            <Skeleton height={50} />
                            <Skeleton height={50} />
                            <Skeleton height={30} />
                        </div>
                    </Box>
                ) : (
                    <Box
                        flexDirection="column"
                        width={containerWidth}
                        height={containerHeight}
                        className={css.chartContainer}
                    >
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <Sankey
                                data={resolvedData}
                                node={nodeRenderer}
                                link={linkRenderer}
                                nodeWidth={nodeWidth}
                                nodePadding={nodePadding}
                                sort={false}
                                margin={{ right: labelWidth }}
                            />
                        </ResponsiveContainer>
                    </Box>
                )}
            </Box>
        </Card>
    )
}
