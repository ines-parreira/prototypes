import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SelectOption } from '../../types/conditionField'
import { ConditionInlineSelect } from './ConditionInlineSelect'

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
    })

    it('renders all item labels in the dropdown', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('textbox', { name: 'operator' }))

        expect(
            await screen.findByRole('option', { name: 'is' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'is not' }),
        ).toBeInTheDocument()
    })

    it('uses "Select" as default placeholder when none is provided', () => {
        renderComponent()

        expect(screen.getByPlaceholderText('Select')).toBeInTheDocument()
    })

    it('uses the provided placeholder', () => {
        renderComponent({ placeholder: 'Choose...' })

        expect(screen.getByPlaceholderText('Choose...')).toBeInTheDocument()
    })

    it('shows the matching item as the selected value when selectedId matches', () => {
        renderComponent({ selectedId: 'eq' })

        expect(screen.getByRole('textbox', { name: 'operator' })).toHaveValue(
            'is',
        )
    })

    it('shows the placeholder when selectedId does not match any item', () => {
        renderComponent({ selectedId: 'unknown' })

        const field = screen.getByRole('textbox', { name: 'operator' })
        expect(field).not.toHaveValue('is')
        expect(field).not.toHaveValue('is not')
        expect(screen.getByPlaceholderText('Select')).toBeInTheDocument()
    })

    it('calls onSelect with the item id when an option is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('textbox', { name: 'operator' }))
        await user.click(await screen.findByRole('option', { name: 'is' }))

        expect(onSelect).toHaveBeenCalledWith('eq')
    })

    it('does not call onSelect when the dropdown is opened and closed without a selection', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('textbox', { name: 'operator' }))
        await screen.findByRole('option', { name: 'is' })
        await user.keyboard('{Escape}')

        expect(onSelect).not.toHaveBeenCalled()
    })
})
