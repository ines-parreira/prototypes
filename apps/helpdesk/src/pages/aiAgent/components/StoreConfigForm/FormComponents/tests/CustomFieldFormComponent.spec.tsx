import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, within } from '@testing-library/react'

import type { CustomFieldCondition } from '@gorgias/helpdesk-queries'
import { RequirementType } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import type { Props } from '../CustomFieldsFormComponent'
import { CustomFieldsFormComponent } from '../CustomFieldsFormComponent'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('custom-fields/hooks/queries/useCustomFieldConditions')

jest.mock('@repo/logging')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

const queryClient = mockQueryClient()

describe('CustomFieldsFormComponent', () => {
    const updateValueMock = jest.fn()
    const useCustomFieldDefinitionsMock = jest.mocked(useCustomFieldDefinitions)
    const useCustomFieldConditionsMock = jest.mocked(useCustomFieldConditions)
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
                        managed_type: null,
                        requirement_type: RequirementType.Visible,
                        object_type: OBJECT_TYPES.TICKET,
                    },
                    {
                        id: 2,
                        label: 'WISMO',
                        required: true,
                        managed_type: null,
                        requirement_type: RequirementType.Visible,
                        object_type: OBJECT_TYPES.TICKET,
                    },
                    {
                        id: 3,
                        label: 'Shipping',
                        required: false,
                        managed_type: null,
                        requirement_type: RequirementType.Visible,
                        object_type: OBJECT_TYPES.TICKET,
                    },
                ] as CustomField[],
            },
        })

        useCustomFieldConditionsMock.mockReturnValue({
            customFieldConditions: [] as CustomFieldCondition[],
            isLoading: false,
            isError: false,
        })

        test('Should automatically render store configuration stored custom fields', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent {...mockProps} />,
                </QueryClientProvider>,
            )

            const inputs = within(container).getAllByTestId(
                'custom-field-disabled-input',
            )

            expect(inputs.length).toEqual(1)
            expect(inputs[0]).toHaveValue('Returns')
        })
        test('Each store configuration custom field can be delete through the delete button next to it', () => {
            const { container, queryByTestId, rerender } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent {...mockProps} />,
                </QueryClientProvider>,
            )

            const deleteButton = within(container).getByTestId(
                'custom-field-disabled-input-delete-button',
            )
            fireEvent.click(deleteButton)

            expect(updateValueMock).toHaveBeenNthCalledWith(
                1,
                'customFieldIds',
                [],
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent
                        {...mockProps}
                        customFieldIds={[]}
                    />
                    ,
                </QueryClientProvider>,
            )

            expect(
                queryByTestId('custom-fields-disabled-input-container'),
            ).not.toBeInTheDocument()
        })
        test('Non currently stored custom fields but that are required should be auto selected on store creation', () => {
            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent
                        {...mockProps}
                        isStoreCreated={false}
                    />
                    ,
                </QueryClientProvider>,
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
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent {...mockProps} />,
                </QueryClientProvider>,
            )

            expect(
                within(container).getByText('Add Ticket Field'),
            ).toBeInTheDocument()
        })
        test('The search placeholder should be "Search Ticket Fields"', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent {...mockProps} />,
                </QueryClientProvider>,
            )

            const dropDownButton =
                within(container).getByText('Add Ticket Field')

            fireEvent.click(dropDownButton)

            expect(
                within(container).getByPlaceholderText('Search Ticket Fields'),
            ).toBeInTheDocument()
        })
        test('The select filter should not show selected count', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent
                        {...mockProps}
                        customFieldIds={[1, 3]}
                    />
                    ,
                </QueryClientProvider>,
            )

            expect(
                within(container).getByText('Add Ticket Field'),
            ).toBeInTheDocument()

            expect(
                within(container).queryByText(/\d+ Ticket Field/),
            ).not.toBeInTheDocument()
        })

        describe('On close', () => {
            test('Selected fields should be appended to the store configuration custom fields', () => {
                const { container } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <CustomFieldsFormComponent {...mockProps} />,
                    </QueryClientProvider>,
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
                const { container } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <CustomFieldsFormComponent {...mockProps} />,
                    </QueryClientProvider>,
                )

                expect(within(container).queryByLabelText('Returns')).toBeNull()
            })
        })
        describe('All selectable custom fields have been checked', () => {
            test('The add button should be disabled', () => {
                const { container } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <CustomFieldsFormComponent
                            {...mockProps}
                            customFieldIds={[1, 2, 3]}
                        />
                        ,
                    </QueryClientProvider>,
                )

                expect(
                    within(container).getByRole('button', {
                        name: 'Add Ticket Field',
                    }),
                ).toBeDisabled()
            })
        })
        describe('Custom field removal with conditions', () => {
            test('If a conditional custom field depends on another one that is removed, all should be removed', () => {
                useCustomFieldDefinitionsMock.mockReturnValue({
                    // @ts-expect-error We do not care about other properties for those tests
                    data: {
                        data: [
                            {
                                id: 1,
                                label: 'Returns',
                                required: false,
                                managed_type: null,
                                requirement_type: RequirementType.Visible,
                                object_type: OBJECT_TYPES.TICKET,
                            },
                            {
                                id: 2,
                                label: 'WISMO',
                                required: true,
                                managed_type: null,
                                requirement_type: RequirementType.Conditional,
                                object_type: OBJECT_TYPES.TICKET,
                            },
                        ] as CustomField[],
                    },
                })
                useCustomFieldConditionsMock.mockReturnValue({
                    customFieldConditions: [
                        {
                            id: 1,
                            expression: [
                                {
                                    field: 1,
                                    field_source: 'Ticket',
                                    operator: 'is',
                                    values: ['test'],
                                },
                            ],
                            requirements: [
                                {
                                    field_id: 2,
                                    type: 'visible',
                                },
                            ],
                        },
                    ] as CustomFieldCondition[],
                    isLoading: false,
                    isError: false,
                })
                const { getAllByTestId } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <CustomFieldsFormComponent
                            {...mockProps}
                            customFieldIds={[1, 2]}
                        />
                        ,
                    </QueryClientProvider>,
                )

                const button = getAllByTestId(
                    'custom-field-disabled-input-delete-button',
                )[0]

                fireEvent.click(button)

                expect(updateValueMock).toHaveBeenNthCalledWith(
                    1,
                    'customFieldIds',
                    [],
                )
            })
        })
    })
    describe('Error while fetching account custom fields', () => {
        test('it should not display anything if a fetching error happened', () => {
            // @ts-expect-error not trying to mock the entire error format
            useCustomFieldDefinitionsMock.mockReturnValue({
                error: 'Something bad happened',
            })
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <CustomFieldsFormComponent
                        {...mockProps}
                        customFieldIds={[1, 2, 3]}
                    />
                </QueryClientProvider>,
            )

            expect(container.innerHTML).toEqual('')
        })
    })
})
