import { render, screen } from '@testing-library/react'

import { mockCustomerFieldsConditionalStep } from '@gorgias/helpdesk-mocks'
import type { CallRoutingFlowSteps } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { Flow, FlowProvider } from 'core/ui/flows'

import { VoiceFlowNodeType } from '../../constants'
import type { VoiceFlowNode } from '../../types'
import { CustomerLookupOptionNode } from '../CustomerLookupOptionNode'

const firstStep = mockCustomerFieldsConditionalStep({
    id: '1',
    name: 'Customer lookup',
    step_type: VoiceFlowNodeType.CustomerLookup,
    branch_options: [
        {
            field_value: ['field value'],
            branch_name: 'branch name',
            next_step_id: '2',
        },
    ],
    default_next_step_id: '2',
})

const nodes: VoiceFlowNode[] = [
    {
        id: '1',
        position: { x: 0, y: 0 },
        type: VoiceFlowNodeType.CustomerLookup,
        data: firstStep,
    },
    {
        id: '2',
        type: VoiceFlowNodeType.CustomerLookupOption,
        position: { x: 100, y: 100 },
        data: {
            parentId: '1',
            isDefaultOption: true,
            optionIndex: 0,
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

const formDefaultValues: { steps: CallRoutingFlowSteps } = {
    steps: {
        [firstStep.id]: firstStep,
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
                    ...firstStep,
                    branch_options: [
                        {
                            field_value: ['field value'],
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
                    ...firstStep,
                    branch_options: [
                        {
                            field_value: ['True'],
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
                    ...firstStep,
                    branch_options: [
                        {
                            field_value: ['False'],
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
                    ...firstStep,
                    branch_options: [
                        { field_value: [], branch_name: '', next_step_id: '2' },
                    ],
                },
            },
        })

        expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render the node with multiple field values joined by comma', () => {
        renderComponent({
            steps: {
                '1': {
                    ...firstStep,
                    branch_options: [
                        {
                            field_value: ['value1', 'value2', 'value3'],
                            branch_name: '',
                            next_step_id: '2',
                        },
                    ],
                },
            },
        })

        expect(screen.getByText('value1, value2, value3')).toBeInTheDocument()
    })

    it('should render the node with multiple field values including boolean transformations', () => {
        renderComponent({
            steps: {
                '1': {
                    ...firstStep,
                    branch_options: [
                        {
                            field_value: ['True', 'False'],
                            branch_name: '',
                            next_step_id: '2',
                        },
                    ],
                },
            },
        })

        expect(screen.getByText('Yes, No')).toBeInTheDocument()
    })

    it.each([
        ['value', 'value'],
        ['True', 'Yes'],
        ['False', 'No'],
        [[], 1],
        ['', 1],
    ])(
        'should render the label correctly even when the field value is a string or boolean or empty',
        (fieldValue, expectedLabel) => {
            renderComponent({
                steps: {
                    '1': {
                        ...firstStep,
                        branch_options: [
                            {
                                field_value: fieldValue,
                                branch_name: undefined,
                                next_step_id: '2',
                            },
                        ],
                    },
                },
            })

            expect(screen.getByText(expectedLabel)).toBeInTheDocument()
        },
    )
})
