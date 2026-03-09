import type { Edge, Node } from '@xyflow/react'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { CustomEdge } from './CustomEdge'
import { Flow } from './Flow'

const meta: Meta<typeof CustomEdge> = {
    title: 'Common/Flows/CustomEdge',
    component: CustomEdge,
}

export default meta

type Story = StoryObj<typeof CustomEdge>

const defaultNodes: Node[] = [
    {
        id: 'node-1',
        position: { x: 0, y: 50 },
        data: { label: 'Start Node' },
    },
    {
        id: 'node-2',
        position: { x: 0, y: 250 },
        data: { label: 'Processing Node' },
    },
    {
        id: 'node-3',
        position: { x: 0, y: 450 },
        data: { label: 'End Node' },
    },
]

const defaultEdges: Edge[] = [
    {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
    },
    {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
    },
]

export const Default: Story = {
    render: () => (
        <div style={{ height: '400px', width: '100%' }}>
            <Flow
                edgeTypes={{
                    default: CustomEdge,
                    custom: (props) => (
                        <CustomEdge {...props}>Add step</CustomEdge>
                    ),
                }}
                nodes={defaultNodes}
                edges={defaultEdges}
            />
        </div>
    ),
}
