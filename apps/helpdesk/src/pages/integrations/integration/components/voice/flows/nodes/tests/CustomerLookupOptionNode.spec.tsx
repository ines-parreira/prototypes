import { render, screen } from '@testing-library/react'

import { Form } from 'core/forms'
import { Flow, FlowProvider, Node } from 'core/ui/flows'

import { VoiceFlowNodeType } from '../../constants'
import { CustomerLookupOptionNode } from '../CustomerLookupOptionNode'

const nodes: Node<Record<string, unknown>>[] = [
    {
        id: '1',
        position: { x: 0, y: 0 },
        data: {
            branch_options: [
                {
                    field_value: 'field value',
                    branch_name: 'branch name',
                    next_step_id: '2',
                },
            ],
            default_next_step_id: '2',
        },
    },
    {
        id: '2',
        type: VoiceFlowNodeType.CustomerLookupOption,
        position: { x: 100, y: 100 },
        data: {
            parentId: '1',
            isDefaultOption: true,
            next_step_id: '2',
        },
    },
    {
        id: '3',
        type: VoiceFlowNodeType.CustomerLookupOption,
        position: { x: 100, y: 100 },
        data: {
            parentId: '1',
            next_step_id: '2',
            optionIndex: 0,
        },
    },
]

const formDefaultValues = {
    steps: {
        '1': {
            branch_options: [
                {
                    field_value: 'field value',
                    branch_name: 'branch name',
                    next_step_id: '2',
                },
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
                        [VoiceFlowNodeType.CustomerLookupOption]:
                            CustomerLookupOptionNode,
                    }}
                    edges={[]}
                />
            </Form>
        </FlowProvider>,
    )
}

describe('CustomerLookupOptionNode', () => {
    it('should render the node with the correct label', () => {
        renderComponent()
        expect(screen.getAllByText('Other').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('branch name')).toBeInTheDocument()
    })
})
