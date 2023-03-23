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

const layout = flextree<Node>({
    // the node size configures the spacing between the nodes ([width, height])
    nodeSize: () => [300, 72 + 24 * 2],
    // this is needed for creating equal space between all nodes
    spacing: () => 1,
})

const nodeCountSelector = (state: ReactFlowState) => state.nodeInternals.size
const nodesInitializedSelector = (state: ReactFlowState) =>
    Array.from(state.nodeInternals.values()).every(
        (node) => node.width && node.height
    )

function useCanNodesFitInView() {
    const {width, height, minZoom} = useStore(({width, height, minZoom}) => {
        return {width, height, minZoom}
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
                minZoom
            const nodesHeight =
                (bottomMostNode.position.y + bottomMostNode.height!) * minZoom
            return nodesWidth < width && nodesHeight < height
        },
        [height, width, minZoom]
    )
}

const fitViewDuration = 300

function useAutoLayout() {
    const minZoom = useStore((store: ReactFlowState) => store.minZoom)
    const nodeCount = useStore(nodeCountSelector)
    const nodesInitialized = useStore(nodesInitializedSelector)
    const {getNodes, getEdges, setNodes, fitView} = useReactFlow()
    const canNodesFitInView = useCanNodesFitInView()
    const previousNodes = useRef<Node[]>([])

    useEffect(() => {
        // only run the layout if there are nodes and they have been initialized with their dimensions
        if (!nodeCount || !nodesInitialized) {
            return
        }

        const edges: Edge[] = getEdges()
        const nodes: Node[] = getNodes()

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

        // fit view
        if (!canNodesFitInView(nextNodes)) {
            // nodes do not fit in the view, so we zoom on the new nodes only
            const previousNodesIds = new Set(
                previousNodes.current.map((n) => n.id)
            )
            const newNodes = nextNodes.filter(
                (n) => !previousNodesIds.has(n.id)
            )
            // do not try to fit view if nodes have been deleted but nodes won't fit in the viewport
            if (newNodes.length > 0)
                setTimeout(() => {
                    fitView({
                        duration: fitViewDuration,
                        nodes: newNodes,
                        maxZoom: minZoom,
                    })
                })
        } else {
            setTimeout(() => {
                fitView({
                    duration: fitViewDuration,
                })
            })
        }
        previousNodes.current = getNodes()
    }, [
        nodeCount,
        nodesInitialized,
        getNodes,
        getEdges,
        setNodes,
        fitView,
        canNodesFitInView,
        minZoom,
    ])
}

export default useAutoLayout
