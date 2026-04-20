import { logEvent, SegmentEvent } from '@repo/logging'
import { act, screen } from '@testing-library/react'

import { render } from '../../tests/render.utils'
import { DTPTicketHeaderToggle } from '../DTPTicketHeaderToggle'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        DedicatedTicketPanelToggled: 'Dedicated Ticket Panel Toggled',
    },
}))

describe('DTPTicketHeaderToggle', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return null when ticket panel is already enabled', () => {
        const { container } = render(<DTPTicketHeaderToggle />, {
            dtpToggle: {
                isEnabled: true,
                setIsEnabled: vi.fn(),
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: true,
            },
        })

        expect(container).toBeEmptyDOMElement()
    })

    it('should render the toggle button when ticket panel is not enabled', () => {
        render(<DTPTicketHeaderToggle />, {
            ticketViewNavigation: {
                isSearchView: false,
                shouldDisplay: false,
                shouldUseLegacyFunctions: false,
                previousTicketId: undefined,
                nextTicketId: undefined,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: false,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: false,
            },
            dtpToggle: {
                isEnabled: false,
                setIsEnabled: vi.fn(),
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: true,
            },
        })

        const button = screen.getByRole('button', {
            name: /system-window-sidebar/i,
        })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('aria-describedby', 'Show ticket panel')
    })

    it('should return null for search view tickets', () => {
        const { container } = render(<DTPTicketHeaderToggle />, {
            ticketViewNavigation: {
                isSearchView: true,
                shouldDisplay: false,
                shouldUseLegacyFunctions: false,
                previousTicketId: undefined,
                nextTicketId: undefined,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: false,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: false,
            },
            dtpToggle: {
                isEnabled: false,
                setIsEnabled: vi.fn(),
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: true,
            },
        })

        expect(container).toBeEmptyDOMElement()
    })

    it('hides the toggle when search view is active even if the toggle would otherwise be enabled', () => {
        const { container } = render(<DTPTicketHeaderToggle />, {
            ticketViewNavigation: {
                isSearchView: true,
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: undefined,
                nextTicketId: undefined,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: false,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: false,
            },
            dtpToggle: {
                isEnabled: false,
                setIsEnabled: vi.fn(),
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: true,
            },
        })

        expect(container).toBeEmptyDOMElement()
    })

    it('should disable the button when dtpEnabled is false', () => {
        render(<DTPTicketHeaderToggle />, {
            dtpToggle: {
                isEnabled: false,
                setIsEnabled: vi.fn(),
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: false,
            },
        })

        expect(
            screen.getByRole('button', { name: /system-window-sidebar/i }),
        ).toBeDisabled()
    })

    it('should call setIsEnabled with true when clicked', async () => {
        const setIsEnabled = vi.fn()

        const { user } = render(<DTPTicketHeaderToggle />, {
            dtpToggle: {
                isEnabled: false,
                setIsEnabled,
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: true,
            },
        })

        const button = screen.getByRole('button', {
            name: /system-window-sidebar/i,
        })

        await act(() => user.click(button))

        expect(setIsEnabled).toHaveBeenCalledWith(true)
    })

    it('should log the segment event when clicked', async () => {
        const { user } = render(<DTPTicketHeaderToggle />, {
            dtpToggle: {
                isEnabled: false,
                setIsEnabled: vi.fn(),
                previousTicketId: undefined,
                nextTicketId: undefined,
                setPrevNextTicketIds: vi.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: vi.fn(),
            },
            dtpEnabled: {
                isEnabled: true,
            },
        })

        const button = screen.getByRole('button', {
            name: /system-window-sidebar/i,
        })

        await act(() => user.click(button))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.DedicatedTicketPanelToggled,
            { enabled: true },
        )
    })
})
