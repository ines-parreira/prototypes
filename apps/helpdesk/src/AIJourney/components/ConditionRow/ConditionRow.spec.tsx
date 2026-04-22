import { useFormContext, useWatch } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ConditionsSchema, SelectOption } from '../../types/conditionField'
import { ConditionRow } from './ConditionRow'

const captured = {
    fieldSelectOnChange: undefined as
        | ((item: SelectOption | null | undefined) => void)
        | undefined,
    inlineSelectOnSelect: undefined as ((id: string) => void) | undefined,
    valueInputOnChange: undefined as
        | ((val: string | number | null) => void)
        | undefined,
    whereFieldOnSelect: undefined as ((id: string) => void) | undefined,
    whereFieldItems: undefined as { id: string; label: string }[] | undefined,
    whereOperatorOnSelect: undefined as ((id: string) => void) | undefined,
    whereValueOnChange: undefined as
        | ((val: string | number | null) => void)
        | undefined,
    purchaseDateOnSelect: undefined as ((id: string) => void) | undefined,
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
    Text: ({ children }: any) => <span>{children}</span>,
    Icon: ({ name }: any) => <span>{name}</span>,
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
    ConditionInlineSelect: ({ onSelect, ariaLabel, items }: any) => {
        if (ariaLabel === 'operator') captured.inlineSelectOnSelect = onSelect
        if (ariaLabel === 'Where field') {
            captured.whereFieldOnSelect = onSelect
            captured.whereFieldItems = items
        }
        if (ariaLabel === 'Where operator')
            captured.whereOperatorOnSelect = onSelect
        if (ariaLabel === 'Purchase date period')
            captured.purchaseDateOnSelect = onSelect
        return <div>{ariaLabel}-select</div>
    },
}))

const valueInputRenderCount = { count: 0 }

