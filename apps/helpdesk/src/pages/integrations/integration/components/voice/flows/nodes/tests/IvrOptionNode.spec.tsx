import { Form } from '@repo/forms'
import { render, screen } from '@testing-library/react'

import type { Node } from 'core/ui/flows'
import { Flow, FlowProvider } from 'core/ui/flows'

import { VoiceFlowNodeType } from '../../constants'
import { IvrOptionNode } from '../IvrOptionNode'

const nodes: Node<Record<string, unknown>>[] = [
    {
        id: '1',
        position: { x: 0, y: 0 },
        data: {
            branch_options: [
                {
                    input_digit: 'does_not_matter_should_be_ignored',
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
    {
        id: '3',
        type: VoiceFlowNodeType.IvrOption,
        position: { x: 100, y: 100 },
        data: {
            optionIndex: 1,
            parentId: '1',
        },
    },
]

const formDefaultValues = {
    steps: {
        '1': {
            branch_options: [
                { input_digit: '5', next_step_id: '3' },
                { input_digit: '2', next_step_id: '4', branch_name: 'Sales' },
            ],
        },
    },
}

const renderComponent = () => {
    return render(
        <FlowProvider>
            <Form onValidSubmit={jest.fn()} defaultValues={formDefaultValues}>
                <Flow
                    nodes={nodes}
                    nodeTypes={{
                        [VoiceFlowNodeType.IvrOption]: IvrOptionNode,
                    }}
                    edges={[]}
                />
            </Form>
        </FlowProvider>,
    )
}

describe('IvrOptionNode', () => {
    it('should render correct label', () => {
        renderComponent()

        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('2 - Sales')).toBeInTheDocument()
    })
})
