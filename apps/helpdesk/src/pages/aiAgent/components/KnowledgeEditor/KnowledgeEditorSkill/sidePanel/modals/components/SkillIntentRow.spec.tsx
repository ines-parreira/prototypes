import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SkillIntentItem } from '../hooks/useLinkedIntentsModalSkill'
import { SkillIntentRow } from './SkillIntentRow'

const baseIntent: SkillIntentItem = {
    intent: 'order::status',
    name: 'Order Status',
    is_available: true,
} as SkillIntentItem

const renderComponent = (
    props?: Partial<React.ComponentProps<typeof SkillIntentRow>>,
) =>
    render(
        <SkillIntentRow
            intent={baseIntent}
            isChecked={false}
            onToggle={jest.fn()}
            {...props}
        />,
    )

describe('SkillIntentRow', () => {
    it('renders intent label and description as text when not checked', () => {
        renderComponent()

        expect(screen.getByText('Order / Status')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Questions about order status or tracking information',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('renders ticket volume including zero', () => {
        renderComponent({ ticketVolume: 0 })

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows "Already added" tag without checkbox', () => {
        renderComponent({ isChecked: true, isAlreadyAdded: true })

        expect(screen.getByText('Already added')).toBeInTheDocument()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('shows "Linked to another skill" tag for intents linked elsewhere', () => {
        renderComponent({
            intent: {
                ...baseIntent,
                used_by_article: {
                    id: 200,
                    version: 1,
                    title: 'Other Skill',
                    locale: 'en',
                },
            } as SkillIntentItem,
        })

        expect(screen.getByText('Linked to another skill')).toBeInTheDocument()
    })

    it('hides linked tag when intent is already added', () => {
        renderComponent({
            intent: {
                ...baseIntent,
                used_by_article: {
                    id: 100,
                    version: 1,
                    title: 'Current Skill',
                    locale: 'en',
                },
            } as SkillIntentItem,
            isAlreadyAdded: true,
            isChecked: true,
        })

        expect(
            screen.queryByText('Linked to another skill'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Already added')).toBeInTheDocument()
    })

    it('calls onToggle when clickable row is clicked', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()
        renderComponent({ onToggle })

        await user.click(screen.getByText('Order / Status'))

        expect(onToggle).toHaveBeenCalledWith(baseIntent)
    })

    it('does not call onToggle for handover-only intents', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()
        renderComponent({
            intent: {
                intent: 'other::spam',
                name: 'Spam',
                is_available: true,
            } as SkillIntentItem,
            onToggle,
        })

        await user.click(screen.getByText('Other / Spam'))

        expect(onToggle).not.toHaveBeenCalled()
    })
})
