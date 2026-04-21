import { act, fireEvent, render, screen } from '@testing-library/react'

import type { FieldDef } from '../../types/conditionField'
import { ConditionValueInput } from './ConditionValueInput'

const capturedSelectField = {
    onChange: undefined as ((item: any) => void) | undefined,
}

const capturedMultiSelectField = {
    onChange: undefined as ((items: any[]) => void) | undefined,
}

const capturedInlineSelect = {
    onSelect: undefined as ((id: string) => void) | undefined,
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SelectField: (props: any) => {
        capturedSelectField.onChange = props.onChange
        return (
            <div aria-label={props['aria-label']}>
                {props.value ? (
                    <span>{props.value.label}</span>
                ) : (
                    <span>{props.placeholder}</span>
                )}
                {props.items?.map((section: any) => props.children(section))}
            </div>
        )
    },
    MultiSelectField: (props: any) => {
        capturedMultiSelectField.onChange = props.onChange
        return (
            <div aria-label={props['aria-label']}>
                {props.value?.length > 0 ? (
                    props.value.map((item: any) => (
                        <span key={item.id}>{item.label}</span>
                    ))
                ) : (
                    <span>{props.placeholder}</span>
                )}
                {props.items?.map((item: any) => props.children(item))}
            </div>
        )
    },
    MultiSelectItem: ({ label, id }: any) => <span data-id={id}>{label}</span>,
    TextField: ({
        onChange,
        value,
        'aria-label': ariaLabel,
        placeholder,
        inputMode,
    }: any) => (
        <input
            aria-label={ariaLabel}
            value={value ?? ''}
            placeholder={placeholder}
            inputMode={inputMode}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
    Tooltip: ({ trigger, children }: any) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: any) => <span>{title}</span>,
    ListItem: ({ label }: any) => <span>{label}</span>,
    ListSection: ({ children, items, name }: any) => (
        <div>
            {name && <span>{name}</span>}
            {items?.map((item: any) => children(item))}
        </div>
    ),
}))

jest.mock('../ConditionInlineSelect/ConditionInlineSelect', () => ({
    ConditionInlineSelect: ({ onSelect, selectedId }: any) => {
        capturedInlineSelect.onSelect = onSelect
        return <div aria-label="Value">{selectedId}</div>
    },
}))

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn().mockReturnValue({
        currentIntegration: { id: 42 },
    }),
}))

jest.mock('@repo/customer', () => ({
    useShopifyShopTags: jest
        .fn()
        .mockReturnValue({ data: ['vip', 'wholesale', 'new-customer'] }),
}))

jest.mock('models/ecommerce/queries', () => ({
    useGetEcommerceLookupValues: jest.fn().mockReturnValue({
        data: {
            data: [
                { value: 'sale' },
                { value: 'new-arrival' },
                { value: 'bundle' },
            ],
        },
    }),
    useGetEcommerceProductCollections: jest.fn().mockReturnValue({
        data: {
            data: [
                {
                    external_id: 'gid://shopify/Collection/1',
                    data: { title: 'Summer Sale' },
                },
                {
                    external_id: 'gid://shopify/Collection/2',
                    data: { title: 'New Arrivals' },
                },
                {
                    external_id: 'gid://shopify/Collection/3',
                    data: { title: 'Bundle Deals' },
                },
            ],
        },
    }),
}))

jest.mock('models/integration/queries', () => ({
    useListProducts: jest.fn().mockReturnValue({
        data: {
            pages: [
                {
                    data: {
                        data: [
                            { data: { title: 'Classic T-Shirt' } },
                            { data: { title: 'Running Shoes' } },
                            { data: { title: 'Winter Jacket' } },
                        ],
                    },
                },
            ],
        },
    }),
}))

const mockOnChange = jest.fn()

const stringFieldDef: FieldDef = { type: 'string', operators: ['eq'] }
const numberFieldDef: FieldDef = { type: 'number', operators: ['gt'] }
const datetimeFieldDef: FieldDef = { type: 'datetime', operators: ['eq'] }

