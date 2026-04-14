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

        it('should show empty placeholder when value is a non-array (graceful fallback)', () => {
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

            expect(screen.getByText('Select states')).toBeInTheDocument()
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
})
