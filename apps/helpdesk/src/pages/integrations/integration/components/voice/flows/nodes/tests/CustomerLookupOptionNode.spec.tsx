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

const renderComponent = (defaultValues = formDefaultValues) => {
    return render(
        <FlowProvider>
            <Form onValidSubmit={jest.fn()} defaultValues={defaultValues}>
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

    it('should render the node with the field value as label when the branch name is not provided', () => {
        renderComponent({
            steps: {
                '1': {
                    branch_options: [
                        {
                            field_value: 'field value',
                            branch_name: '',
                            next_step_id: '2',
                        },
                    ],
                },
            },
        })

        expect(screen.getByText('field value')).toBeInTheDocument()
    })

    it('should render the node with the correct label when the field value is provided and value is "True"', () => {
        renderComponent({
            steps: {
                '1': {
                    branch_options: [
                        {
                            field_value: 'True',
                            branch_name: '',
                            next_step_id: '2',
                        },
                    ],
                },
            },
        })
        expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('should render the node with the correct label when the field value is provided and value is "False"', () => {
        renderComponent({
            steps: {
                '1': {
                    branch_options: [
                        {
                            field_value: 'False',
                            branch_name: '',
                            next_step_id: '2',
                        },
                    ],
                },
            },
        })
        expect(screen.getByText('No')).toBeInTheDocument()
    })

    it('should render the node with the option index as label when the branch name and field value are not provided', () => {
        renderComponent({
            steps: {
                '1': {
                    branch_options: [
                        { field_value: '', branch_name: '', next_step_id: '2' },
                    ],
                },
            },
        })

        expect(screen.getByText('1')).toBeInTheDocument()
    })
})
