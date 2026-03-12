import * as React from 'react'

import { screen, waitFor } from '@testing-library/react'

import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import { render } from '../../../../tests/render.utils'
import { useSortOrder } from '../../../hooks/useSortOrder'
import { SortOrderDropdown } from '../SortOrderDropdown'

vi.mock('@gorgias/axiom', async (importOriginal) => ({
    ...(await importOriginal()),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: string }) => <div>{title}</div>,
}))

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
