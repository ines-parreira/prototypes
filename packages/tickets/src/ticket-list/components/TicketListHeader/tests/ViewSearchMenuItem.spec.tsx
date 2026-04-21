import * as views from '@repo/views'
import { screen } from '@testing-library/react'

import { Menu } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import { render } from '../../../../tests/render.utils'
import { ViewSearchMenuItem } from '../ViewSearchMenuItem'

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

const customView = {
    id: 2,
    name: 'Private backlog',
    category: 'custom',
    visibility: 'private',
    type: 'ticket-list',
    slug: 'private-backlog',
    uri: '/api/views/2',
    section_id: null,
}

function renderMenuItem(view: View) {
    return render(
        <Menu
            aria-label="View menu"
            isOpen
            selectionMode="single"
            selectedKeys={[String(view.id)]}
            trigger={<button type="button">Open</button>}
        >
            <ViewSearchMenuItem view={view} onAction={vi.fn()} />
        </Menu>,
    )
}

describe('ViewSearchMenuItem', () => {
    beforeEach(() => {
        mockUseViewCount.mockReturnValue(undefined)
        mockViewCountBadge.mockReturnValue(null)
    })

    it('renders the navbar icon for system views', () => {
        renderMenuItem(defaultView as View)

        expect(
            screen.getByRole('img', { name: 'user-arrow' }),
        ).toBeInTheDocument()
    })

    it('does not render a generic leading icon for custom views', () => {
        renderMenuItem(customView as View)

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
})
