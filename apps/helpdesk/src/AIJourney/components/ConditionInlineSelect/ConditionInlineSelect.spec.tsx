import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { SelectOption } from '../../types/conditionField'
import { ConditionInlineSelect } from './ConditionInlineSelect'

const captured: {
    onChange: ((item: SelectOption | null | undefined) => void) | undefined
    value: SelectOption | undefined
    placeholder: string | undefined
} = {
    onChange: undefined,
    value: undefined,
    placeholder: undefined,
}

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children }: any) => <div>{children}</div>,
    SelectField: ({
        onChange,
        placeholder,
        value,
        items,
        children,
        'aria-label': ariaLabel,
    }: any) => {
        captured.onChange = onChange
        captured.value = value
        captured.placeholder = placeholder
        return (
            <div>
                <span>{placeholder}</span>
                <div aria-label={ariaLabel}>
                    {items?.map((item: any) => children(item))}
                </div>
            </div>
        )
    },
    ListItem: ({ label }: any) => <span>{label}</span>,
}))

const items: SelectOption[] = [
    { id: 'eq', label: 'is' },
    { id: 'neq', label: 'is not' },
]

const onSelect = jest.fn()

const renderComponent = (
    props: Partial<Parameters<typeof ConditionInlineSelect>[0]> = {},
) =>
    render(
        <ConditionInlineSelect
            items={items}
            selectedId={null}
            onSelect={onSelect}
            ariaLabel="operator"
            {...props}
        />,
    )

describe('<ConditionInlineSelect />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        captured.onChange = undefined
        captured.value = undefined
        captured.placeholder = undefined
    })

    it('renders all item labels via the children render function', () => {
        renderComponent()

        expect(screen.getByText('is')).toBeInTheDocument()
        expect(screen.getByText('is not')).toBeInTheDocument()
    })

    it('uses "Select" as default placeholder when none is provided', () => {
        renderComponent()

        expect(captured.placeholder).toBe('Select')
    })

    it('uses the provided placeholder', () => {
        renderComponent({ placeholder: 'Choose...' })

        expect(captured.placeholder).toBe('Choose...')
    })

    it('passes the found item as value when selectedId matches', () => {
        renderComponent({ selectedId: 'eq' })

        expect(captured.value).toEqual({ id: 'eq', label: 'is' })
    })

    it('passes undefined as value when selectedId does not match any item', () => {
        renderComponent({ selectedId: 'unknown' })

        expect(captured.value).toBeUndefined()
    })

    it('calls onSelect with the item id when onChange fires with a truthy item', () => {
        renderComponent()

        captured.onChange?.({ id: 'eq', label: 'is' })

        expect(onSelect).toHaveBeenCalledWith('eq')
    })

    it('does not call onSelect when onChange fires with null', () => {
        renderComponent()

        captured.onChange?.(null)

        expect(onSelect).not.toHaveBeenCalled()
    })

    it('does not call onSelect when onChange fires with undefined', () => {
        renderComponent()

        captured.onChange?.(undefined)

        expect(onSelect).not.toHaveBeenCalled()
    })
})
