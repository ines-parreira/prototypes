import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { describe, expect, it } from 'vitest'

import {
    mockCustomerCustomField,
    mockCustomerCustomFieldWithValue,
    mockCustomField,
    mockDeleteCustomerCustomFieldValueHandler,
    mockDropdownInputSettingsSettings,
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
    mockTextDataTypeDefinition,
    mockTextInputSettings,
    mockUpdateCustomerCustomFieldValueHandler,
} from '@gorgias/helpdesk-mocks'
import {
    DropdownInputSettingsSettingsInputType,
    InputSettingsTextInputType,
    ObjectType,
} from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { CustomCustomerField } from '../CustomCustomerField'

const customerId = 123

const mockListCustomerCustomFieldsValues =
    mockListCustomerCustomFieldsValuesHandler(async () => {
        return HttpResponse.json(
            mockListCustomerCustomFieldsValuesResponse({
                data: [],
            }),
        )
    })

const mockUpdateCustomerCustomFieldValue =
    mockUpdateCustomerCustomFieldValueHandler(async () => {
        return HttpResponse.json(
            mockCustomerCustomFieldWithValue({
                value: 'Acme Corp',
            }),
        )
    })

const mockDeleteCustomerCustomFieldValue =
    mockDeleteCustomerCustomFieldValueHandler(async () => {
        return new HttpResponse(null, { status: 204 })
    })

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        mockListCustomerCustomFieldsValues.handler,
        mockUpdateCustomerCustomFieldValue.handler,
        mockDeleteCustomerCustomFieldValue.handler,
    )
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const textField = mockCustomField({
    id: 1,
    label: 'Company',
    object_type: ObjectType.Customer,
    definition: mockTextDataTypeDefinition({
        input_settings: mockTextInputSettings({
            input_type: InputSettingsTextInputType.Input,
            placeholder: undefined,
        }),
    }),
})

const dropdownField = mockCustomField({
    id: 2,
    label: 'Status',
    object_type: ObjectType.Customer,
    definition: mockTextDataTypeDefinition({
        input_settings: mockDropdownInputSettingsSettings({
            input_type: DropdownInputSettingsSettingsInputType.Dropdown,
            choices: ['active', 'inactive'],
        }),
    }),
})

describe('CustomCustomerField', () => {
    describe('text field onChange', () => {
        it('should update displayed value when external value changes', async () => {
            const { rerender } = render(
                <CustomCustomerField
                    field={textField}
                    value="Initial Value"
                    customerId={customerId}
                />,
            )

            await screen.findByDisplayValue('Initial Value')

            act(() => {
                rerender(
                    <CustomCustomerField
                        field={textField}
                        value="Updated Externally"
                        customerId={customerId}
                    />,
                )
            })

            await screen.findByDisplayValue('Updated Externally')
        })

        it('should trim whitespace and call mutation', async () => {
            const waitForUpdateRequest =
                mockUpdateCustomerCustomFieldValue.waitForRequest(server)

            const { user } = render(
                <CustomCustomerField
                    field={textField}
                    value={undefined}
                    customerId={customerId}
                />,
            )

            const input = await screen.findByPlaceholderText('+ Add')

            await act(async () => {
                await user.type(input, '  Acme Corp  ')
                input.blur()
            })

            await waitForUpdateRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.pathname).toContain(`/customers/${customerId}`)
                expect(url.pathname).toContain(`/custom-fields/${textField.id}`)

                const body = await request.text()
                expect(body).toBe('"Acme Corp"')
            })
        })

        it('should delete field value when cleared', async () => {
            const { handler: listHandler } =
                mockListCustomerCustomFieldsValuesHandler(async () => {
                    return HttpResponse.json(
                        mockListCustomerCustomFieldsValuesResponse({
                            data: [
                                mockCustomerCustomFieldWithValue({
                                    field: mockCustomerCustomField({
                                        id: textField.id,
                                        label: textField.label,
                                    }),
                                    value: 'Initial Value',
                                }),
                            ],
                        }),
                    )
                })
            server.use(listHandler)

            const waitForDeleteRequest =
                mockDeleteCustomerCustomFieldValue.waitForRequest(server)

            const { user } = render(
                <CustomCustomerField
                    field={textField}
                    value="Initial Value"
                    customerId={customerId}
                />,
            )

            const input = await waitFor(() =>
                screen.getByDisplayValue('Initial Value'),
            )

            await act(async () => {
                await user.clear(input)
                input.blur()
            })

            await waitForDeleteRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.pathname).toContain(`/customers/${customerId}`)
                expect(url.pathname).toContain(`/custom-fields/${textField.id}`)
                expect(request.method).toBe('DELETE')
            })
        })
    })

    describe('number field onChange', () => {
        // Number input onChange is not firing properly on clear/blur so tests will be added later
        it('should call mutation')
    })

    describe('dropdown field onChange', () => {
        it('should pass value directly and call mutation', async () => {
            const waitForUpdateRequest =
                mockUpdateCustomerCustomFieldValue.waitForRequest(server)

            const { user } = render(
                <CustomCustomerField
                    field={dropdownField}
                    value={undefined}
                    customerId={customerId}
                />,
            )

            const inputs = await screen.findAllByPlaceholderText('+ Add')
            const input = inputs[0]

            await act(async () => {
                await user.click(input)
            })

            const activeOptions = await screen.findAllByText('active')

            await act(async () => {
                await user.click(activeOptions[activeOptions.length - 1])
            })

            await waitForUpdateRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.pathname).toContain(`/customers/${customerId}`)
                expect(url.pathname).toContain(
                    `/custom-fields/${dropdownField.id}`,
                )

                const body = await request.text()
                expect(body).toBe('"active"')
            })
        })
    })
})
