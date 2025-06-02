import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { StaticRouter } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { view } from 'fixtures/views'
import useAppDispatch from 'hooks/useAppDispatch'
import useViewId from 'hooks/useViewId'
import type { View } from 'models/view/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { assumeMock, mockStore } from 'utils/testing'

import TicketNavbarViewLink from '../v2/TicketNavbarViewLinkV2'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('hooks/useViewId', () => jest.fn())
const useViewIdMock = assumeMock(useViewId)

jest.mock('split-ticket-view-toggle', () => ({ useSplitTicketView: jest.fn() }))
const useSplitTicketViewMock = assumeMock(useSplitTicketView)
type SplitTicketViewContext = ReturnType<typeof useSplitTicketView>

const minProps = {
    view,
    viewCount: 5,
    isNested: false,
}

describe('TicketNavbarViewLinkV2', () => {
    let dispatch: jest.Mock

    const defaultView = {
        id: 123,
        name: 'Inbox',
        section_id: 321,
        slug: 'inbox',
    } as View

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useFlagMock.mockReturnValue(false)
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: false,
        } as SplitTicketViewContext)
        useViewIdMock.mockReturnValue(123)
    })

    it('should render a default link', () => {
        render(
            <StaticRouter location="/app">
                <TicketNavbarViewLink view={defaultView} />
            </StaticRouter>,
        )
        const el = screen.getByText('Inbox').closest('a')
        expect(el).toHaveAttribute('to', '/app/tickets/123/inbox')
    })

    it('should render a split ticket view link', () => {
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
        } as SplitTicketViewContext)
        render(
            <StaticRouter location="/app">
                <TicketNavbarViewLink view={defaultView} />
            </StaticRouter>,
        )
        const el = screen.getByText('Inbox').closest('a')
        expect(el).toHaveAttribute('to', '/app/views/123')
    })

    it('should render the new ticket link format with the feature flag', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <StaticRouter location="/app">
                <TicketNavbarViewLink view={defaultView} />
            </StaticRouter>,
        )
        const el = screen.getByText('Inbox').closest('a')
        expect(el).toHaveAttribute('to', '/app/tickets/123')
    })

    it('renders the candu link with the correct data-candu-id attribute', () => {
        // Create a minimal view object for testing
        const view = {
            id: 'view1',
            name: 'Handover',
            slug: 'handover',
            decoration: { emoji: '🧑‍💻' },
            section_id: null,
            deactivated_datetime: null,
        } as unknown as View

        const { container } = render(
            <StaticRouter location="/app">
                <TicketNavbarViewLink view={view} viewCount={5} />
            </StaticRouter>,
        )

        const expectedDataCanduId = 'ticket-navbar-ai-agent-view-link-handover'

        const sectionNameElement = container.querySelector('[data-candu-id]')
        expect(sectionNameElement).toBeTruthy()

        expect(sectionNameElement).toHaveAttribute(
            'data-candu-id',
            expectedDataCanduId,
        )
    })

    it('should have the correct component structure', () => {
        const { container } = render(
            <Provider
                store={mockStore({
                    entities: {},
                    currentUser: {},
                })}
            >
                <MemoryRouter initialEntries={['/']}>
                    <TicketNavbarViewLink {...minProps} />
                </MemoryRouter>
            </Provider>,
        )

        // Verify the outer div structure for DnD functionality
        const outerDiv = container.firstChild as HTMLElement
        expect(outerDiv.tagName).toBe('DIV')
        expect(outerDiv).toHaveAttribute(
            'id',
            `ticket-navbar-view-${minProps.view.id}`,
        )

        // Verify the Navigation.SectionItem is wrapped inside the DnD div
        const sectionItem = outerDiv.firstChild as HTMLElement
        expect(sectionItem).toHaveClass('item viewLink')
        expect(sectionItem.tagName).toBe('A') // Navigation.SectionItem renders as a Link (anchor)
    })
})
