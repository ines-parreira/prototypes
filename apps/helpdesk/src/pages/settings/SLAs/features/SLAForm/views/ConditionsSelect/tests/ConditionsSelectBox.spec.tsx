import { Form } from '@repo/forms'
import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConditionsSelectBox } from '../ConditionsSelectBox'
import { makeConditionItem } from '../types'
import useConditionsData from '../useConditionsData'

jest.mock('../useConditionsData')
jest.mock('pages/common/hooks/useOnClickOutside', () => ({
    useOnClickOutside: jest.fn(),
}))

const mockUseConditionsData = useConditionsData as jest.Mock

mockUseConditionsData.mockReturnValue({
    tags: [
        { id: 1, name: 'urgent' },
        { id: 2, name: 'vip' },
    ],
    isLoadingTags: false,
    onLoadMoreTags: jest.fn().mockResolvedValue(undefined),
    shouldLoadMoreTags: false,
    dropdownFields: [],
    isLoadingFields: false,
    getFieldChoices: jest.fn().mockReturnValue([]),
    getFieldTree: jest.fn().mockReturnValue(new Map()),
})

function mockUseConditionsDataWithFields() {
    mockUseConditionsData.mockReturnValue({
        tags: [
            { id: 1, name: 'urgent' },
            { id: 2, name: 'vip' },
        ],
        isLoadingTags: false,
        onLoadMoreTags: jest.fn().mockResolvedValue(undefined),
        shouldLoadMoreTags: false,
        dropdownFields: [
            { id: 10, label: 'Priority' },
            { id: 20, label: 'Region' },
        ],
        isLoadingFields: false,
        getFieldChoices: jest.fn((fieldId: number) => {
            if (fieldId === 10) return ['high', 'low']
            if (fieldId === 20) return ['EU', 'US']
            return []
        }),
        getFieldTree: jest.fn((fieldId: number) => {
            if (fieldId === 10) {
                return new Map([
                    ['high::leaf', { value: 'high', children: new Map() }],
                    ['low::leaf', { value: 'low', children: new Map() }],
                ])
            }
            if (fieldId === 20) {
                return new Map([
                    ['EU::leaf', { value: 'EU', children: new Map() }],
                    ['US::leaf', { value: 'US', children: new Map() }],
                ])
            }
            return new Map()
        }),
    })
}

function renderWithForm(
    props: { maxSelections?: number } = {},
    defaultConditions: ReturnType<typeof makeConditionItem>[] = [],
) {
    return render(
        <Form
            defaultValues={{
                conditions: defaultConditions,
            }}
            onValidSubmit={jest.fn()}
        >
            <ConditionsSelectBox {...props} />
        </Form>,
    )
}

function getTriggerButton() {
    return screen.getByRole('button', { expanded: false })
}

