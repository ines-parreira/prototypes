import * as React from 'react'

import { history } from '@repo/routing'
import * as views from '@repo/views'
import { screen, waitFor } from '@testing-library/react'

import { mockView } from '@gorgias/helpdesk-mocks'
import { useGetView } from '@gorgias/helpdesk-queries'
import type * as HelpdeskQueries from '@gorgias/helpdesk-queries'

import { useDefaultViews } from '../../../../sidebar/hooks/useDefaultViews'
import { render } from '../../../../tests/render.utils'
import { TicketListHeader } from '../TicketListHeader'

vi.mock('@repo/views')
vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueries>()

    return {
        ...actual,
        useGetView: vi.fn(),
    }
})
vi.mock('@repo/routing', () => ({ history: { push: vi.fn() } }))
vi.mock('../../../../sidebar/hooks/useDefaultViews', () => ({
    useDefaultViews: vi.fn(),
}))
vi.mock('../SortOrderDropdown', () => ({
    SortOrderDropdown: () => (
        <button type="button" aria-label="Sort view by">
            Sort view by
        </button>
    ),
}))

const mockHistoryPush = vi.mocked(history.push)
const mockUseGetView = vi.mocked(useGetView)
const mockUseDefaultViews = vi.mocked(useDefaultViews)
const mockUseAllViews = vi.mocked(views.useAllViews)
const mockUsePublicViews = vi.mocked(views.usePublicViews)
const mockUsePrivateViews = vi.mocked(views.usePrivateViews)
const mockUseAllViewSections = vi.mocked(views.useAllViewSections)
const mockUseViewCount = vi.mocked(views.useViewCount)
const mockUsePublicViewsOrdering = vi.mocked(views.usePublicViewsOrdering)
const mockUsePrivateViewsOrdering = vi.mocked(views.usePrivateViewsOrdering)

const defaultView = mockView({
    id: 1,
    name: 'Inbox',
    category: 'system',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'inbox',
    section_id: null,
})

const privateRootView = mockView({
    id: 2,
    name: 'Private backlog',
    category: 'custom',
    visibility: 'private',
    decoration: { emoji: '✨' },
    type: 'ticket-list',
    slug: 'private-backlog',
    section_id: null,
})

const privateSectionView = mockView({
    id: 3,
    name: 'VIP follow-up',
    category: 'custom',
    visibility: 'private',
    type: 'ticket-list',
    slug: 'vip-follow-up',
    section_id: 11,
})

const sharedRootView = mockView({
    id: 4,
    name: 'Shared queue',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-queue',
    section_id: null,
})

const sharedSectionView = mockView({
    id: 5,
    name: 'Shared escalations',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-escalations',
    section_id: 21,
})

const allViews = [
    defaultView,
    privateRootView,
    privateSectionView,
    sharedRootView,
    sharedSectionView,
]
const viewId = 1
const viewName = 'Assigned to me'

function renderHeader() {
    return render(<TicketListHeader viewId={viewId} onCollapse={vi.fn()} />)
}

describe('TicketListHeader', () => {
    beforeEach(() => {
        mockHistoryPush.mockReset()
        mockUseGetView.mockReturnValue({
            data: { data: defaultView },
        } as any)
        mockUseAllViews.mockReturnValue(allViews as any)
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: [defaultView],
        } as any)
        mockUsePublicViews.mockReturnValue([
            sharedRootView,
            sharedSectionView,
        ] as any)
        mockUsePrivateViews.mockReturnValue([
            privateRootView,
            privateSectionView,
        ] as any)
        mockUseAllViewSections.mockReturnValue([
            { id: 11, name: 'My section', private: true },
            { id: 21, name: 'Team section', private: false },
        ] as any)
        mockUsePublicViewsOrdering.mockReturnValue({
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: { '21': { display_order: 1 } },
        } as any)
        mockUsePrivateViewsOrdering.mockReturnValue({
            views: {},
            view_sections: { '11': { display_order: 1 } },
        } as any)
        mockUseViewCount.mockImplementation((id) => {
            const counts: Record<number, number | undefined> = {
                1: 1200,
                2: 42,
                3: undefined,
                4: 5000,
                5: 3,
            }
            return counts[id]
        })
    })

    it('renders the view name from the active view data', () => {
        renderHeader()

        expect(
            screen.getByRole('button', { name: /assigned to me/i }),
        ).toBeInTheDocument()
    })

    it('renders custom view emojis in the trigger label', () => {
        mockUseGetView.mockReturnValue({
            data: { data: privateRootView },
        } as any)

        render(<TicketListHeader viewId={2} onCollapse={vi.fn()} />)

        expect(
            screen.getByRole('button', { name: /✨ private backlog/i }),
        ).toBeInTheDocument()
    })

    it('renders no view trigger before the active view loads', () => {
        mockUseGetView.mockReturnValue({
            data: undefined,
        } as any)
        mockUseAllViews.mockReturnValue([] as any)

        renderHeader()

        expect(
            screen.queryByRole('button', { name: new RegExp(viewName, 'i') }),
        ).not.toBeInTheDocument()
    })

    it('calls onCollapse when the hide ticket panel button is clicked', async () => {
        const onCollapse = vi.fn()
        const { user } = render(
            <TicketListHeader viewId={1} onCollapse={onCollapse} />,
        )

        await user.click(
            screen.getByRole('button', { name: /hide ticket panel/i }),
        )

        expect(onCollapse).toHaveBeenCalledTimes(1)
    })

    it.each([{ name: /sort view by/i }, { name: /edit view/i }])(
        'renders the "$name" button',
        ({ name }) => {
            renderHeader()

            expect(screen.getByRole('button', { name })).toBeInTheDocument()
        },
    )

    describe('view menu', () => {
        it('clears search when the menu closes', async () => {
            const { user } = render(
                <TicketListHeader viewId={1} onCollapse={vi.fn()} />,
            )

            const trigger = screen.getByRole('button', {
                name: /assigned to me/i,
            })

            await user.click(trigger)
            await user.type(
                screen.getByRole('searchbox', { name: /search/i }),
                'vip',
            )
            await user.click(
                await screen.findByRole('menuitemradio', {
                    name: /vip follow-up/i,
                }),
            )

            await waitFor(() => {
                expect(
                    screen.queryByRole('searchbox', { name: /search/i }),
                ).not.toBeInTheDocument()
            })

            await user.click(trigger)

            expect(
                screen.getByRole('searchbox', { name: /search/i }),
            ).toHaveValue('')
        })

        it('navigates to the selected view on click', async () => {
            const { user } = render(
                <TicketListHeader viewId={1} onCollapse={vi.fn()} />,
            )

            await user.click(
                screen.getByRole('button', { name: /assigned to me/i }),
            )
            await user.click(
                await screen.findByRole('menuitemradio', {
                    name: /assigned to me/i,
                }),
            )

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith('/app/views/1')
            })
        })
    })
})