jest.mock('../ConditionValueInput/ConditionValueInput', () => ({
    ConditionValueInput: ({ onChange }: any) => {
        valueInputRenderCount.count++
        if (valueInputRenderCount.count === 1) {
            captured.valueInputOnChange = onChange
            return <div>value-input</div>
        }
        captured.whereValueOnChange = onChange
        return <div>where-value-input</div>
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
        orders: {
            fields: {
                status: { type: 'string', operators: ['eq', 'neq'] },
                purchase_date: {
                    type: 'datetime',
                    operators: ['gt', 'gte', 'lt', 'lte', 'isEmpty'],
                },
            },
            aggregates: {
                count: {
                    type: 'number',
                    operators: ['eq', 'gt'],
                    supports_where: true,
                },
            },
        },
        last_order: {
            fields: {
                product_variant_names: {
                    type: 'array_string',
                    operators: ['eq', 'containsAny'],
                },
                product_tags: {
                    type: 'array_string',
                    operators: ['containsAny'],
                },
                product_collection_ids: {
                    type: 'array_string',
                    operators: ['containsAny'],
                },
            },
            aggregates: {},
        },
        last_cart: {
            fields: {
                product_variant_names: {
                    type: 'array_string',
                    operators: ['eq', 'containsAny'],
                },
                product_tags: {
                    type: 'array_string',
                    operators: ['containsAny'],
                },
                product_collection_ids: {
                    type: 'array_string',
                    operators: ['containsAny'],
                },
            },
            aggregates: {},
        },
    },
}

const whereClauseFixture = {
    field: 'status',
    operator: 'eq',
    value: null,
} as const

const renderComponent = () =>
    render(
        <ConditionRow index={0} schema={mockSchema} onRemove={mockOnRemove} />,
    )

describe('<ConditionRow />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        valueInputRenderCount.count = 0
        captured.fieldSelectOnChange = undefined
        captured.inlineSelectOnSelect = undefined
        captured.valueInputOnChange = undefined
        captured.whereFieldOnSelect = undefined
        captured.whereFieldItems = undefined
        captured.whereOperatorOnSelect = undefined
        captured.whereValueOnChange = undefined
        captured.purchaseDateOnSelect = undefined
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

            expect(mockSetValue).toHaveBeenCalledTimes(8)
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
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.purchaseDateClause',
                null,
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isWhereVisible',
                false,
            )
        })

        it('should set whereClause and default purchaseDateClause to isNotEmpty when selecting an aggregate field with supports_where', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'orders:aggregate:count',
                label: 'Number of orders',
            })

            expect(mockSetValue).toHaveBeenCalledTimes(8)
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.object',
                'orders',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.field',
                'count',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isAggregate',
                true,
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
                { field: '', operator: '', value: null },
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.purchaseDateClause',
                { operator: 'isNotEmpty', value: null },
            )
        })

        it('should default whereClause to the first allowlisted field when the schema has allowlisted fields', () => {
            const schemaWithAllowlistedFields: ConditionsSchema = {
                operators: mockSchema.operators,
                objects: {
                    orders: {
                        fields: {
                            product_variant_names: {
                                type: 'string',
                                operators: ['containsAny'],
                            },
                            product_tags: {
                                type: 'string',
                                operators: ['containsAny'],
                            },
                        },
                        aggregates: {
                            count: {
                                type: 'number',
                                operators: ['eq', 'gt'],
                                supports_where: true,
                            },
                        },
                    },
                },
            }
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithAllowlistedFields}
                    onRemove={mockOnRemove}
                />,
            )

            captured.fieldSelectOnChange?.({
                id: 'orders:aggregate:count',
                label: 'Number of orders',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                {
                    field: 'product_variant_names',
                    operator: 'containsAny',
                    value: null,
                },
            )
        })
    })

    describe('purchase date period selector', () => {
        beforeEach(() => {
            useWatchMock.mockReturnValue([
                'orders',
                'count',
                true,
                'eq',
                null,
                null,
                null,
            ])
        })

        it('should render the purchase date period selector for aggregate fields with purchase_date in schema', () => {
            renderComponent()

            expect(
                screen.getByText('Purchase date period-select'),
            ).toBeInTheDocument()
        })

        it('should not render the purchase date period selector for non-aggregate fields', () => {
            useWatchMock.mockReturnValue([
                'shopper',
                'sms_state',
                false,
                'eq',
                null,
                null,
                null,
            ])
            renderComponent()

            expect(
                screen.queryByText('Purchase date period-select'),
            ).not.toBeInTheDocument()
        })

        it('should set purchaseDateClause with gt operator when a period is selected', () => {
            renderComponent()

            captured.purchaseDateOnSelect?.('30d')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.purchaseDateClause',
                { operator: 'gt', value: '30d' },
            )
        })

        it('should set purchaseDateClause to isNotEmpty when "All time" is selected', () => {
            renderComponent()

            captured.purchaseDateOnSelect?.('all_time')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.purchaseDateClause',
                { operator: 'isNotEmpty', value: null },
            )
        })

        it('should reset purchaseDateClause to null when the condition field changes', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'shopper:field:sms_state',
                label: 'SMS subscription status',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.purchaseDateClause',
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

    describe('where clause section', () => {
        beforeEach(() => {
            mockGetValues.mockReturnValue(whereClauseFixture)
            useWatchMock.mockReturnValue([
                'orders',
                'count',
                true,
                'eq',
                null,
                whereClauseFixture,
                null,
                true,
            ])
        })

        it('should show the where section when isWhereVisible is true', () => {
            renderComponent()

            expect(screen.getByText('where')).toBeInTheDocument()
        })

        it('should show the "Add property" button when isWhereVisible is false', () => {
            useWatchMock.mockReturnValue([
                'orders',
                'count',
                true,
                'eq',
                null,
                whereClauseFixture,
                null,
                false,
            ])
            renderComponent()

            expect(screen.getByText('Add property')).toBeInTheDocument()
        })

        it('should set isWhereVisible to true when "Add property" is clicked', async () => {
            const user = userEvent.setup()
            useWatchMock.mockReturnValue([
                'orders',
                'count',
                true,
                'eq',
                null,
                whereClauseFixture,
                null,
                false,
            ])
            renderComponent()

            await user.click(screen.getByText('Add property'))

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isWhereVisible',
                true,
            )
        })

        it('should set isWhereVisible to false when the close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: 'remove-where-condition' }),
            )

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isWhereVisible',
                false,
            )
        })

        it('should reset whereClause to the first allowlisted field defaults when the close button is clicked', async () => {
            const user = userEvent.setup()
            const schemaWithAllowlistedFields: ConditionsSchema = {
                operators: mockSchema.operators,
                objects: {
                    orders: {
                        fields: {
                            product_variant_names: {
                                type: 'string',
                                operators: ['containsAny'],
                            },
                        },
                        aggregates: {
                            count: {
                                type: 'number',
                                operators: ['eq', 'gt'],
                                supports_where: true,
                            },
                        },
                    },
                },
            }
            const modifiedWhereClause = {
                field: 'product_variant_names',
                operator: 'containsAny',
                value: ['Old T-Shirt'],
            }
            mockGetValues.mockReturnValue(modifiedWhereClause)
            useWatchMock.mockReturnValue([
                'orders',
                'count',
                true,
                'eq',
                null,
                modifiedWhereClause,
                null,
                true,
            ])
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithAllowlistedFields}
                    onRemove={mockOnRemove}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'remove-where-condition' }),
            )

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                {
                    field: 'product_variant_names',
                    operator: 'containsAny',
                    value: null,
                },
            )
        })

        it('should update whereClause when where field is changed', () => {
            renderComponent()

            captured.whereFieldOnSelect?.('status')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                { field: 'status', operator: 'eq', value: null },
            )
        })

        it('should update whereClause operator and keep value for a non-unary operator', () => {
            renderComponent()

            captured.whereOperatorOnSelect?.('neq')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                { field: 'status', operator: 'neq', value: null },
            )
        })

        it('should set whereClause value to null when a unary where operator is selected', () => {
            renderComponent()

            captured.whereOperatorOnSelect?.('isEmpty')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                { field: 'status', operator: 'isEmpty', value: null },
            )
        })

        it('should update whereClause value when where value input changes', () => {
            renderComponent()

            captured.whereValueOnChange?.('some-value')

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                { field: 'status', operator: 'eq', value: 'some-value' },
            )
        })
    })

    describe('whereFieldOptions allowlist filtering', () => {
        const schemaWithMixedWhereFields: ConditionsSchema = {
            operators: mockSchema.operators,
            objects: {
                orders: {
                    fields: {
                        status: { type: 'string', operators: ['eq'] },
                        product_variant_names: {
                            type: 'string',
                            operators: ['containsAny'],
                        },
                        product_tags: {
                            type: 'string',
                            operators: ['containsAny'],
                        },
                    },
                    aggregates: {
                        count: {
                            type: 'number',
                            operators: ['eq', 'gt'],
                            supports_where: true,
                        },
                    },
                },
            },
        }

        const schemaWithAllWhereFields: ConditionsSchema = {
            operators: mockSchema.operators,
            objects: {
                orders: {
                    fields: {
                        product_variant_names: {
                            type: 'string',
                            operators: ['containsAny'],
                        },
                        product_tags: {
                            type: 'string',
                            operators: ['containsAny'],
                        },
                        product_collection_ids: {
                            type: 'string',
                            operators: ['containsAny'],
                        },
                    },
                    aggregates: {
                        count: {
                            type: 'number',
                            operators: ['eq', 'gt'],
                            supports_where: true,
                        },
                    },
                },
            },
        }

        const whereClauseFixtureForAllowlist = {
            field: 'product_variant_names',
            operator: 'containsAny',
            value: null,
        } as const

        beforeEach(() => {
            mockGetValues.mockReturnValue(whereClauseFixtureForAllowlist)
            useWatchMock.mockReturnValue([
                'orders',
                'count',
                true,
                'eq',
                null,
                whereClauseFixtureForAllowlist,
                null,
                true,
            ])
        })

        it('should only include allowlisted fields that exist in the schema', () => {
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithMixedWhereFields}
                    onRemove={mockOnRemove}
                />,
            )

            expect(captured.whereFieldItems).toEqual([
                { id: 'product_variant_names', label: 'Product name' },
                { id: 'product_tags', label: 'Product tag' },
            ])
        })

        it('should exclude schema fields not in the allowlist', () => {
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithMixedWhereFields}
                    onRemove={mockOnRemove}
                />,
            )

            const ids = captured.whereFieldItems?.map((item) => item.id) ?? []
            expect(ids).not.toContain('status')
        })

        it('should exclude allowlisted fields missing from the schema', () => {
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithMixedWhereFields}
                    onRemove={mockOnRemove}
                />,
            )

            const ids = captured.whereFieldItems?.map((item) => item.id) ?? []
            expect(ids).not.toContain('product_collection_ids')
        })

        it('should use friendly labels instead of auto-formatted field names', () => {
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithMixedWhereFields}
                    onRemove={mockOnRemove}
                />,
            )

            const labels =
                captured.whereFieldItems?.map((item) => item.label) ?? []
            expect(labels).toContain('Product name')
            expect(labels).toContain('Product tag')
            expect(labels).not.toContain('Product Variant Names')
            expect(labels).not.toContain('Product Tags')
        })

        it('should include all 3 allowed fields when all exist in the schema', () => {
            render(
                <ConditionRow
                    index={0}
                    schema={schemaWithAllWhereFields}
                    onRemove={mockOnRemove}
                />,
            )

            expect(captured.whereFieldItems).toEqual([
                { id: 'product_variant_names', label: 'Product name' },
                { id: 'product_tags', label: 'Product tag' },
                { id: 'product_collection_ids', label: 'Collection' },
            ])
        })
    })

    describe('existence mode (last_order / last_cart)', () => {
        const existenceWhereClause = {
            field: 'product_variant_names',
            operator: 'eq',
            value: null,
        } as const

        beforeEach(() => {
            useWatchMock.mockReturnValue([
                'last_order',
                'last_order',
                false,
                'isNotEmpty',
                null,
                existenceWhereClause,
                null,
                true,
            ])
        })

        it('should not render the operator dropdown in existence mode', () => {
            renderComponent()

            expect(
                screen.queryByText('operator-select'),
            ).not.toBeInTheDocument()
        })

        it('should render the where clause section in existence mode', () => {
            renderComponent()

            expect(screen.getByText('where')).toBeInTheDocument()
        })

        it('should not render the close button for the where clause in existence mode', () => {
            renderComponent()

            expect(
                screen.queryByRole('button', {
                    name: 'remove-where-condition',
                }),
            ).not.toBeInTheDocument()
        })

        it('should not render the "Add property" button in existence mode', () => {
            renderComponent()

            expect(screen.queryByText('Add property')).not.toBeInTheDocument()
        })

        it('should set all condition parts correctly when an existence field is selected', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'last_order:field:last_order',
                label: 'Last Order',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.object',
                'last_order',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.field',
                'last_order',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isAggregate',
                false,
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.operator',
                'isNotEmpty',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.value',
                null,
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.purchaseDateClause',
                null,
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isWhereVisible',
                true,
            )
        })

        it('should set whereClause to first allowlisted field defaults when an existence field is selected', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'last_order:field:last_order',
                label: 'Last Order',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                {
                    field: 'product_variant_names',
                    operator: 'eq',
                    value: null,
                },
            )
        })

        it('should work for last_cart the same as last_order', () => {
            useWatchMock.mockReturnValue([
                'last_cart',
                'last_cart',
                false,
                'isNotEmpty',
                null,
                existenceWhereClause,
                null,
                true,
            ])
            renderComponent()

            expect(
                screen.queryByText('operator-select'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('where')).toBeInTheDocument()
        })

        it('should set whereClause defaults when selecting last_cart', () => {
            renderComponent()

            captured.fieldSelectOnChange?.({
                id: 'last_cart:field:last_cart',
                label: 'Last Cart',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.object',
                'last_cart',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.field',
                'last_cart',
            )
            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.isWhereVisible',
                true,
            )
        })

        it('should set whereClause with empty defaults when the existence object has no allowlisted fields', () => {
            const schemaNoAllowlisted: ConditionsSchema = {
                operators: mockSchema.operators,
                objects: {
                    orders: { fields: {}, aggregates: {} },
                    last_order: {
                        fields: {
                            some_other: { type: 'string', operators: ['eq'] },
                        },
                        aggregates: {},
                    },
                },
            }
            render(
                <ConditionRow
                    index={0}
                    schema={schemaNoAllowlisted}
                    onRemove={mockOnRemove}
                />,
            )

            captured.fieldSelectOnChange?.({
                id: 'last_order:field:last_order',
                label: 'Last Order',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.whereClause',
                { field: '', operator: '', value: null },
            )
        })
    })

    describe('handleFieldChange — operator fallback', () => {
        it('should default operator to empty string when the selected field has no operators', () => {
            const schemaEmptyOps: ConditionsSchema = {
                operators: mockSchema.operators,
                objects: {
                    shopper: {
                        fields: {
                            no_ops_field: { type: 'string', operators: [] },
                        },
                    },
                },
            }
            render(
                <ConditionRow
                    index={0}
                    schema={schemaEmptyOps}
                    onRemove={mockOnRemove}
                />,
            )

            captured.fieldSelectOnChange?.({
                id: 'shopper:field:no_ops_field',
                label: 'No Ops',
            })

            expect(mockSetValue).toHaveBeenCalledWith(
                'conditions.0.operator',
                '',
            )
        })
    })

    describe('derived values when object is absent from schema', () => {
        it('should not render purchase date selector when object is not in schema', () => {
            useWatchMock.mockReturnValue([
                'unknown_object',
                'count',
                true,
                'gt',
                null,
                null,
                null,
                false,
            ])
            renderComponent()

            expect(
                screen.queryByText('Purchase date period-select'),
            ).not.toBeInTheDocument()
        })
    })
})
