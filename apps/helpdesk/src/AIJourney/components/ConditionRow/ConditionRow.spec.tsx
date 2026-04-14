import { useFormContext, useWatch } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ConditionsSchema, SelectOption } from '../../types/conditionField'
import { ConditionRow } from './ConditionRow'

// Capture callbacks from mocked components so tests can trigger them directly.
// These are assigned when the component renders, at which point the module is
// fully initialized and the object reference is valid.
const captured = {
    fieldSelectOnChange: undefined as
        | ((item: SelectOption | null | undefined) => void)
        | undefined,
    inlineSelectOnSelect: undefined as ((id: string) => void) | undefined,
    valueInputOnChange: undefined as
        | ((val: string | number | null) => void)
        | undefined,
}

jest.mock('@repo/forms', () => ({
    ...jest.requireActual('@repo/forms'),
    useFormContext: jest.fn(),
    useWatch: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Box: ({ children }: any) => <div>{children}</div>,
    Button: ({ onClick, 'aria-label': ariaLabel }: any) => (
        <button aria-label={ariaLabel} onClick={onClick} />
    ),
    ListItem: ({ label }: any) => <span>{label}</span>,
    ListSection: ({ children, items }: any) => (
        <div>{items?.map((item: any) => children(item))}</div>
    ),
    SelectField: ({ onChange, 'aria-label': ariaLabel }: any) => {
        captured.fieldSelectOnChange = onChange
        return <div aria-label={ariaLabel} />
    },
}))

jest.mock('../ConditionInlineSelect/ConditionInlineSelect', () => ({
    ConditionInlineSelect: ({ onSelect }: any) => {
        captured.inlineSelectOnSelect = onSelect
        return <div>operator-select</div>
    },
}))

jest.mock('../ConditionValueInput/ConditionValueInput', () => ({
    ConditionValueInput: ({ onChange }: any) => {
        captured.valueInputOnChange = onChange
        return <div>value-input</div>
    },
}))

const mockSetValue = jest.fn()
const mockGetValues = jest.fn().mockReturnValue(null)
const mockOnRemove = jest.fn()

const useFormContextMock = assumeMock(useFormContext)
const useWatchMock = assumeMock(useWatch)

const mockSchema: ConditionsSchema = {
    operators: {
        comparison: ['eq', 'neq'],
        set: ['containsAny', 'notContainsAny'],
        unary: ['isEmpty'],
    },
    objects: {
        shopper: {
            fields: {
                sms_state: { type: 'string', operators: ['eq', 'neq'] },
                name: { type: 'string', operators: ['eq'] },
                address_state_code: {
                    type: 'string',
                    operators: ['eq', 'neq', 'containsAny', 'notContainsAny'],
                },
            },
        },
    },
}

const renderComponent = () =>
    render(
        <ConditionRow index={0} schema={mockSchema} onRemove={mockOnRemove} />,
    )

