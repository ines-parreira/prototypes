import { useFlag, useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { view } from 'fixtures/views'
import useAppDispatch from 'hooks/useAppDispatch'
import useViewId from 'hooks/useViewId'
import type { View } from 'models/view/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { mockStore } from 'utils/testing'

import TicketNavbarViewLink from '../TicketNavbarViewLink'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)
const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

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

describe('TicketNavbarViewLink', () => {
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
            <MemoryRouter initialEntries={['/app']}>
                <TicketNavbarViewLink view={defaultView} />
            </MemoryRouter>,
        )
        const el = screen.getByText('Inbox').closest('a')
        expect(el).toHaveAttribute('href', '/app/tickets/123/inbox')
    })

    it('should render a split ticket view link', () => {
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
        } as SplitTicketViewContext)
        render(
            <MemoryRouter initialEntries={['/app']}>
                <TicketNavbarViewLink view={defaultView} />
            </MemoryRouter>,
        )
        const el = screen.getByText('Inbox').closest('a')
        expect(el).toHaveAttribute('href', '/app/views/123')
    })

    it('should render the new ticket link format with the feature flag', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <MemoryRouter initialEntries={['/app']}>
                <TicketNavbarViewLink view={defaultView} />
            </MemoryRouter>,
        )
        const el = screen.getByText('Inbox').closest('a')
        expect(el).toHaveAttribute('href', '/app/tickets/123')
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
            <MemoryRouter initialEntries={['/app']}>
                <TicketNavbarViewLink view={view} viewCount={5} />
            </MemoryRouter>,
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

    describe('when wayfinding MS1 flag is enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        afterEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('should render a link to the view via TicketNavbarViewLinkItem', () => {
            render(
                <MemoryRouter initialEntries={['/app']}>
                    <TicketNavbarViewLink view={defaultView} />
                </MemoryRouter>,
            )

            const link = screen.getByRole('link')
            expect(link).toHaveAttribute('href', '/app/tickets/123/inbox')
        })

        it('should render the view name', () => {
            render(
                <MemoryRouter initialEntries={['/app']}>
                    <TicketNavbarViewLink view={defaultView} />
                </MemoryRouter>,
            )

            expect(screen.getByText('Inbox')).toBeInTheDocument()
        })
    })
})
