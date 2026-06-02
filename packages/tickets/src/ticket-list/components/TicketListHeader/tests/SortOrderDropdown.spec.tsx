import { screen, waitFor } from '@testing-library/react'

import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import { render } from '../../../../tests/render.utils'
import { useSortOrder } from '../../../hooks/useSortOrder'
import { SortOrderDropdown } from '../SortOrderDropdown'

vi.mock('../../../hooks/useSortOrder')
const useSortOrderMock = vi.mocked(useSortOrder)

const VIEW_ID = 123

async function openMenu(user: ReturnType<typeof render>['user']) {
    await user.click(screen.getByRole('button', { name: /sort view by/i }))
    await waitFor(() => {
        expect(
            screen.getByRole('menuitemradio', { name: /last message/i }),
        ).toBeInTheDocument()
    })
}

describe('SortOrderDropdown', () => {
    beforeEach(() => {
        useSortOrderMock.mockReturnValue([
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
            vi.fn(),
        ])
    })

    it('renders the sort button', () => {
        render(<SortOrderDropdown viewId={VIEW_ID} />)

        expect(
            screen.getByRole('button', { name: /sort view by/i }),
        ).toBeInTheDocument()
    })

    describe('menu items', () => {
        it('shows all sort field options when the menu is opened', async () => {
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            expect(
                screen.getByRole('menuitemradio', { name: /last message/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', {
                    name: /last received message/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /ticket created/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /last updated/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /priority/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /snooze/i }),
            ).toBeInTheDocument()
        })

        it('marks the current sort field as selected', async () => {
            useSortOrderMock.mockReturnValue([
                ListViewItemsUpdatesOrderBy.LastReceivedMessageDatetimeAsc,
                vi.fn(),
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            expect(
                screen.getByRole('menuitemradio', {
                    name: /last received message/i,
                }),
            ).toHaveAttribute('aria-checked', 'true')
            expect(
                screen.getByRole('menuitemradio', { name: /last message/i }),
            ).toHaveAttribute('aria-checked', 'false')
        })

        it('renders with no selected field when the sort order is unsupported', async () => {
            useSortOrderMock.mockReturnValue([
                'unsupported:desc' as ListViewItemsUpdatesOrderBy,
                vi.fn(),
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            const checkedItems = screen
                .getAllByRole('menuitemradio')
                .filter((item) => item.getAttribute('aria-checked') === 'true')

            expect(checkedItems).toHaveLength(0)
        })
    })

    describe('sort field selection', () => {
        it('calls setSortOrder with desc when a different field is selected', async () => {
            const setSortOrder = vi.fn()
            useSortOrderMock.mockReturnValue([
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
                setSortOrder,
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitemradio', { name: /priority/i }),
            )

            expect(setSortOrder).toHaveBeenCalledWith(
                ListViewItemsUpdatesOrderBy.PriorityDesc,
            )
        })

        it('calls setSortOrder with snooze desc when snooze is selected', async () => {
            const setSortOrder = vi.fn()
            useSortOrderMock.mockReturnValue([
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
                setSortOrder,
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitemradio', { name: /snooze/i }),
            )

            expect(setSortOrder).toHaveBeenCalledWith(
                ListViewItemsUpdatesOrderBy.SnoozeDatetimeDesc,
            )
        })

        it('toggles snooze from desc to asc when snooze is active', async () => {
            const setSortOrder = vi.fn()
            useSortOrderMock.mockReturnValue([
                ListViewItemsUpdatesOrderBy.SnoozeDatetimeDesc,
                setSortOrder,
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitemradio', { name: /snooze/i }),
            )

            expect(setSortOrder).toHaveBeenCalledWith(
                ListViewItemsUpdatesOrderBy.SnoozeDatetimeAsc,
            )
        })

        it('toggles from desc to asc when the active field is clicked', async () => {
            const setSortOrder = vi.fn()
            useSortOrderMock.mockReturnValue([
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
                setSortOrder,
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitemradio', { name: /last message/i }),
            )

            expect(setSortOrder).toHaveBeenCalledWith(
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            )
        })

        it('toggles from asc to desc when the active field is clicked', async () => {
            const setSortOrder = vi.fn()
            useSortOrderMock.mockReturnValue([
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
                setSortOrder,
            ])
            const { user } = render(<SortOrderDropdown viewId={VIEW_ID} />)
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitemradio', { name: /last message/i }),
            )

            expect(setSortOrder).toHaveBeenCalledWith(
                ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
            )
        })
    })
})
