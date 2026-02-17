import { act, screen, waitFor } from '@testing-library/react'

import { OverflowList } from '@gorgias/axiom'
import {
    InputSettingsNumberInputType,
    InputSettingsTextInputType,
    NumberDataTypeDefinitionDataType,
    TextDataTypeDefinitionDataType,
} from '@gorgias/helpdesk-types'

import { render } from '../../../../../tests/render.utils'
import type { VisibleTicketField } from '../hooks/useFilteredTicketFields'
import { InfobarTicketField } from '../InfobarTicketField'
import { useTicketFieldsStore } from '../store/useTicketFieldsStore'

function TestWrapper({ field }: { field: VisibleTicketField }) {
    const fields = useTicketFieldsStore((state) => state.fields)
    const fieldState = fields[field.fieldDefinition.id]

    const onFieldChange = ({ nextValue }: { nextValue: any }) => {
        useTicketFieldsStore
            .getState()
            .updateFieldValue(field.fieldDefinition.id, nextValue)
    }

    const onFieldBlur = ({ nextValue }: { nextValue: any }) => {
        const trimmedValue =
            typeof nextValue === 'string' ? nextValue.trim() : nextValue
        useTicketFieldsStore
            .getState()
            .updateFieldValue(field.fieldDefinition.id, trimmedValue)
    }

    return (
        <OverflowList nonExpandedLineCount={5}>
            <InfobarTicketField
                field={field}
                fieldState={fieldState}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
            />
        </OverflowList>
    )
}

const renderWithOverflowList = (field: VisibleTicketField) => {
    return render(<TestWrapper field={field} />)
}

describe('InfobarTicketField', () => {
    beforeEach(() => {
        useTicketFieldsStore.getState().resetFields()
        vi.clearAllMocks()
    })

    describe('Text input field', () => {
        const textField: VisibleTicketField = {
            fieldDefinition: {
                id: 1,
                label: 'Issue Type',
                object_type: 'ticket',
                definition: {
                    data_type: TextDataTypeDefinitionDataType.Text,
                    input_settings: {
                        input_type: InputSettingsTextInputType.Input,
                        placeholder: 'Enter issue type',
                    },
                },
            } as any,
            isRequired: false,
        }

        it('should render text field with label', () => {
            useTicketFieldsStore.getState().updateFieldState({
                id: 1,
                value: undefined,
            })

            renderWithOverflowList(textField)

            expect(screen.getByText('Issue Type')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Enter issue type'),
            ).toBeInTheDocument()
        })

        it('should display existing value from store', () => {
            useTicketFieldsStore.getState().updateFieldValue(1, 'Bug')

            renderWithOverflowList(textField)

            const input = screen.getByPlaceholderText(
                'Enter issue type',
            ) as HTMLInputElement
            expect(input.value).toBe('Bug')
        })

        it('should update store on blur', async () => {
            useTicketFieldsStore.getState().updateFieldState({
                id: 1,
                value: undefined,
            })

            const { user } = renderWithOverflowList(textField)

            const input = screen.getByPlaceholderText('Enter issue type')

            await act(() => user.click(input))
            await act(() => user.type(input, 'Feature Request'))
            await act(() => user.tab())

            await waitFor(() => {
                const storeValue =
                    useTicketFieldsStore.getState().fields[1]?.value
                expect(storeValue).toBe('Feature Request')
            })
        })

        it('should show required indicator when field is required', () => {
            const requiredField = { ...textField, isRequired: true }

            useTicketFieldsStore.getState().updateFieldState({
                id: 1,
                value: undefined,
            })

            renderWithOverflowList(requiredField)

            expect(screen.getByText('Issue Type')).toBeInTheDocument()
        })
    })

    describe('Number input field', () => {
        const numberField: VisibleTicketField = {
            fieldDefinition: {
                id: 2,
                label: 'Priority Level',
                object_type: 'ticket',
                definition: {
                    data_type: NumberDataTypeDefinitionDataType.Number,
                    input_settings: {
                        input_type: InputSettingsNumberInputType.InputNumber,
                        min: 1,
                        max: 1000000000,
                        placeholder: 'Enter priority',
                    },
                },
            } as any,
            isRequired: false,
        }

        it('should render number field with label', () => {
            useTicketFieldsStore.getState().updateFieldState({
                id: 2,
                value: undefined,
            })

            renderWithOverflowList(numberField)

            expect(screen.getByText('Priority Level')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Enter priority'),
            ).toBeInTheDocument()
        })

        it('should display existing numeric value from store without grouping separators', () => {
            useTicketFieldsStore.getState().updateFieldValue(2, 100000123)

            renderWithOverflowList(numberField)

            const input = screen.getByPlaceholderText(
                'Enter priority',
            ) as HTMLInputElement
            expect(input.value).toBe('100000123')
            expect(
                screen.queryByDisplayValue('100,000,123'),
            ).not.toBeInTheDocument()
        })

        it('should update store on change (number fields save immediately)', async () => {
            useTicketFieldsStore.getState().updateFieldState({
                id: 2,
                value: undefined,
            })

            const { user } = renderWithOverflowList(numberField)

            const input = screen.getByPlaceholderText('Enter priority')

            await act(() => user.click(input))
            await act(() => user.clear(input))
            await act(() => user.type(input, '7'))
            await act(() => user.tab())

            await waitFor(() => {
                const storeValue =
                    useTicketFieldsStore.getState().fields[2]?.value
                expect(storeValue).toBe(7)
            })
        })
    })

    describe('Empty value handling', () => {
        const textField: VisibleTicketField = {
            fieldDefinition: {
                id: 3,
                label: 'Notes',
                object_type: 'ticket',
                definition: {
                    data_type: TextDataTypeDefinitionDataType.Text,
                    input_settings: {
                        input_type: InputSettingsTextInputType.Input,
                        placeholder: 'Add notes',
                    },
                },
            } as any,
            isRequired: false,
        }

        it('should trim whitespace on blur', async () => {
            useTicketFieldsStore.getState().updateFieldState({
                id: 3,
                value: undefined,
            })

            const { user } = renderWithOverflowList(textField)

            const input = screen.getByPlaceholderText('Add notes')

            await act(() => user.click(input))
            await act(() => user.type(input, '  whitespace test  '))
            await act(() => user.tab())

            await waitFor(() => {
                const storeValue =
                    useTicketFieldsStore.getState().fields[3]?.value
                expect(storeValue).toBe('whitespace test')
            })
        })
    })
})