describe('<ConditionRow />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        captured.fieldSelectOnChange = undefined
        captured.inlineSelectOnSelect = undefined
        captured.valueInputOnChange = undefined
        useFormContextMock.mockReturnValue({
            setValue: mockSetValue,
            getValues: mockGetValues,
        } as unknown as ReturnType<typeof useFormContextMock>)
        useWatchMock.mockReturnValue([null, null, false, '', null])
    })

    it('should render the Remove condition button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Remove condition' }),
        ).toBeInTheDocument()
    })

    it('should call onRemove when the Remove condition button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('button', { name: 'Remove condition' }),
        )

        expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    describe('field selection visibility', () => {
        it('should not render operator or value inputs when no field is selected', () => {
            renderComponent()

            expect(
                screen.queryByText('operator-select'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('value-input')).not.toBeInTheDocument()
        })

        it('should render operator and value inputs when a field is selected', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'sms_state',
                false,
                'eq',
                null,
            ])
            renderComponent()

            expect(screen.getByText('operator-select')).toBeInTheDocument()
            expect(screen.getByText('value-input')).toBeInTheDocument()
        })
    })

    describe('selectValue computation', () => {
        it('should render with a field found in the allowlist sections', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'sms_state',
                false,
                'eq',
                null,
            ])
            renderComponent()

            expect(screen.getByText('operator-select')).toBeInTheDocument()
        })

        it('should fall back to buildSelectId and toLabel when field is not in sections', () => {
            // 'name' is in the schema but not in CONDITION_ALLOWLIST,
            // so .find() returns undefined and the ?? fallback branch runs
            useWatchMock.mockReturnValue(['shopper', 'name', false, 'eq', null])
            renderComponent()

            expect(screen.getByText('operator-select')).toBeInTheDocument()
        })
    })

    describe('handleFieldChange', () => {
        it('should not call setValue when item is null', () => {
            renderComponent()

            captured.fieldSelectOnChange?.(null)

            expect(mockSetValue).not.toHaveBeenCalled()
        })

        it('should not call setValue when item is undefined', () => {
            renderComponent()

            captured.fieldSelectOnChange?.(undefined)

            expect(mockSetValue).not.toHaveBeenCalled()
        })

        it('should not call setValue when the item id cannot be parsed', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({ id: 'invalid', label: 'Invalid' })

            expect(mockSetValue).not.toHaveBeenCalled()
        })

        it('should not call setValue when the field is not found in schema', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'shopper:field:nonexistent',
                label: 'Nonexistent',
            })

            expect(mockSetValue).not.toHaveBeenCalled()
        })

        it('should set all condition parts when a valid field is selected', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'shopper:field:sms_state',
                label: 'SMS subscription status',
            })

            expect(mockSetValue).toHaveBeenCalledTimes(6)
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.object',
                'shopper',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.field',
                'sms_state',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isAggregate',
                false,
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.operator',
                'eq',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                null,
            )
        })
    })

    describe('operator selection', () => {
        beforeEach(() => {
            useWatchMock.mockReturnValue([
                'shopper',
                'sms_state',
                false,
                'eq',
                null,
            ])
        })

        it('should set operator when a non-unary operator is selected', () => {
            renderComponent()

            captured.inlineSelectOnSelect?.('eq')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.operator',
                'eq',
            )
            expect(mockSetValue).not.toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
        })

        it('should set operator and clear value when a unary operator is selected', () => {
            renderComponent()

            captured.inlineSelectOnSelect?.('isEmpty')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.operator',
                'isEmpty',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
        })
    })

    describe('operator selection for address_state_code field', () => {
        it('should reset value when switching from single to multi-select operator', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'address_state_code',
                false,
                'eq',
                'CA',
            ])
            renderComponent()

            captured.inlineSelectOnSelect?.('containsAny')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
        })

        it('should reset value when switching from multi to single-select operator', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'address_state_code',
                false,
                'containsAny',
                ['CA', 'NY'],
            ])
            renderComponent()

            captured.inlineSelectOnSelect?.('eq')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
        })

        it('should not reset value when switching between two single-select operators', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'address_state_code',
                false,
                'eq',
                'CA',
            ])
            renderComponent()

            captured.inlineSelectOnSelect?.('neq')

            expect(mockSetValue).not.toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
        })

        it('should not reset value when switching between two multi-select operators', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'address_state_code',
                false,
                'containsAny',
                ['CA'],
            ])
            renderComponent()

            captured.inlineSelectOnSelect?.('notContainsAny')

            expect(mockSetValue).not.toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
        })
    })

    it('should not reset value when switching operators for a non-address_state_code field', () => {
        useWatchMock.mockReturnValue([
            'shopper',
            'sms_state',
            false,
            'eq',
            'subscribed',
        ])
        renderComponent()

        captured.inlineSelectOnSelect?.('neq')

        expect(mockSetValue).not.toHaveBeenCalledWith(
            'conditions.0.value',
            null,
        )
    })

    it('should set value when ConditionValueInput onChange is called', () => {
        useWatchMock.mockReturnValue([
            'shopper',
            'sms_state',
            false,
            'eq',
            null,
        ])
        renderComponent()

        captured.valueInputOnChange?.('test-value')

        expect(mockSetValue).toHaveBeenCalledWith(
            'conditions.0.value',
            'test-value',
        )
    })
})
