import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { OverflowList } from '@gorgias/axiom'
import {
    mockCustomerCustomField,
    mockCustomerCustomFieldWithValue,
    mockCustomField,
    mockDropdownInputSettingsSettings,
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
    mockNumberDataTypeDefinition,
    mockNumberInputSettings,
    mockTextDataTypeDefinition,
    mockTextInputSettings,
} from '@gorgias/helpdesk-mocks'
import {
    DropdownInputSettingsSettingsInputType,
    InputSettingsNumberInputType,
    InputSettingsTextInputType,
    ObjectType,
} from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarCustomCustomerFields } from '../InfobarCustomCustomerFields'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const waitForQueriesSettled = async () => {
    await waitFor(
        () => {
            expect(testAppQueryClient.isFetching()).toBe(0)
        },
        { timeout: 5000 },
    )
}

const customerId = 123

const mockCustomer = {
    id: customerId,
    name: 'Test Customer',
    email: 'test@example.com',
} as any

const createTextField = () =>
    mockCustomField({
        id: 1,
        label: 'Company',
        object_type: ObjectType.Customer,
        definition: mockTextDataTypeDefinition({
            input_settings: mockTextInputSettings({
                input_type: InputSettingsTextInputType.Input,
            }),
        }),
    })

const createNumberField = () =>
    mockCustomField({
        id: 2,
        label: 'Age',
        object_type: ObjectType.Customer,
        definition: mockNumberDataTypeDefinition({
            input_settings: mockNumberInputSettings({
                input_type: InputSettingsNumberInputType.InputNumber,
            }),
        }),
    })

const createDropdownField = () =>
    mockCustomField({
        id: 3,
        label: 'Status',
        object_type: ObjectType.Customer,
        definition: mockTextDataTypeDefinition({
            input_settings: mockDropdownInputSettingsSettings({
                input_type: DropdownInputSettingsSettingsInputType.Dropdown,
                choices: ['active', 'inactive'],
            }),
        }),
    })

const setupMocks = (
    fields: ReturnType<typeof mockCustomField>[],
    values: ReturnType<typeof mockCustomerCustomFieldWithValue>[],
) => {
    const mockListCustomFields = mockListCustomFieldsHandler(async () =>
        HttpResponse.json(
            mockListCustomFieldsResponse({
                data: fields,
            }),
        ),
    )

    const mockListCustomerFieldsValues =
        mockListCustomerCustomFieldsValuesHandler(async () =>
            HttpResponse.json(
                mockListCustomerCustomFieldsValuesResponse({
                    data: values,
                }),
            ),
        )

    server.use(
        mockListCustomFields.handler,
        mockListCustomerFieldsValues.handler,
    )
}

const TestComponent = () => {
    return (
        <OverflowList nonExpandedLineCount={3}>
            <InfobarCustomCustomerFields customer={mockCustomer} />
        </OverflowList>
    )
}

describe('InfobarCustomCustomerFields', () => {
    it('should render custom fields', async () => {
        const textField = createTextField()
        const numberField = createNumberField()
        const dropdownField = createDropdownField()

        setupMocks(
            [textField, numberField, dropdownField],
            [
                mockCustomerCustomFieldWithValue({
                    field: mockCustomerCustomField({
                        id: textField.id,
                        definition: textField.definition,
                    }),
                    value: 'Acme Corp',
                }),
                mockCustomerCustomFieldWithValue({
                    field: mockCustomerCustomField({
                        id: numberField.id,
                        definition: numberField.definition,
                    }),
                    value: 25,
                }),
                mockCustomerCustomFieldWithValue({
                    field: mockCustomerCustomField({
                        id: dropdownField.id,
                        definition: dropdownField.definition,
                    }),
                    value: 'active',
                }),
            ],
        )

        render(<TestComponent />)

        await waitForQueriesSettled()

        expect(screen.getByText('Company')).toBeInTheDocument()
        expect(screen.getByText('Age')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should not render when there are no custom fields', async () => {
        setupMocks([], [])

        const { container } = render(<TestComponent />)

        await waitFor(() => {
            const overflowContainer = container.querySelector(
                '[data-name="overflow-list"]',
            )
            expect(overflowContainer).toBeInTheDocument()
            expect(overflowContainer?.children).toHaveLength(0)
        })
    })
})
