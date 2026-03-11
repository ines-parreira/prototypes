import { history } from '@repo/routing'
import { screen, waitFor } from '@testing-library/react'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { useExpandableDefaultViews } from '../../hooks/useExpandableDefaultViews'
import type { SystemView } from '../../types/views'
import { CollapsedDefaultViews } from '../CollapsedDefaultViews'

vi.mock('../../hooks/useExpandableDefaultViews')
vi.mock('@repo/routing', () => ({ history: { push: vi.fn() } }))
vi.mock('../../../utils/LegacyBridge')

const mockHistoryPush = vi.mocked(history.push)
const mockUseTicketsLegacyBridge = vi.mocked(useTicketsLegacyBridge)

const mockUseExpandableDefaultViews = vi.mocked(useExpandableDefaultViews)

const makeViews = (count: number): SystemView[] =>
    Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: [
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ][i],
        slug: `view-${i + 1}`,
        category: 'system' as const,
    }))

describe('CollapsedDefaultViews', () => {
    beforeEach(() => {
        testAppQueryClient.clear()
        mockHistoryPush.mockClear()
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: makeViews(3),
            showToggle: false,
            isExpanded: false,
            toggleExpanded: vi.fn(),
        })
        mockUseTicketsLegacyBridge.mockReturnValue({
            dtpToggle: { isEnabled: false },
        } as any)
    })

    it('should render one button per displayed view', () => {
        render(<CollapsedDefaultViews />)

        expect(screen.getAllByRole('radio')).toHaveLength(3)
    })

    it('should not render the expand toggle button when showToggle is false', () => {
        render(<CollapsedDefaultViews />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render the expand toggle button when showToggle is true', () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: makeViews(3),
            showToggle: true,
            isExpanded: false,
            toggleExpanded: vi.fn(),
        })

        render(<CollapsedDefaultViews />)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call toggleExpanded when the toggle button is clicked', async () => {
        const mockToggleExpanded = vi.fn()
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: makeViews(3),
            showToggle: true,
            isExpanded: false,
            toggleExpanded: mockToggleExpanded,
        })

        const { user } = render(<CollapsedDefaultViews />)

        await user.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(mockToggleExpanded).toHaveBeenCalledTimes(1)
        })
    })

    it('should navigate to the tickets URL with encoded slug when a view is selected', async () => {
        const { user } = render(<CollapsedDefaultViews />)

        await user.click(screen.getAllByRole('radio')[0])

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/tickets/1/view-1',
            )
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should use empty string for slug when view has no slug', async () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [
                { id: 1, name: 'Inbox', category: 'system' as const },
            ],
            showToggle: false,
            isExpanded: false,
            toggleExpanded: vi.fn(),
        })

        const { user } = render(<CollapsedDefaultViews />)

        await user.click(screen.getAllByRole('radio')[0])

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith('/app/tickets/1/')
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should navigate to the views URL when dtpToggle is enabled', async () => {
        mockUseTicketsLegacyBridge.mockReturnValue({
            dtpToggle: { isEnabled: true },
        } as any)

        const { user } = render(<CollapsedDefaultViews />)

        await user.click(screen.getAllByRole('radio')[0])

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith('/app/views/1')
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should encode special characters in the slug when navigating', async () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: [
                {
                    id: 1,
                    name: 'Inbox',
                    slug: 'my/special-view',
                    category: 'system' as const,
                },
            ],
            showToggle: false,
            isExpanded: false,
            toggleExpanded: vi.fn(),
        })

        const { user } = render(<CollapsedDefaultViews />)

        await user.click(screen.getAllByRole('radio')[0])

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/tickets/1/my%2Fspecial-view',
            )
        })
    })

    it('should render more views when expanded', () => {
        mockUseExpandableDefaultViews.mockReturnValue({
            displayedViews: makeViews(5),
            showToggle: true,
            isExpanded: true,
            toggleExpanded: vi.fn(),
        })

        render(<CollapsedDefaultViews />)

        expect(screen.getAllByRole('radio')).toHaveLength(5)
    })
})