describe('<ConditionValueInput />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedSelectField.onChange = undefined
        capturedMultiSelectField.onChange = undefined
        capturedInlineSelect.onSelect = undefined
    })

    it('should render nothing when isUnary is true', () => {
        const { container } = render(
            <ConditionValueInput
                fieldDef={stringFieldDef}
                value={null}
                onChange={mockOnChange}
                isUnary
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    describe('string type (default TextField)', () => {
        it('should render a text input', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    value="hello"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(
                screen.getByRole('textbox', { name: /value/i }),
            ).toBeInTheDocument()
        })

        it('should call onChange with the string value when typed', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    value=""
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            fireEvent.change(screen.getByRole('textbox', { name: /value/i }), {
                target: { value: 'hello' },
            })

            expect(mockOnChange).toHaveBeenCalledWith('hello')
        })

        it('should call onChange with null when the value is cleared', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    value="hello"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            fireEvent.change(screen.getByRole('textbox', { name: /value/i }), {
                target: { value: '' },
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    describe('number type TextField', () => {
        it('should render a numeric input', () => {
            render(
                <ConditionValueInput
                    fieldDef={numberFieldDef}
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(
                screen.getByRole('textbox', { name: /value/i }),
            ).toBeInTheDocument()
        })

        it('should call onChange with a number when a numeric value is entered', () => {
            render(
                <ConditionValueInput
                    fieldDef={numberFieldDef}
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            fireEvent.change(screen.getByRole('textbox', { name: /value/i }), {
                target: { value: '42' },
            })

            expect(mockOnChange).toHaveBeenCalledWith(42)
        })

        it('should call onChange with null when the numeric input is cleared', () => {
            render(
                <ConditionValueInput
                    fieldDef={numberFieldDef}
                    value={42}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            fireEvent.change(screen.getByRole('textbox', { name: /value/i }), {
                target: { value: '' },
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should strip non-digit characters and call onChange with the numeric result', () => {
            render(
                <ConditionValueInput
                    fieldDef={numberFieldDef}
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            fireEvent.change(screen.getByRole('textbox', { name: /value/i }), {
                target: { value: '4abc2' },
            })

            expect(mockOnChange).toHaveBeenCalledWith(42)
        })

        it('should call onChange with null when only non-digit characters are entered', () => {
            render(
                <ConditionValueInput
                    fieldDef={numberFieldDef}
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            fireEvent.change(screen.getByRole('textbox', { name: /value/i }), {
                target: { value: 'abc' },
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    describe('contains operator tooltip', () => {
        it.each(['contains', 'containsAny', 'containsAll', 'notContainsAny'])(
            'should show the comma hint tooltip for "%s" operator',
            (operator) => {
                render(
                    <ConditionValueInput
                        fieldDef={stringFieldDef}
                        value=""
                        onChange={mockOnChange}
                        isUnary={false}
                        operator={operator}
                    />,
                )

                expect(
                    screen.getByText(
                        'Enter multiple values separated by a comma',
                    ),
                ).toBeInTheDocument()
            },
        )

        it('should not show the tooltip for non-contains operators', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    value=""
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="eq"
                />,
            )

            expect(
                screen.queryByText(
                    'Enter multiple values separated by a comma',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('datetime type', () => {
        it('should render ConditionInlineSelect and call onChange when a period is selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={datetimeFieldDef}
                    value="30d"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(capturedInlineSelect.onSelect).toBeDefined()

            act(() => {
                capturedInlineSelect.onSelect!('90d')
            })

            expect(mockOnChange).toHaveBeenCalledWith('90d')
        })
    })

    describe('sms_state field (SmsStateValueSelect)', () => {
        it('should render "Select status" placeholder when no value is set', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('Select status')).toBeInTheDocument()
        })

        it('should render both subscription status options', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('Subscribed')).toBeInTheDocument()
            expect(screen.getByText('Not subscribed')).toBeInTheDocument()
        })

        it('should display "Subscribed" label when value is "subscribed"', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value="subscribed"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.queryByText('Select status')).not.toBeInTheDocument()
            expect(screen.getAllByText('Subscribed').length).toBeGreaterThan(0)
        })

        it('should display "Not subscribed" label when value is "not_subscribed"', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value="not_subscribed"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.queryByText('Select status')).not.toBeInTheDocument()
            expect(
                screen.getAllByText('Not subscribed').length,
            ).toBeGreaterThan(0)
        })

        it('should call onChange with "subscribed" when that option is selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedSelectField.onChange!({
                    id: 'subscribed',
                    label: 'Subscribed',
                })
            })

            expect(mockOnChange).toHaveBeenCalledWith('subscribed')
        })

        it('should call onChange with "not_subscribed" when that option is selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedSelectField.onChange!({
                    id: 'not_subscribed',
                    label: 'Not subscribed',
                })
            })

            expect(mockOnChange).toHaveBeenCalledWith('not_subscribed')
        })

        it('should call onChange with null when the selection is cleared', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="sms_state"
                    value="subscribed"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedSelectField.onChange!(null)
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    describe('address_state_code field (StateValueSelect)', () => {
        it('should render "Select state" placeholder when no value is set', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('Select state')).toBeInTheDocument()
        })

        it('should display the selected state label and hide the placeholder', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value="AL"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.queryByText('Select state')).not.toBeInTheDocument()
            expect(screen.getAllByText('Alabama').length).toBeGreaterThan(0)
        })

        it('should render United States and Canada section headers', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('United States')).toBeInTheDocument()
            expect(screen.getByText('Canada')).toBeInTheDocument()
        })

        it('should render all states without pagination', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('Idaho')).toBeInTheDocument()
            expect(screen.getByText('Ontario')).toBeInTheDocument()
        })

        it('should call onChange with the state code when a state is selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedSelectField.onChange!({
                    id: 'CA',
                    label: 'California',
                    sectionId: 'section-US',
                })
            })

            expect(mockOnChange).toHaveBeenCalledWith('CA')
        })

        it('should call onChange with null when the selection is cleared', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value="AL"
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedSelectField.onChange!(null)
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    describe('address_state_code field with multi-select operators (StateMultiValueSelect)', () => {
        it.each(['containsAny', 'notContainsAny'])(
            'should render "Select states" placeholder for "%s" operator when no value is set',
            (operator) => {
                render(
                    <ConditionValueInput
                        fieldDef={stringFieldDef}
                        field="address_state_code"
                        value={null}
                        onChange={mockOnChange}
                        isUnary={false}
                        operator={operator}
                    />,
                )

                expect(screen.getByText('Select states')).toBeInTheDocument()
            },
        )

        it('should display selected state labels when value is an array', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={['CA', 'NY']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.queryByText('Select states')).not.toBeInTheDocument()
            expect(screen.getAllByText('California').length).toBeGreaterThan(0)
            expect(screen.getAllByText('New York').length).toBeGreaterThan(0)
        })

        it('should display a single string value as a selected item', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value="CA"
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.queryByText('Select states')).not.toBeInTheDocument()
            expect(screen.getAllByText('California').length).toBeGreaterThan(0)
        })

        it('should call onChange with an array of state codes when states are selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([
                    { id: 'CA', label: 'California' },
                    { id: 'NY', label: 'New York' },
                ])
            })

            expect(mockOnChange).toHaveBeenCalledWith(['CA', 'NY'])
        })

        it('should call onChange with null when all states are deselected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="address_state_code"
                    value={['CA']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="notContainsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([])
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    describe('tags field (TagsMultiSelect)', () => {
        it('should render "Select tags" placeholder when no tags are selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('Select tags')).toBeInTheDocument()
        })

        it('should render all fetched tags as options', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.getByText('vip')).toBeInTheDocument()
            expect(screen.getByText('wholesale')).toBeInTheDocument()
            expect(screen.getByText('new-customer')).toBeInTheDocument()
        })

        it('should display selected tag labels when value is set', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="tags"
                    value={['vip', 'wholesale']}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(screen.queryByText('Select tags')).not.toBeInTheDocument()
            expect(screen.getAllByText('vip').length).toBeGreaterThan(0)
            expect(screen.getAllByText('wholesale').length).toBeGreaterThan(0)
        })

        it('should call onChange with an array of tag ids when tags are selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([
                    { id: 'vip', label: 'vip' },
                    { id: 'wholesale', label: 'wholesale' },
                ])
            })

            expect(mockOnChange).toHaveBeenCalledWith(['vip', 'wholesale'])
        })

        it('should call onChange with null when all tags are deselected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="tags"
                    value={['vip']}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([])
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should fetch tags using the integration id from context', () => {
            const { useShopifyShopTags } = jest.requireMock('@repo/customer')

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                />,
            )

            expect(useShopifyShopTags).toHaveBeenCalledWith({
                integrationId: 42,
            })
        })
    })

    describe('product_tag field', () => {
        it('should render a text input for non-contains operators', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="eq"
                />,
            )

            expect(
                screen.getByRole('textbox', { name: /value/i }),
            ).toBeInTheDocument()
        })

        it.each(['contains', 'containsAny', 'containsAll', 'notContainsAny'])(
            'should render a MultiSelectField for the "%s" operator',
            (operator) => {
                render(
                    <ConditionValueInput
                        fieldDef={stringFieldDef}
                        field="product_tags"
                        value={null}
                        onChange={mockOnChange}
                        isUnary={false}
                        operator={operator}
                    />,
                )

                expect(screen.getByText('Select tags')).toBeInTheDocument()
            },
        )

        it('should render fetched product tags as options', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.getByText('sale')).toBeInTheDocument()
            expect(screen.getByText('new-arrival')).toBeInTheDocument()
            expect(screen.getByText('bundle')).toBeInTheDocument()
        })

        it('should call onChange with an array when multiple tags are selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([
                    { id: 'sale', label: 'sale' },
                    { id: 'bundle', label: 'bundle' },
                ])
            })

            expect(mockOnChange).toHaveBeenCalledWith(['sale', 'bundle'])
        })

        it('should call onChange with null when all tags are deselected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={['sale']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([])
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should display selected tags when value is an array', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={['sale', 'bundle']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.queryByText('Select tags')).not.toBeInTheDocument()
            expect(screen.getAllByText('sale').length).toBeGreaterThan(0)
            expect(screen.getAllByText('bundle').length).toBeGreaterThan(0)
        })

        it('should display a single string value as a selected item', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value="sale"
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.queryByText('Select tags')).not.toBeInTheDocument()
            expect(screen.getAllByText('sale').length).toBeGreaterThan(0)
        })

        it('should fetch product tags using the integration id from context', () => {
            const { useGetEcommerceLookupValues } = jest.requireMock(
                'models/ecommerce/queries',
            )

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(useGetEcommerceLookupValues).toHaveBeenCalledWith(
                'product_tag',
                42,
                {},
                { enabled: true },
            )
        })

        it('should pass enabled: false when currentIntegration is undefined', () => {
            const { useJourneyContext } = jest.requireMock(
                'AIJourney/providers',
            )
            const { useGetEcommerceLookupValues } = jest.requireMock(
                'models/ecommerce/queries',
            )
            useJourneyContext.mockReturnValueOnce({
                currentIntegration: undefined,
            })

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_tags"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(useGetEcommerceLookupValues).toHaveBeenCalledWith(
                'product_tag',
                0,
                {},
                { enabled: false },
            )
        })
    })

    describe('product_collection_ids field (ProductCollectionsMultiSelect)', () => {
        it('should render a text input for non-contains operators', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="eq"
                />,
            )

            expect(
                screen.getByRole('textbox', { name: /value/i }),
            ).toBeInTheDocument()
        })

        it.each(['contains', 'containsAny', 'containsAll', 'notContainsAny'])(
            'should render a MultiSelectField for the "%s" operator',
            (operator) => {
                render(
                    <ConditionValueInput
                        fieldDef={stringFieldDef}
                        field="product_collection_ids"
                        value={null}
                        onChange={mockOnChange}
                        isUnary={false}
                        operator={operator}
                    />,
                )

                expect(
                    screen.getByText('Select collections'),
                ).toBeInTheDocument()
            },
        )

        it('should render fetched collections as options', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.getByText('Summer Sale')).toBeInTheDocument()
            expect(screen.getByText('New Arrivals')).toBeInTheDocument()
            expect(screen.getByText('Bundle Deals')).toBeInTheDocument()
        })

        it('should display selected collection labels when value is an array', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={[
                        'gid://shopify/Collection/1',
                        'gid://shopify/Collection/2',
                    ]}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(
                screen.queryByText('Select collections'),
            ).not.toBeInTheDocument()
            expect(screen.getAllByText('Summer Sale').length).toBeGreaterThan(0)
            expect(screen.getAllByText('New Arrivals').length).toBeGreaterThan(
                0,
            )
        })

        it('should display a single string value as a selected item', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value="gid://shopify/Collection/1"
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(
                screen.queryByText('Select collections'),
            ).not.toBeInTheDocument()
            expect(screen.getAllByText('Summer Sale').length).toBeGreaterThan(0)
        })

        it('should call onChange with an array of external_ids when collections are selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([
                    {
                        id: 'gid://shopify/Collection/1',
                        label: 'Summer Sale',
                    },
                    {
                        id: 'gid://shopify/Collection/3',
                        label: 'Bundle Deals',
                    },
                ])
            })

            expect(mockOnChange).toHaveBeenCalledWith([
                'gid://shopify/Collection/1',
                'gid://shopify/Collection/3',
            ])
        })

        it('should call onChange with null when all collections are deselected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={['gid://shopify/Collection/1']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([])
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should fetch collections using the integration id from context', () => {
            const { useGetEcommerceProductCollections } = jest.requireMock(
                'models/ecommerce/queries',
            )

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(useGetEcommerceProductCollections).toHaveBeenCalledWith(
                42,
                {},
                { enabled: true },
            )
        })

        it('should pass enabled: false when currentIntegration is undefined', () => {
            const { useJourneyContext } = jest.requireMock(
                'AIJourney/providers',
            )
            const { useGetEcommerceProductCollections } = jest.requireMock(
                'models/ecommerce/queries',
            )
            useJourneyContext.mockReturnValueOnce({
                currentIntegration: undefined,
            })

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_collection_ids"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(useGetEcommerceProductCollections).toHaveBeenCalledWith(
                0,
                {},
                { enabled: false },
            )
        })
    })

    describe('product_variant_names field (ProductVariantNamesMultiSelect)', () => {
        it('should render a text input for non-contains operators', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="eq"
                />,
            )

            expect(
                screen.getByRole('textbox', { name: /value/i }),
            ).toBeInTheDocument()
        })

        it.each(['contains', 'containsAny', 'containsAll', 'notContainsAny'])(
            'should render a MultiSelectField for the "%s" operator',
            (operator) => {
                render(
                    <ConditionValueInput
                        fieldDef={stringFieldDef}
                        field="product_variant_names"
                        value={null}
                        onChange={mockOnChange}
                        isUnary={false}
                        operator={operator}
                    />,
                )

                expect(screen.getByText('Select products')).toBeInTheDocument()
            },
        )

        it('should render fetched products as options', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(screen.getByText('Classic T-Shirt')).toBeInTheDocument()
            expect(screen.getByText('Running Shoes')).toBeInTheDocument()
            expect(screen.getByText('Winter Jacket')).toBeInTheDocument()
        })

        it('should display selected product labels when value is an array', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={['Classic T-Shirt', 'Running Shoes']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(
                screen.queryByText('Select products'),
            ).not.toBeInTheDocument()
            expect(
                screen.getAllByText('Classic T-Shirt').length,
            ).toBeGreaterThan(0)
            expect(screen.getAllByText('Running Shoes').length).toBeGreaterThan(
                0,
            )
        })

        it('should display a single string value as a selected item', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value="Classic T-Shirt"
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(
                screen.queryByText('Select products'),
            ).not.toBeInTheDocument()
            expect(
                screen.getAllByText('Classic T-Shirt').length,
            ).toBeGreaterThan(0)
        })

        it('should call onChange with an array of product titles when products are selected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([
                    { id: 'Classic T-Shirt', label: 'Classic T-Shirt' },
                    { id: 'Winter Jacket', label: 'Winter Jacket' },
                ])
            })

            expect(mockOnChange).toHaveBeenCalledWith([
                'Classic T-Shirt',
                'Winter Jacket',
            ])
        })

        it('should call onChange with null when all products are deselected', () => {
            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={['Classic T-Shirt']}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            act(() => {
                capturedMultiSelectField.onChange!([])
            })

            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should fetch products using the integration id from context', () => {
            const { useListProducts } = jest.requireMock(
                'models/integration/queries',
            )

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(useListProducts).toHaveBeenCalledWith(42, true)
        })

        it('should pass enabled: false when currentIntegration is undefined', () => {
            const { useJourneyContext } = jest.requireMock(
                'AIJourney/providers',
            )
            const { useListProducts } = jest.requireMock(
                'models/integration/queries',
            )
            useJourneyContext.mockReturnValueOnce({
                currentIntegration: undefined,
            })

            render(
                <ConditionValueInput
                    fieldDef={stringFieldDef}
                    field="product_variant_names"
                    value={null}
                    onChange={mockOnChange}
                    isUnary={false}
                    operator="containsAny"
                />,
            )

            expect(useListProducts).toHaveBeenCalledWith(0, false)
        })
    })
})
