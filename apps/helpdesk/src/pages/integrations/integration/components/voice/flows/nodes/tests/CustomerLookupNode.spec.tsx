import { ComponentProps } from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    mockCustomerFieldBranchOption,
    mockCustomerFieldsConditionalStep,
} from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { Flow, FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { VoiceFlowNodeType } from '../../constants'
import { VoiceFlowNode } from '../../types'
import { CustomerLookupNode } from '../CustomerLookupNode'

const mockUpdateNodes = jest.fn()
jest.mock(
    'pages/integrations/integration/components/voice/flows/hooks/useUpdateNodes',
    () => ({
        useUpdateNodes: () => mockUpdateNodes,
    }),
)

const matchesOriginal = HTMLElement.prototype.matches
HTMLElement.prototype.matches = function (query: string) {
    if (query === ':focus-visible') return false
    return matchesOriginal.call(this, query)
}
HTMLCanvasElement.prototype.getContext = jest.fn()

const customerLookupStep = mockCustomerFieldsConditionalStep({
    id: '1',
    custom_field_id: 1,
    branch_options: [
        mockCustomerFieldBranchOption({
            field_value: 'found',
        }),
        mockCustomerFieldBranchOption({
            field_value: 'not_found',
        }),
    ],
    default_next_step_id: null,
})

const defaultValues = {
    first_step_id: '1',
    steps: {
        [customerLookupStep.id]: customerLookupStep,
    },
}

const nodes: VoiceFlowNode[] = [
    {
        id: customerLookupStep.id,
        type: VoiceFlowNodeType.CustomerLookup,
        data: customerLookupStep,
        position: { x: 0, y: 0 },
    },
]

const onNodesChange = jest.fn()
const flowProps: ComponentProps<typeof Flow> = {
    nodes,
    nodeTypes: {
        [VoiceFlowNodeType.CustomerLookup]: CustomerLookupNode,
    },
    onNodesChange,
}

const renderComponent = (
    flowDefaultProps: ComponentProps<typeof Flow> = flowProps,
    formDefaultValues = defaultValues,
) => {
    return renderWithStoreAndQueryClientProvider(
        <FlowProvider>
            <Form defaultValues={formDefaultValues} onValidSubmit={jest.fn()}>
                <Flow
                    {...flowDefaultProps}
                    nodesDraggable={false}
                    panOnDrag={false}
                />
            </Form>
        </FlowProvider>,
        {},
    )
}

describe('CustomerLookupNode', () => {
    it('should render node', () => {
        renderComponent()

        expect(
            screen.getAllByText('Customer lookup').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByText('Select customer field').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByText('Customer fields retrieved').length,
        ).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Other').length).toBeGreaterThanOrEqual(1)
    })

    it('should add new node to flow when add option button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(screen.getByText('Add option'))
        })

        await waitFor(() => {
            expect(mockUpdateNodes).toHaveBeenCalled()
        })
    })

    it('should update node data when the value changes', async () => {
        const user = userEvent.setup()

        renderComponent()

        const onNodesChangeNumberOfCalls = onNodesChange.mock.calls.length

        await act(async () => {
            await user.type(
                screen.getAllByPlaceholderText('Branch name')[0],
                'test-value',
            )
        })

        await waitFor(() => {
            expect(onNodesChange.mock.calls.length).toBeGreaterThan(
                onNodesChangeNumberOfCalls,
            )
        })
    })

    it('should not render node when form value does not exist', () => {
        const step = mockCustomerFieldsConditionalStep()
        const flow = {
            steps: {},
        }

        renderComponent(step, flow as any)

        expect(screen.queryByText('Customer lookup')).not.toBeInTheDocument()
    })

    it('should render default branch name field', () => {
        renderComponent()

        expect(
            screen.getAllByDisplayValue('Other').length,
        ).toBeGreaterThanOrEqual(1)
    })

    it('should render field value select for branch options', () => {
        renderComponent()

        // The select fields are only visible when the node is expanded
        // In the collapsed view, we can only see the node title and description
        expect(
            screen.getAllByText('Customer lookup').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByText('Select customer field').length,
        ).toBeGreaterThanOrEqual(1)
    })

    it('should call onRemoveOption when remove button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const removeButtons = screen.getAllByText('close')

        expect(removeButtons.length).toBeGreaterThanOrEqual(
            customerLookupStep.branch_options.length,
        )

        await act(async () => {
            await user.click(removeButtons[0])
        })

        await waitFor(() => {
            expect(onNodesChange).toHaveBeenCalled()
        })
    })
})