describe('ConditionsSelectBox', () => {
    it('shows "Select" placeholder when no conditions are selected', () => {
        renderWithForm()
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('shows selected condition tags', () => {
        renderWithForm({}, [makeConditionItem('tags', 1, 'urgent', 'urgent')])
        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.queryByText('Select')).not.toBeInTheDocument()
    })

    it('opens popover on click and closes on second click', async () => {
        const user = userEvent.setup()
        renderWithForm()

        const trigger = getTriggerButton()
        await user.click(trigger)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')

        await user.click(trigger)
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes popover on Escape key', async () => {
        const user = userEvent.setup()
        renderWithForm()

        const trigger = getTriggerButton()
        await user.click(trigger)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')

        await user.keyboard('{Escape}')
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows helper text when maxSelections is set', () => {
        renderWithForm({ maxSelections: 5 })
        expect(
            screen.getByText('Choose up to 5 conditions.'),
        ).toBeInTheDocument()
    })

    it('does not show helper text when maxSelections is not set', () => {
        renderWithForm()
        expect(screen.queryByText(/Choose up to/)).not.toBeInTheDocument()
    })

    it('removes a selected tag when its close button is clicked', async () => {
        const user = userEvent.setup()
        renderWithForm({}, [makeConditionItem('tags', 1, 'urgent', 'urgent')])

        const trigger = getTriggerButton()
        const tagCloseButton = within(trigger).getAllByRole('button')[0]
        await user.click(tagCloseButton)

        expect(screen.queryByText('urgent')).not.toBeInTheDocument()
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('ignores a toggle that would exceed maxSelections and leaves the second tag unchecked', async () => {
        const user = userEvent.setup()
        renderWithForm({ maxSelections: 1 }, [
            makeConditionItem('tags', 1, 'urgent', 'urgent'),
        ])

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Tags/ }))
        await user.click(screen.getByLabelText('vip'))

        expect(screen.getByLabelText('vip')).not.toBeChecked()
        expect(screen.getByLabelText('urgent')).toBeChecked()
    })

    it('resets the search query when navigating back to the previous level', async () => {
        const user = userEvent.setup()
        renderWithForm()

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Tags/ }))

        const searchField = screen.getByPlaceholderText('Search...')
        await user.type(searchField, 'urgent')
        expect(searchField).toHaveValue('urgent')

        await user.click(screen.getByRole('button', { name: /chevron-left/ }))

        expect(screen.getByPlaceholderText('Search...')).toHaveValue('')
    })

    it('resets the level to root when the popover is reopened', async () => {
        const user = userEvent.setup()
        renderWithForm()

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Tags/ }))

        expect(screen.getByLabelText('urgent')).toBeInTheDocument()

        await user.keyboard('{Escape}')
        await user.click(getTriggerButton())

        expect(
            screen.getByRole('button', { name: /^Tags/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^Ticket fields/ }),
        ).toBeInTheDocument()
    })

    it('ignores a second value selection for the same root ticket field', async () => {
        mockUseConditionsDataWithFields()
        const user = userEvent.setup()
        renderWithForm({ maxSelections: 5 }, [
            makeConditionItem('ticket_fields', 10, 'high', 'Priority / high'),
        ])

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Ticket fields/ }))
        await user.click(screen.getByRole('button', { name: /^Priority/ }))
        await user.click(screen.getByLabelText('low'))

        expect(screen.getByLabelText('low')).not.toBeChecked()
        expect(screen.getByLabelText('high')).toBeChecked()
    })

    it('allows selecting values for different root ticket fields independently', async () => {
        mockUseConditionsDataWithFields()
        const user = userEvent.setup()
        renderWithForm({ maxSelections: 5 }, [
            makeConditionItem('ticket_fields', 10, 'high', 'Priority / high'),
        ])

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Ticket fields/ }))
        await user.click(screen.getByRole('button', { name: /^Region/ }))
        await user.click(screen.getByLabelText('EU'))

        expect(screen.getByLabelText('EU')).toBeChecked()
    })

    it('does not block tag selection when a ticket field is already selected', async () => {
        mockUseConditionsDataWithFields()
        const user = userEvent.setup()
        renderWithForm({ maxSelections: 5 }, [
            makeConditionItem('ticket_fields', 10, 'high', 'Priority / high'),
        ])

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Tags/ }))
        await user.click(screen.getByLabelText('urgent'))

        expect(screen.getByLabelText('urgent')).toBeChecked()
    })

    it('still allows deselecting an item when at the global cap', async () => {
        const user = userEvent.setup()
        renderWithForm({ maxSelections: 2 }, [
            makeConditionItem('tags', 1, 'urgent', 'urgent'),
            makeConditionItem('tags', 2, 'vip', 'vip'),
        ])

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Tags/ }))
        await user.click(screen.getByLabelText('urgent'))

        expect(screen.getByLabelText('urgent')).not.toBeChecked()
    })

    it('renders legacy multi-value selections as individually deselectable and blocks adding a third', async () => {
        mockUseConditionsDataWithFields()
        const user = userEvent.setup()
        renderWithForm({ maxSelections: 5 }, [
            makeConditionItem('ticket_fields', 10, 'high', 'Priority / high'),
            makeConditionItem('ticket_fields', 10, 'low', 'Priority / low'),
        ])

        await user.click(getTriggerButton())
        await user.click(screen.getByRole('button', { name: /^Ticket fields/ }))
        await user.click(screen.getByRole('button', { name: /^Priority/ }))

        expect(screen.getByLabelText('high')).toBeChecked()
        expect(screen.getByLabelText('low')).toBeChecked()

        await user.click(screen.getByLabelText('high'))
        expect(screen.getByLabelText('high')).not.toBeChecked()
        expect(screen.getByLabelText('low')).toBeChecked()
    })

    it('renders a plain tag for tags-category conditions and a tooltip-wrapped tag for ticket_fields', () => {
        renderWithForm({}, [
            makeConditionItem('tags', 1, 'urgent', 'urgent'),
            makeConditionItem(
                'ticket_fields',
                10,
                'L1::leaf',
                'Priority / leaf',
            ),
        ])

        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.getByText('leaf')).toBeInTheDocument()
        expect(screen.queryByText('Priority / leaf')).not.toBeInTheDocument()
    })
})
