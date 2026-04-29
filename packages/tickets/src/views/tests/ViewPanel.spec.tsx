import React from 'react'

import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ViewField } from '@gorgias/helpdesk-types'

import { render } from '../../tests/render.utils'
import { useTicketSearchUrlState } from '../../ticket-list/hooks/useTicketSearchUrlState'
import { useCreateTicketDraft } from '../useCreateTicketDraft'
import { ViewPanel } from '../ViewPanel'

const { ticketTableMock } = vi.hoisted(() => ({
    ticketTableMock: vi.fn(({ isSearchMode }: { isSearchMode?: boolean }) => (
        <div>TicketTable isSearchMode: {String(isSearchMode)}</div>
    )),
}))

vi.mock('@repo/layout', () => ({
    Panel: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

vi.mock('../../ticket-list', () => ({
    TicketTable: ticketTableMock,
}))

vi.mock('../useCreateTicketDraft')
vi.mock('../../ticket-list/hooks/useTicketSearchUrlState')

const useCreateTicketDraftMock = vi.mocked(useCreateTicketDraft)
const useTicketSearchUrlStateMock = vi.mocked(useTicketSearchUrlState)

describe('ViewPanel', () => {
    const setQuery = vi.fn()
    const onSearchResultCountChange = vi.fn()
    const onFixFilters = vi.fn()
    const onNavigateToTicket = vi.fn()
    const onApplyMacro = vi.fn()
    const onDraftFieldsChange = vi.fn()

    beforeEach(() => {
        useCreateTicketDraftMock.mockReturnValue({
            hasDraft: false,
            onCreateTicket: vi.fn(),
            onResumeDraft: vi.fn(),
            onDiscardDraft: vi.fn(),
        })
        useTicketSearchUrlStateMock.mockReturnValue({
            query: '',
            filters: '',
            cursor: undefined,
            setQuery,
            setCursor: vi.fn(),
        })
        setQuery.mockReset()
        onSearchResultCountChange.mockReset()
        onFixFilters.mockReset()
        onNavigateToTicket.mockReset()
        onApplyMacro.mockReset()
        onDraftFieldsChange.mockReset()
        ticketTableMock.mockClear()
    })

    it('renders', () => {
        render(
            <ViewPanel
                viewId={42}
                titleOverride="All"
                settingsContent={<div>FiltersBridge</div>}
                isSettingsExpanded
            />,
        )

        expect(screen.getByRole('heading', { name: 'All' })).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show ticket panel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /edit view/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /create ticket/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('FiltersBridge')).toBeInTheDocument()
        expect(
            screen.getByText('TicketTable isSearchMode: false'),
        ).toBeInTheDocument()

        expect(ticketTableMock.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                viewId: 42,
                isSearchMode: false,
            }),
        )
    })

    it('renders the search field in search mode', () => {
        useTicketSearchUrlStateMock.mockReturnValue({
            query: 'hello',
            filters: '',
            cursor: undefined,
            setQuery,
            setCursor: vi.fn(),
        })

        render(<ViewPanel viewId={42} titleOverride="All" isSearchMode />, {
            initialEntries: ['/app/tickets/search?q=hello'],
            path: '/app/tickets/search',
        })

        expect(
            screen.getByRole('searchbox', { name: 'Search tickets' }),
        ).toHaveValue('hello')
        expect(
            screen.queryByRole('button', { name: /show ticket panel/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /edit view/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /create ticket/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByText('TicketTable isSearchMode: true'),
        ).toBeInTheDocument()
    })

    it('autofocuses the search field in search mode', () => {
        render(<ViewPanel viewId={42} titleOverride="All" isSearchMode />, {
            initialEntries: ['/app/tickets/search'],
            path: '/app/tickets/search',
        })

        expect(
            screen.getByRole('searchbox', { name: 'Search tickets' }),
        ).toHaveFocus()
    })

    it('submits the trimmed search query', async () => {
        const { user } = render(
            <ViewPanel viewId={42} titleOverride="All" isSearchMode />,
            {
                initialEntries: ['/app/tickets/search'],
                path: '/app/tickets/search',
            },
        )

        const searchInput = screen.getByRole('searchbox', {
            name: 'Search tickets',
        })

        await user.type(searchInput, '  hello  {enter}')

        expect(setQuery).toHaveBeenCalledWith('hello')
    })

    it('clears the search field and URL query', async () => {
        useTicketSearchUrlStateMock.mockReturnValue({
            query: 'hello',
            filters: '',
            cursor: undefined,
            setQuery,
            setCursor: vi.fn(),
        })

        const { user } = render(
            <ViewPanel viewId={42} titleOverride="All" isSearchMode />,
            {
                initialEntries: ['/app/tickets/search?q=hello'],
                path: '/app/tickets/search',
            },
        )

        await user.click(screen.getByRole('button', { name: /clear/i }))

        expect(
            screen.getByRole('searchbox', { name: 'Search tickets' }),
        ).toHaveValue('')
        expect(setQuery).toHaveBeenCalledWith('')
    })

    it('passes search-related callbacks and draft props to the ticket table', () => {
        const dirtyView = {
            enabled: true,
            search: 'hello',
            filters: 'status:open',
            areFiltersValid: true,
        }
        const draftFields: ViewField[] = []

        render(
            <ViewPanel
                viewId={42}
                titleOverride="Advanced search"
                isSearchMode
                onSearchResultCountChange={onSearchResultCountChange}
                onFixFilters={onFixFilters}
                onNavigateToTicket={onNavigateToTicket}
                onApplyMacro={onApplyMacro}
                dirtyView={dirtyView}
                isDraftView
                draftFields={draftFields}
                onDraftFieldsChange={onDraftFieldsChange}
            />,
            {
                initialEntries: ['/app/tickets/search'],
                path: '/app/tickets/search',
            },
        )

        expect(ticketTableMock.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                viewId: 42,
                isSearchMode: true,
                onSearchResultCountChange,
                onFixFilters,
                onNavigateToTicket,
                onApplyMacro,
                dirtyView,
                isDraftView: true,
                draftFields,
                onDraftFieldsChange,
            }),
        )
    })
})
