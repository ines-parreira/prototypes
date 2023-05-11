import {useCallback, useEffect, useRef} from 'react'
import {
    Node,
    Edge,
    Position,
    ReactFlowState,
    useStore,
    useReactFlow,
} from 'reactflow'
import {FlextreeNode, flextree} from 'd3-flextree'
import {shallow} from 'zustand/shallow'

const nodeCountSelector = (state: ReactFlowState) => state.nodeInternals.size
const nodesInitializedSelector = (state: ReactFlowState) =>
    Array.from(state.nodeInternals.values()).every(
        (node) => node.width && node.height
    )

function useCanNodesFitInView(minZoomTreshold: number) {
    const {width, height} = useStore(({width, height}) => {
        return {width, height}
    }, shallow)
    return useCallback(
        (nodes: Node[]) => {
            if (nodes.length === 0) return true
            const areNodesInitialized = nodes.every(
                (node) => node.width && node.height
            )
            if (!areNodesInitialized) return true
            const leftMostNode = nodes.reduce((most, n) =>
                n.position.x < most.position.x ? n : most
            )
            const righMostNode = nodes.reduce((most, n) =>
                n.position.x > most.position.x ? n : most
            )
            const bottomMostNode = nodes.reduce((most, n) =>
                n.position.y > most.position.y ? n : most
            )
            const nodesWidth =
                (righMostNode.position.x +
                    righMostNode.width! -
                    leftMostNode.position.x) *
                minZoomTreshold
            const nodesHeight =
                (bottomMostNode.position.y + bottomMostNode.height!) *
                minZoomTreshold
            return nodesWidth < width && nodesHeight < height
        },
        [height, width, minZoomTreshold]
    )
}

const minZoomTresholds = {
    lowerBound: 0.2,
    readable: 0.5,
} as const

function useAutoFitView() {
    const {fitView, setViewport, getZoom} = useReactFlow()
    const viewportWidth = useStore((store: ReactFlowState) => store.width)
    const canNodesFitInReadableZoomLevel = useCanNodesFitInView(
        minZoomTresholds.readable
    )
    const isFirstTimeFittingView = useRef(true)

    const autoFitView = useCallback(
        (nextNodes: Node[], newNodes: Node[]) => {
            // on first load, when nodes don't fit in view, we make sure the first nodes are visible
            if (isFirstTimeFittingView.current) {
                if (!canNodesFitInReadableZoomLevel(nextNodes)) {
                    setTimeout(() => {
                        setViewport({
                            zoom: 1,
                            x: (viewportWidth - nodeWidth) / 2,
                            y: nodeGap * 2,
                        })
                    })
                } else {
                    setTimeout(() => {
                        fitView({
                            duration: 0,
                        })
                    })
                }
            } else {
                // center the view on the newly added nodes
                if (newNodes.length > 0) {
                    setTimeout(() => {
                        fitView({
                            duration: fitViewDuration,
                            nodes: newNodes,
                            minZoom: getZoom(),
                            maxZoom: getZoom(),
                        })
                    })
                }
            }
            if (isFirstTimeFittingView.current) {
                setTimeout(() => {
                    isFirstTimeFittingView.current = false
                }, fitViewDuration)
            }
        },
        [
            canNodesFitInReadableZoomLevel,
            fitView,
            getZoom,
            setViewport,
            viewportWidth,
        ]
    )
    return {autoFitView}
}

const fitViewDuration = 300
const nodeWidth = 300
const nodeHeight = 72
const triggerButtonNodeHeight = 98
const nodeGap = 24
const denseNodeGap = 4

function useAutoLayout() {
    const nodeCount = useStore(nodeCountSelector)
    const nodesInitialized = useStore(nodesInitializedSelector)
    const {getNodes, getEdges, setNodes} = useReactFlow()
    const {autoFitView} = useAutoFitView()
    const previousNodes = useRef<Node[]>([])

    useEffect(() => {
        // only run the layout if there are nodes and they have been initialized with their dimensions
        if (!nodeCount || !nodesInitialized) {
            return
        }

        const edges: Edge[] = getEdges()
        const nodes: Node[] = getNodes()

        const layout = flextree<Node>({
            // the node size configures the spacing between the nodes ([width, height])
            // a node is 274 x 72
            nodeSize: (node) => {
                if (node.data.type === 'reply_button') {
                    return [nodeWidth, nodeHeight + denseNodeGap]
                }

                if (node.data.type === 'trigger_button') {
                    return [nodeWidth, triggerButtonNodeHeight + denseNodeGap]
                }
                if (node.children?.[0].data.type === 'placeholder') {
                    return [nodeWidth, nodeHeight + nodeGap * 2]
                }

                if (node.data.type === 'automated_message') {
                    if ((node.children?.length ?? 0) > 1) {
                        return [nodeWidth, nodeHeight + nodeGap * 3]
                    }

                    return [nodeWidth, nodeHeight + nodeGap * 2]
                }

                return [nodeWidth, nodeHeight + nodeGap]
            },
            // this is needed for creating equal space between all nodes
            spacing: () => 1,
        })
        const root = layout.hierarchy(
            nodes.find((n: Node) => n.type === 'trigger_button')!,
            (node: Node) => {
                const childrenNodesIds = new Set(
                    edges
                        .filter((e) => e.source === node.id)
                        .map((e) => e.target)
                )
                return nodes.filter((n) => childrenNodesIds.has(n.id))
            }
        )
        layout(root)
        const layoutedNodes: Record<string, {x: number; y: number}> = {}
        root.each<FlextreeNode<Node>>(({data, x, y}) => {
            layoutedNodes[data.id] = {x, y}
        })

        // set the React Flow nodes with the positions from the layout
        const nextNodes = nodes.map((node) => {
            // find the node in the hierarchy with the same id and get its coordinates
            const {x, y} = layoutedNodes?.[node.id] || {
                x: node.position.x,
                y: node.position.y,
            }

            return {
                ...node,
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
                position: {x, y},
            }
        })
        setNodes(nextNodes)
        const previousNodesIds = new Set(previousNodes.current.map((n) => n.id))
        const newNodes = nextNodes.filter((n) => !previousNodesIds.has(n.id))

        // fit view logic
        autoFitView(nextNodes, newNodes)

        previousNodes.current = getNodes()
    }, [nodeCount, nodesInitialized, getNodes, getEdges, setNodes, autoFitView])
    return {minZoom: minZoomTresholds.lowerBound, maxZoom: 1}
}

export default useAutoLayout
