import { render, screen } from '@testing-library/react'

import { Flow, FlowProvider, Node } from 'core/ui/flows'

import { VoiceFlowNodeType } from '../../constants'
import { IvrOptionNode } from '../IvrOptionNode'

const nodes: Node<Record<string, unknown>>[] = [
    {
        id: '1',
        position: { x: 0, y: 0 },
        data: {
            branch_options: [
                {
                    input_digit: '5',
                    next_step_id: '3',
                },
            ],
        },
    },
    {
        id: '2',
        type: VoiceFlowNodeType.IvrOption,
        position: { x: 100, y: 100 },
        data: {
            optionIndex: 0,
            parentId: '1',
        },
    },
]

const renderComponent = () => {
    return render(
        <FlowProvider>
            <Flow
                nodes={nodes}
                nodeTypes={{
                    [VoiceFlowNodeType.IvrOption]: IvrOptionNode,
                }}
                edges={[]}
            />
        </FlowProvider>,
    )
}

describe('IvrOptionNode', () => {
    it('should render correct label', () => {
        renderComponent()

        expect(screen.getByText('5')).toBeInTheDocument()
    })
})
