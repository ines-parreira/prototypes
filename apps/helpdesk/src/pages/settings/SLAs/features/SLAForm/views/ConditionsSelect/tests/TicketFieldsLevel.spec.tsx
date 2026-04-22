import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { CustomField } from 'custom-fields/types'

import { TicketFieldsLevel } from '../TicketFieldsLevel'
import type { ConditionsFormValue } from '../types'
import { makeConditionItem } from '../types'

const fields = [
    { id: 10, label: 'Priority' },
    { id: 20, label: 'Region' },
] as CustomField[]

const choicesByField: Record<number, string[]> = {
    10: ['high', 'medium', 'low'],
    20: ['EU', 'US'],
}

const getFieldChoices = (fieldId: number) => choicesByField[fieldId] ?? []

function renderTicketFieldsLevel(
    overrides: Partial<React.ComponentProps<typeof TicketFieldsLevel>> = {},
) {
    const props: React.ComponentProps<typeof TicketFieldsLevel> = {
        fields,
        searchQuery: '',
        isLoading: false,
        getFieldChoices,
        selectedConditions: [] as ConditionsFormValue,
        maxSelections: undefined,
        onNavigate: jest.fn(),
        onToggle: jest.fn(),
        ...overrides,
    }
    render(<TicketFieldsLevel {...props} />)
    return props
}

describe('TicketFieldsLevel', () => {
    it('renders the loading state while isLoading', () => {
        renderTicketFieldsLevel({ isLoading: true })

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /^Priority/ }),
        ).not.toBeInTheDocument()
    })

    it('renders a button for each field when there is no search', () => {
        renderTicketFieldsLevel()

        expect(
            screen.getByRole('button', { name: /^Priority/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^Region/ }),
        ).toBeInTheDocument()
    })

    it('navigates to ticket_field_values when a field button is clicked', async () => {
        const user = userEvent.setup()
        const { onNavigate } = renderTicketFieldsLevel()

        await user.click(screen.getByRole('button', { name: /^Priority/ }))

        expect(onNavigate).toHaveBeenCalledWith({
            type: 'ticket_field_values',
            fieldId: 10,
            fieldLabel: 'Priority',
            path: [],
        })
    })

    it('renders the empty state when fields is empty and there is no search', () => {
        renderTicketFieldsLevel({ fields: [] })

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('renders matching field/choice rows when searching', () => {
        renderTicketFieldsLevel({ searchQuery: 'high' })

        expect(screen.getByLabelText('Priority / high')).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Priority / medium'),
        ).not.toBeInTheDocument()
    })

    it('renders multiple matching choices within the same field', () => {
        renderTicketFieldsLevel({ searchQuery: 'i' })

        expect(screen.getByLabelText('Priority / high')).toBeInTheDocument()
        expect(screen.getByLabelText('Priority / medium')).toBeInTheDocument()
    })

    it('toggles a choice when its checkbox is clicked', async () => {
        const user = userEvent.setup()
        const { onToggle } = renderTicketFieldsLevel({ searchQuery: 'high' })

        await user.click(screen.getByLabelText('Priority / high'))

        expect(onToggle).toHaveBeenCalledWith(
            makeConditionItem('ticket_fields', 10, 'high', 'Priority / high'),
        )
    })

    it('renders the empty state when a search yields no matches', () => {
        renderTicketFieldsLevel({ searchQuery: 'nothingmatches' })

        expect(screen.getByText('No results')).toBeInTheDocument()
    })
})
