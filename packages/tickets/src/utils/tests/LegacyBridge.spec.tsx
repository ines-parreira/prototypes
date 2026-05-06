import { render, screen } from '@testing-library/react'

import {
    TicketsLegacyBridgeProvider,
    useTicketsLegacyBridge,
} from '../LegacyBridge'
import type { LegacyBridgeContextType } from '../LegacyBridge/context'

const mockTicketViewNavigation: LegacyBridgeContextType['ticketViewNavigation'] =
    {
        isSearchView: false,
        shouldDisplay: true,
        shouldUseLegacyFunctions: false,
        previousTicketId: undefined,
        nextTicketId: undefined,
        legacyGoToPrevTicket: vi.fn(),
        isPreviousEnabled: false,
        legacyGoToNextTicket: vi.fn(),
        isNextEnabled: false,
    }

const mockVoiceDevice: LegacyBridgeContextType['voiceDevice'] = {
    device: {},
    call: null,
}

const mockDtpToggle: LegacyBridgeContextType['dtpToggle'] = {
    isEnabled: false,
    setIsEnabled: vi.fn(),
    previousTicketId: undefined,
    nextTicketId: undefined,
    setPrevNextTicketIds: vi.fn(),
    shouldRedirectToSplitView: false,
    setShouldRedirectToSplitView: vi.fn(),
}

const mockDtpEnabled: LegacyBridgeContextType['dtpEnabled'] = {
    isEnabled: true,
}

const mockHumanizeChannel: LegacyBridgeContextType['humanizeChannel'] = vi.fn(
    (channelIdentifier) => String(channelIdentifier),
)

const defaultProviderProps = {
    dispatchAuditLogEvents: vi.fn(),
    dispatchHideAuditLogEvents: vi.fn(),
    toggleQuickReplies: vi.fn(),
    ticketViewBreadcrumb: null,
    ticketViewNavigation: mockTicketViewNavigation,
    handleTicketDraft: {
        hasDraft: false,
        onResumeDraft: vi.fn(),
        onDiscardDraft: vi.fn(),
    },
    makeOutboundCall: vi.fn(),
    voiceDevice: mockVoiceDevice,
    dtpToggle: mockDtpToggle,
    dtpEnabled: mockDtpEnabled,
    humanizeChannel: mockHumanizeChannel,
}

describe('TicketsLegacyBridgeProvider', () => {
    it('should render children', () => {
        render(
            <TicketsLegacyBridgeProvider {...defaultProviderProps}>
                <div>Test Child</div>
            </TicketsLegacyBridgeProvider>,
        )

        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
})

describe('useTicketsLegacyBridge', () => {
    it('should throw error when used outside provider', () => {
        const TestComponent = () => {
            useTicketsLegacyBridge()
            return null
        }
        const preventExpectedWindowError = (event: ErrorEvent) => {
            if (
                event.error instanceof Error &&
                event.error.message ===
                    'useTicketsLegacyBridge must be used within TicketsLegacyBridgeProvider'
            ) {
                event.preventDefault()
            }
        }
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        window.addEventListener('error', preventExpectedWindowError)

        try {
            expect(() => render(<TestComponent />)).toThrow(
                'useTicketsLegacyBridge must be used within TicketsLegacyBridgeProvider',
            )
        } finally {
            window.removeEventListener('error', preventExpectedWindowError)
            consoleErrorSpy.mockRestore()
        }
    })

    it('should return context value when used within provider', () => {
        const TestComponent = () => {
            const context = useTicketsLegacyBridge()
            return <div>{context ? 'Context Available' : 'No Context'}</div>
        }

        render(
            <TicketsLegacyBridgeProvider {...defaultProviderProps}>
                <TestComponent />
            </TicketsLegacyBridgeProvider>,
        )

        expect(screen.getByText('Context Available')).toBeInTheDocument()
    })
})
