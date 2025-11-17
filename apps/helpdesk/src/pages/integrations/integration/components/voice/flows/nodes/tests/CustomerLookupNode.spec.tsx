import type { ComponentProps } from 'react'
import React from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBooleanDataTypeDefinition,
    mockBooleanDropdownInputSettings,
    mockCustomerFieldBranchOption,
    mockCustomerFieldsConditionalStep,
    mockCustomField,
    mockDropdownInputSettingsSettings,
    mockListCustomFieldsHandler,
    mockTextDataTypeDefinition,
    mockTextInputSettings,
} from '@gorgias/helpdesk-mocks'
import type { CustomField, ListCustomFields200 } from '@gorgias/helpdesk-types'
import { ObjectType } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { Flow, FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { VoiceFlowNodeType } from '../../constants'
import type { VoiceFlowNode } from '../../types'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { CustomerLookupNode } from '../CustomerLookupNode'

const mockCustomFields: CustomField[] = [
    mockCustomField({
        id: 1,
        label: 'Dropdown field',
        object_type: ObjectType.Customer,
        definition: mockTextDataTypeDefinition({
            input_settings: mockDropdownInputSettingsSettings({
                choices: ['active', 'inactive', 'pending'],
            }),
        }),
    }),
    mockCustomField({
        id: 2,
        label: 'Boolean field',
        object_type: ObjectType.Customer,
        definition: mockBooleanDataTypeDefinition({
            input_settings: mockBooleanDropdownInputSettings({
                choices: [true, false],
            }),
        }),
    }),
    mockCustomField({
        id: 3,
        label: 'Text field',
        object_type: ObjectType.Customer,
        definition: mockTextDataTypeDefinition({
            input_settings: mockTextInputSettings(),
        }),
    }),
]

const server = setupServer()
const mockListCustomFields = mockListCustomFieldsHandler(async () =>
    HttpResponse.json({
        data: mockCustomFields,
    } as ListCustomFields200),
)

beforeAll(() => {
    server.listen()
})

beforeEach(() => {
    server.use(mockListCustomFields.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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
                <VoiceFlowProvider selectedNode={customerLookupStep.id}>
                    <Flow
                        {...flowDefaultProps}
                        nodesDraggable={false}
                        panOnDrag={false}
                    />
                </VoiceFlowProvider>
            </Form>
        </FlowProvider>,
        {},
    )
}

describe('CustomerLookupNode', () => {
    it('should render node', async () => {
        renderComponent()

        expect(
            screen.getAllByText('Customer lookup').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByText('Select customer field').length,
        ).toBeGreaterThanOrEqual(1)

        await waitFor(() => {
            expect(
                screen.getAllByText('Customer fields retrieved').length,
            ).toBeGreaterThanOrEqual(1)
        })

        await waitFor(() => {
            expect(
                screen.getAllByDisplayValue('Other').length,
            ).toBeGreaterThanOrEqual(1)
        })
    })

    it('should add new node to flow when add option button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Add option')).toBeInTheDocument()
        })

        await act(async () => {
            await user.click(screen.getByText('Add option'))
        })

        await waitFor(() => {
            expect(mockUpdateNodes).toHaveBeenCalled()
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

    it('should render field value select for branch options', () => {
        renderComponent()

        expect(
            screen.getAllByText('Customer lookup').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByText('Select customer field').length,
        ).toBeGreaterThanOrEqual(1)
    })

    it('should only display dropdown and boolean fields in the select field', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getAllByText('Dropdown field').length,
            ).toBeGreaterThanOrEqual(1)
            expect(
                screen.getAllByText('Boolean field').length,
            ).toBeGreaterThanOrEqual(1)
            expect(screen.queryByText('Text field')).not.toBeInTheDocument()
        })
    })
})
