import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import CustomFieldInput from 'custom-fields/components/CustomFieldInput'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {useUpdateOrDeleteCustomerFieldValue} from 'custom-fields/hooks/queries/useUpdateOrDeleteCustomerFieldValue'
import {
    customerDropdownFieldDefinition,
    customerInputFieldDefinition,
    customerNumberFieldDefinition,
} from 'fixtures/customField'
import {assumeMock, getLastMockCall} from 'utils/testing'

import CustomerField from '../CustomerField'

jest.mock(
    'custom-fields/hooks/queries/useUpdateOrDeleteCustomerFieldValue',
    () => {
        return {
            useUpdateOrDeleteCustomerFieldValue: jest.fn(),
        }
    }
)
jest.mock('custom-fields/components/CustomFieldInput', () => {
    return jest.fn(({id}: {id: string}) => <div id={id}>CustomFieldInput</div>)
})

const mockedUsedUpdateOrDeleteCustomerFieldValue = assumeMock(
    useUpdateOrDeleteCustomerFieldValue
)
const mockedCustomFieldInput = assumeMock(CustomFieldInput)

describe('CustomerField', () => {
    const mockedMutate = jest.fn()
    const defaultProps = {
        field: customerInputFieldDefinition,
        value: 'whatever',
        customerId: 1,
    }
    beforeEach(() => {
        mockedUsedUpdateOrDeleteCustomerFieldValue.mockReturnValue({
            mutate: mockedMutate,
        })
    })

    it('should render a label', () => {
        render(<CustomerField {...defaultProps} />)

        expect(
            screen.getByText(new RegExp(defaultProps.field.label))
        ).toBeInTheDocument()
    })

    it('should render a tooltip with value if it’s equal or above MIN_CHARACATERS_TO_TOOLTIP', async () => {
        render(
            <CustomerField
                {...defaultProps}
                value="I am clearly above the threshold"
            />
        )

        const input = screen.getByText('CustomFieldInput')
        userEvent.hover(input)
        await waitFor(() => {
            expect(screen.getByText(/I am clearly above/)).toBeInTheDocument()
        })
    })

    it('should not render a tooltip if the value has lesser length that MIN_CHARACATERS_TO_TOOLTIP', () => {
        render(<CustomerField {...defaultProps} value={'MMMMMMMM'} />)

        const input = screen.getByText('CustomFieldInput')
        userEvent.hover(input)

        expect(screen.queryByText(/MMMMMMMM/)).not.toBeInTheDocument()
    })

    it('should pass the correct props to CustomFieldInput', () => {
        render(<CustomerField {...defaultProps} />)

        expect(mockedCustomFieldInput).toHaveBeenCalledWith(
            expect.objectContaining({
                id: `customer-${defaultProps.customerId}-custom-field-value-input-${defaultProps.field.id}`,
                field: defaultProps.field,
                value: defaultProps.value,
            }),
            {}
        )
    })

    it("should not call the mutation onBlur if the value hasn't changed from the passed one", () => {
        render(<CustomerField {...defaultProps} />)

        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onBlur!()
        })

        expect(mockedMutate).not.toHaveBeenCalled()

        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onChange('nope')
        })
        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onChange(
                defaultProps.value
            )
        })
        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onBlur!()
        })

        expect(mockedMutate).not.toHaveBeenCalled()
    })

    it("should not call the mutation when CustomFieldInput's onBlur is called with a new value that is equal to the newly passed one through the props", () => {
        const {rerender} = render(<CustomerField {...defaultProps} />)

        rerender(<CustomerField {...defaultProps} value="new value" />)

        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onChange('new value')
        })
        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onBlur!()
        })

        expect(mockedMutate).not.toHaveBeenCalled()
    })

    it("should call the mutation when CustomFieldInput's onBlur is called with something else than a dropdown input type", () => {
        render(
            <CustomerField
                {...defaultProps}
                field={customerNumberFieldDefinition}
            />
        )

        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onChange(2)
        })
        expect(mockedMutate).not.toHaveBeenCalled()
        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onBlur!()
        })

        expect(mockedMutate).toHaveBeenCalledWith([
            {
                fieldType: OBJECT_TYPES.CUSTOMER,
                holderId: defaultProps.customerId,
                fieldId: customerNumberFieldDefinition.id,
                value: 2,
            },
        ])
    })

    it("should call the mutation with trimmed value when CustomFieldInput's onBlur is called with an text input type", () => {
        render(<CustomerField {...defaultProps} />)

        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onChange('new value ')
        })
        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onBlur!()
        })

        expect(mockedMutate).toHaveBeenCalledWith([
            {
                fieldType: OBJECT_TYPES.CUSTOMER,
                holderId: defaultProps.customerId,
                fieldId: defaultProps.field.id,
                value: 'new value',
            },
        ])
    })

    it('should not call the mutation when an undefined text input type is blurred with an empty value', () => {
        render(<CustomerField {...defaultProps} value={undefined} />)

        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onChange('')
        })
        act(() => {
            getLastMockCall(mockedCustomFieldInput)[0].onBlur!()
        })

        expect(mockedMutate).not.toHaveBeenCalled()
    })

    describe('dropdown input type', () => {
        it("should call the mutation with the new value when CustomFieldInput's onChange is called", () => {
            render(
                <CustomerField
                    {...defaultProps}
                    field={customerDropdownFieldDefinition}
                />
            )

            act(() => {
                getLastMockCall(mockedCustomFieldInput)[0].onChange('new value')
            })

            expect(mockedMutate).toHaveBeenCalledWith([
                {
                    fieldType: OBJECT_TYPES.CUSTOMER,
                    holderId: defaultProps.customerId,
                    fieldId: customerDropdownFieldDefinition.id,
                    value: 'new value',
                },
            ])
        })

        it('should not call the mutation when queryValue of input type changes', () => {
            const {rerender} = render(
                <CustomerField
                    {...defaultProps}
                    field={customerDropdownFieldDefinition}
                />
            )

            rerender(
                <CustomerField
                    {...defaultProps}
                    field={customerDropdownFieldDefinition}
                    value="new value"
                />
            )

            expect(mockedMutate).not.toHaveBeenCalled()
        })

        it('should should the tooltip even after a change', async () => {
            render(
                <CustomerField
                    {...defaultProps}
                    field={customerDropdownFieldDefinition}
                />
            )

            act(() => {
                getLastMockCall(mockedCustomFieldInput)[0].onChange('new value')
            })

            const input = screen.getByText('CustomFieldInput')
            userEvent.hover(input)

            await waitFor(() => {
                expect(screen.getByText(/new value/)).toBeInTheDocument()
            })
        })
    })
})
