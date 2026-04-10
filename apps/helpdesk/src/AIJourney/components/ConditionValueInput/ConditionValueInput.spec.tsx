import { fireEvent, render, screen } from '@testing-library/react'

import type { FieldDef } from '../../types/conditionField'
import { ConditionValueInput } from './ConditionValueInput'

// Callbacks captured from the mocked Select so tests can invoke them directly.
const capturedSelect = {
    onSearchChange: undefined as ((val: string) => void) | undefined,
    onOpenChange: undefined as ((isOpen: boolean) => void) | undefined,
    onSelect: undefined as ((item: any) => void) | undefined,
    onLoadMore: undefined as (() => void) | undefined,
    isLoading: false,
}

const capturedInlineSelect = {
    onSelect: undefined as ((id: string) => void) | undefined,
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Select: (props: any) => {
        capturedSelect.onSearchChange = props.onSearchChange
        capturedSelect.onOpenChange = props.onOpenChange
        capturedSelect.onSelect = props.onSelect
        capturedSelect.onLoadMore = props.onLoadMore
        capturedSelect.isLoading = props.isLoading
        return (
            <div aria-label={props['aria-label']}>
                {props.trigger({ ref: { current: null } })}
            </div>
        )
    },
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectPlacement: { BottomLeft: 'bottom-left' },
    Text: ({ children }: any) => <span>{children}</span>,
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
    ListSection: ({ children, items }: any) => (
        <div>{items?.map((item: any) => children(item))}</div>
    ),
}))

jest.mock('../ConditionInlineSelect/ConditionInlineSelect', () => ({
    ConditionInlineSelect: ({ onSelect, selectedId }: any) => {
        capturedInlineSelect.onSelect = onSelect
        return <div aria-label="Value">{selectedId}</div>
    },
}))

const mockOnChange = jest.fn()

const stringFieldDef: FieldDef = { type: 'string', operators: ['eq'] }
const numberFieldDef: FieldDef = { type: 'number', operators: ['gt'] }

describe('<ConditionValueInput />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedSelect.onSearchChange = undefined
        capturedSelect.onOpenChange = undefined
        capturedSelect.onSelect = undefined
        capturedSelect.onLoadMore = undefined
        capturedSelect.isLoading = false
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
})
