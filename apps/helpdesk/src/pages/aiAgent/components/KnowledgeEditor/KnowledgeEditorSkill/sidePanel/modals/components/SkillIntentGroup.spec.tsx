import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {
    SkillIntentGroupItem,
    SkillIntentItem,
} from '../hooks/useLinkedIntentsModalSkill'
import { SkillIntentGroup } from './SkillIntentGroup'

const group: SkillIntentGroupItem = {
    name: 'Order',
    children: [
        {
            intent: 'order::status',
            name: 'Order Status',
            is_available: true,
        },
        {
            intent: 'order::cancel',
            name: 'Order Cancel',
            is_available: true,
        },
    ] as SkillIntentItem[],
}

const defaultProps: React.ComponentProps<typeof SkillIntentGroup> = {
    group,
    draftIntentIds: ['order::status'],
    isExpanded: true,
    isSearching: false,
    intentTicketVolumeById: { 'order::status': 100 },
    onToggleExpanded: jest.fn(),
    onToggleIntent: jest.fn(),
}

const renderComponent = (
    overrides?: Partial<React.ComponentProps<typeof SkillIntentGroup>>,
) => render(<SkillIntentGroup {...defaultProps} {...overrides} />)

describe('SkillIntentGroup', () => {
    afterEach(() => jest.clearAllMocks())

    it('renders group name as text and child intents when expanded', () => {
        renderComponent()

        expect(screen.getByText('Order')).toBeInTheDocument()
        expect(screen.getByText('Order / Status')).toBeInTheDocument()
        expect(screen.getByText('Order / Cancel')).toBeInTheDocument()
    })

    it('hides child intents when collapsed', () => {
        renderComponent({ isExpanded: false })

        expect(screen.getByText('Order')).toBeInTheDocument()
        expect(screen.queryByText('Order / Status')).not.toBeInTheDocument()
    })

    it('always expands when searching', () => {
        renderComponent({ isExpanded: false, isSearching: true })

        expect(screen.getByText('Order / Status')).toBeInTheDocument()
    })

    it('hides expand toggle when searching', () => {
        renderComponent({ isSearching: true })

        expect(
            screen.queryByRole('button', {
                name: 'Toggle Order intents',
            }),
        ).not.toBeInTheDocument()
    })

    it('calls onToggleExpanded when toggle button is clicked', async () => {
        const user = userEvent.setup()
        const onToggleExpanded = jest.fn()
        renderComponent({ onToggleExpanded })

        await user.click(
            screen.getByRole('button', { name: 'Toggle Order intents' }),
        )

        expect(onToggleExpanded).toHaveBeenCalledWith('Order')
    })
})
