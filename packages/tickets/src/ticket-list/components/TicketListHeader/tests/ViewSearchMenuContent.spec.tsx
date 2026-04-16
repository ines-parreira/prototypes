import * as views from '@repo/views'
import { screen } from '@testing-library/react'

import { Menu } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import type {
    ViewSearchResult,
    ViewSectionGroup,
} from '../useViewSearchMenuData'
import { ViewSearchMenuContent } from '../ViewSearchMenuContent'

vi.mock('@repo/views', async (importOriginal) => {
    const actual = await importOriginal<typeof views>()

    return {
        ...actual,
        useViewCount: vi.fn(),
        ViewCountBadge: vi.fn(),
    }
})

const mockUseViewCount = vi.mocked(views.useViewCount)
const mockViewCountBadge = vi.mocked(views.ViewCountBadge)

const defaultView = {
    id: 1,
    name: 'Inbox',
    category: 'system',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'inbox',
    uri: '/api/views/1',
    section_id: null,
}

const privateRootView = {
    id: 2,
    name: 'Private backlog',
    category: 'custom',
    visibility: 'private',
    decoration: { emoji: '✨' },
    type: 'ticket-list',
    slug: 'private-backlog',
    uri: '/api/views/2',
    section_id: null,
}

const privateSectionView = {
    id: 3,
    name: 'VIP follow-up',
    category: 'custom',
    visibility: 'private',
    type: 'ticket-list',
    slug: 'vip-follow-up',
    uri: '/api/views/3',
    section_id: 11,
}

const sharedRootView = {
    id: 4,
    name: 'Shared queue',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-queue',
    uri: '/api/views/4',
    section_id: null,
}

const sharedSectionView = {
    id: 5,
    name: 'Shared escalations',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-escalations',
    uri: '/api/views/5',
    section_id: 21,
}

const sharedSectionViews: ViewSectionGroup[] = [
    {
        section: { id: 21, name: 'Team section', private: false },
        views: [sharedSectionView as View],
    },
]

const privateSectionViews: ViewSectionGroup[] = [
    {
        section: { id: 11, name: 'My section', private: true },
        views: [privateSectionView as View],
    },
]

function renderContent({
    viewId = 1,
    searchValue = '',
    searchResults = [],
}: {
    viewId?: number
    searchValue?: string
    searchResults?: ViewSearchResult[]
} = {}) {
    return render(
        <Menu
            aria-label="View menu"
            isOpen
            selectionMode="single"
            selectedKeys={[String(viewId)]}
            trigger={<button type="button">Open</button>}
        >
            <ViewSearchMenuContent
                viewId={viewId}
                searchValue={searchValue}
                defaultViews={[defaultView as View]}
                sharedRootViews={[sharedRootView as View]}
                privateRootViews={[privateRootView as View]}
                sharedSectionViews={sharedSectionViews}
                privateSectionViews={privateSectionViews}
                searchResults={searchResults}
                onAction={vi.fn()}
            />
        </Menu>,
    )
}

describe('ViewSearchMenuContent', () => {
    beforeEach(() => {
        testAppQueryClient.clear()
        mockUseViewCount.mockReturnValue(undefined)
        mockViewCountBadge.mockImplementation(({ viewId }) => {
            const count = mockUseViewCount(viewId)

            if (!count) {
                return null
            }

            return (
                <span>
                    {count >= 5000 ? '5k+' : count >= 1000 ? '1.2k' : count}
                </span>
            )
        })
    })

    it('renders the idle groups in the expected order and shows nested submenus', async () => {
        const { user } = renderContent()

        const defaultViewsHeading = await screen.findByText('Default views')
        const sharedViewsTrigger = screen.getByRole('menuitem', {
            name: /shared views/i,
        })
        const privateViewsTrigger = screen.getByRole('menuitem', {
            name: /private views/i,
        })

        expect(
            defaultViewsHeading.compareDocumentPosition(sharedViewsTrigger),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        expect(
            sharedViewsTrigger.compareDocumentPosition(privateViewsTrigger),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

        await user.hover(sharedViewsTrigger)

        expect(
            await screen.findByRole('menuitem', { name: /team section/i }),
        ).toBeInTheDocument()
        expect(await screen.findByText('Shared queue')).toBeInTheDocument()

        await user.hover(privateViewsTrigger)

        expect(
            await screen.findByRole('menuitem', { name: /my section/i }),
        ).toBeInTheDocument()
        expect(
            await screen.findByText('✨ Private backlog'),
        ).toBeInTheDocument()
    })

    it('renders flat search results instead of the grouped submenu structure', () => {
        renderContent({
            searchValue: 'vip',
            searchResults: [
                {
                    view: privateSectionView as View,
                    breadcrumb: 'Private > My section',
                    searchText: 'vip follow-up private my section',
                },
            ],
        })

        expect(
            screen.getByRole('menuitemradio', { name: /vip follow-up/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Private > My section')).toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /shared views/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /private views/i }),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Default views')).not.toBeInTheDocument()
    })

    it('renders formatted count badges when counts exist and hides them when they do not', async () => {
        mockUseViewCount.mockImplementation((id) => {
            const counts: Record<number, number | undefined> = {
                1: 20,
                2: 1200,
                3: undefined,
                4: 5000,
            }

            return counts[id]
        })

        const { user } = renderContent()

        expect(
            screen.getByRole('menuitemradio', { name: /assigned to me/i }),
        ).toHaveTextContent('20')

        await user.hover(
            await screen.findByRole('menuitem', { name: /shared views/i }),
        )

        expect(await screen.findByText('5k+')).toBeInTheDocument()

        await user.hover(
            await screen.findByRole('menuitem', { name: /private views/i }),
        )

        expect(await screen.findByText('1.2k')).toBeInTheDocument()

        renderContent({
            searchValue: 'vip',
            searchResults: [
                {
                    view: privateSectionView as View,
                    breadcrumb: 'Private > My section',
                    searchText: 'vip follow-up private my section',
                },
            ],
        })

        expect(
            screen.getByRole('menuitemradio', { name: /vip follow-up/i }),
        ).not.toHaveTextContent(/\d|k\+/i)
    })

    it.each([
        {
            name: 'private section view',
            viewId: 3,
            submenuNames: [/private views/i, /my section/i],
            selectedName: /vip follow-up/i,
        },
        {
            name: 'shared section view',
            viewId: 5,
            submenuNames: [/shared views/i, /team section/i],
            selectedName: /shared escalations/i,
        },
    ])(
        'marks the current $name as selected inside nested submenus',
        async ({ viewId, submenuNames, selectedName }) => {
            const { user } = renderContent({ viewId })

            for (const submenuName of submenuNames) {
                await user.hover(
                    await screen.findByRole('menuitem', { name: submenuName }),
                )
            }

            expect(
                await screen.findByRole('menuitemradio', {
                    name: selectedName,
                }),
            ).toHaveAttribute('aria-checked', 'true')
        },
    )
})
