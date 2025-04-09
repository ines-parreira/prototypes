import { fireEvent, render, within } from '@testing-library/react'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { CustomField } from 'custom-fields/types'

import { CustomFieldsFormComponent, Props } from '../CustomFieldsFormComponent'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

jest.mock('utils/errors')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

describe('CustomFieldsFormComponent', () => {
    const updateValueMock = jest.fn()
    const useCustomFieldDefinitionsMock = jest.mocked(useCustomFieldDefinitions)
    const mockProps = {
        isStoreCreated: true,
        customFieldIds: [1],
        updateValue: updateValueMock,
    } as Props

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Store configuration custom fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            // @ts-expect-error We do not care about other properties for those tests
            data: {
                data: [
                    {
                        id: 1,
                        label: 'Returns',
                        required: false,
                    },
                    {
                        id: 2,
                        label: 'WISMO',
                        required: true,
                    },
                    {
                        id: 3,
                        label: 'Shipping',
                        required: false,
                    },
                ] as CustomField[],
            },
        })
        test('Should automatically render store configuration stored custom fields', () => {
            const { container } = render(
                <CustomFieldsFormComponent {...mockProps} />,
            )

            const inputs = within(container).getAllByLabelText(
                'custom-field-disabled-input',
            )

            expect(inputs.length).toEqual(1)
            expect(inputs[0]).toHaveValue('Returns')
        })
        test('Each store configuration custom field can be delete through the delete button next to it', () => {
            const { container, queryByTestId, rerender } = render(
                <CustomFieldsFormComponent {...mockProps} />,
            )

            const deleteButton = within(container).getByLabelText(
                'custom-field-disabled-input-delete-button',
            )
            fireEvent.click(deleteButton)

            expect(updateValueMock).toHaveBeenNthCalledWith(
                1,
                'customFieldIds',
                [],
            )

            rerender(
                <CustomFieldsFormComponent
                    {...mockProps}
                    customFieldIds={[]}
                />,
            )

            expect(
                queryByTestId('custom-fields-disabled-input-container'),
            ).not.toBeInTheDocument()
        })
        test('Non currently stored custom fields but that are required should be auto selected on store creation', () => {
            render(
                <CustomFieldsFormComponent
                    {...mockProps}
                    isStoreCreated={false}
                />,
            )

            expect(updateValueMock).toHaveBeenNthCalledWith(
                1,
                'customFieldIds',
                [1, 2],
            )
        })
    })
    describe('Select filter', () => {
        test('The select filter component is rendered with "Add Ticket Fields" as its title"', () => {
            const { container } = render(
                <CustomFieldsFormComponent {...mockProps} />,
            )

            expect(
                within(container).getByText('Add Ticket Field'),
            ).toBeInTheDocument()
        })
        test('The search placeholder should be "Search Ticket Fields"', () => {
            const { container } = render(
                <CustomFieldsFormComponent {...mockProps} />,
            )

            const dropDownButton =
                within(container).getByText('Add Ticket Field')

            fireEvent.click(dropDownButton)

            expect(
                within(container).getByPlaceholderText(
                    'Search Ticket Fields...',
                ),
            ).toBeInTheDocument()
        })

        describe('On close', () => {
            test('Selected fields should be appended to the store configuration custom fields', () => {
                const { container } = render(
                    <CustomFieldsFormComponent {...mockProps} />,
                )

                const toggleButton =
                    within(container).getByText('Add Ticket Field')
                fireEvent.click(toggleButton)

                const shippingCheckBox =
                    within(container).getByLabelText('Shipping')
                fireEvent.click(shippingCheckBox)

                fireEvent.mouseDown(document.body)
                fireEvent.click(document.body)

                expect(updateValueMock).toHaveBeenNthCalledWith(
                    1,
                    'customFieldIds',
                    [1, 3],
                )
            })
            test('Selected fields should not re-appear in available selectable custom fields', () => {
                const { container } = render(
                    <CustomFieldsFormComponent {...mockProps} />,
                )

                expect(within(container).queryByLabelText('Returns')).toBeNull()
            })
        })
        describe('All selectable custom fields have been checked', () => {
            test('The add button should be disabled', () => {
                const { container } = render(
                    <CustomFieldsFormComponent
                        {...mockProps}
                        customFieldIds={[1, 2, 3]}
                    />,
                )

                expect(
                    within(container).getByRole('button', {
                        name: 'Add Ticket Field',
                    }),
                ).toBeDisabled()
            })
        })
    })
    describe('Error while fetching account custom fields', () => {
        test('it should not display anything if a fetching error happened', () => {
            // @ts-expect-error not trying to mock the entire error format
            useCustomFieldDefinitionsMock.mockReturnValue({
                error: 'Something bad happened',
            })
            const { container } = render(
                <CustomFieldsFormComponent
                    {...mockProps}
                    customFieldIds={[1, 2, 3]}
                />,
            )

            expect(container.innerHTML).toEqual('')
        })
    })
})
