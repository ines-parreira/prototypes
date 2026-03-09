import type { ComponentProps } from 'react'

import type { Edge, Node } from '@xyflow/react'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { ActionLabel, Background, Flow, NodeWrapper, StepCard } from '../index'
import { CustomControls } from './CustomControls'

const meta: Meta<typeof Flow> = {
    title: 'Common/Flows/Flow',
    component: Flow,
}

export default meta

type Story = StoryObj<typeof Flow>

const defaultNodes: Node[] = [
    {
        id: 'node-1',
        type: 'inputNode',
        position: { x: 0, y: 50 },
        data: { label: 'Start Node' },
    },
    {
        id: 'node-2',
        type: 'stepNode',
        position: { x: 0, y: 250 },
        data: { label: 'Processing Node' },
    },
    {
        id: 'node-3',
        type: 'outputNode',
        position: { x: 0, y: 450 },
        data: { label: 'End Node' },
    },
]

const defaultEdges: Edge[] = [
    {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        animated: true,
    },
    {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
    },
]

export const Default: Story = {
    render: (args) => (
        <div style={{ height: '400px', width: '100%' }}>
            <Flow {...args} />
        </div>
    ),
    args: {
        nodes: defaultNodes,
        edges: defaultEdges,
    },
}

export const WithBackgroundAndCustomControls: Story = {
    render: (args) => (
        <div style={{ height: '400px', width: '100%' }}>
            <Flow {...args}>
                <Background />
                <CustomControls />
            </Flow>
        </div>
    ),
    args: {
        nodes: defaultNodes,
        edges: defaultEdges,
    },
}

const customNodes: Node[] = [
    {
        id: 'custom-1',
        type: 'customNode',
        position: { x: 0, y: 0 },
        data: { label: 'Start', color: '#a8e6cf' },
    },
    {
        id: 'custom-2',
        type: 'customNode',
        position: { x: 0, y: 150 },
        data: { label: 'Process', color: '#ffd3b6' },
    },
    {
        id: 'custom-3',
        type: 'customNode',
        position: { x: 0, y: 300 },
        data: { label: 'End', color: '#ffaaa5' },
    },
]

const customEdges: Edge[] = [
    {
        id: 'custom-e1-2',
        source: 'custom-1',
        target: 'custom-2',
        type: 'customEdge',
    },
    {
        id: 'custom-e2-3',
        source: 'custom-2',
        target: 'custom-3',
        type: 'customEdge',
    },
]

const nodeWrapperProps = {} as ComponentProps<typeof NodeWrapper>

export const WithCustomNodes: Story = {
    render: (args) => (
        <div style={{ height: '400px', width: '100%' }}>
            <Flow {...args}>
                <Background />
            </Flow>
        </div>
    ),
    args: {
        nodes: customNodes,
        edges: customEdges,
        nodeTypes: {
            customNode: ({
                data,
            }: {
                data: { label: string; color?: string }
            }) => {
                return (
                    <div
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            backgroundColor: data.color || '#f0f0f0',
                            width: '100px',
                            height: '50px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <NodeWrapper {...nodeWrapperProps}>
                            <div>{data.label}</div>
                        </NodeWrapper>
                    </div>
                )
            },
        },
        edgeTypes: {
            customEdge: ({ id, sourceX, sourceY, targetX, targetY }) => {
                return (
                    <path
                        id={id}
                        className="react-flow__edge-path"
                        d={`M${sourceX},${sourceY} C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`}
                        style={{ stroke: 'red', strokeWidth: 2, fill: 'none' }}
                    />
                )
            },
        },
    },
}

export const WithActionLabelAndStepCardNodes: Story = {
    render: (args) => (
        <div style={{ height: '400px', width: '100%' }}>
            <Flow {...args}>
                <Background />
                <CustomControls />
            </Flow>
        </div>
    ),
    args: {
        nodes: defaultNodes,
        edges: defaultEdges,
        nodeTypes: {
            inputNode: ({ data }: { data: { label: string } }) => {
                return (
                    <NodeWrapper {...nodeWrapperProps}>
                        <ActionLabel
                            label={data.label}
                            icon={<i className={'material-icons'}>start</i>}
                        />
                    </NodeWrapper>
                )
            },
            outputNode: ({ data }: { data: { label: string } }) => {
                return (
                    <NodeWrapper {...nodeWrapperProps}>
                        <ActionLabel
                            label={data.label}
                            icon={<i className={'material-icons'}>stop</i>}
                        />
                    </NodeWrapper>
                )
            },
            stepNode: ({ data }: { data: { label: string } }) => {
                return (
                    <NodeWrapper {...nodeWrapperProps}>
                        <StepCard
                            title={data.label}
                            description={'This is a random description'}
                        />
                    </NodeWrapper>
                )
            },
        },
    },
}
