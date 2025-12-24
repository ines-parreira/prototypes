import { render, screen } from '@testing-library/react'

import {
    TicketsLegacyBridgeProvider,
    useTicketsLegacyBridge,
} from '../LegacyBridge'
import type { LegacyBridgeContextType } from '../LegacyBridge/context'
import { NotificationStatus } from '../LegacyBridge/context'

const mockTicketViewNavigation: LegacyBridgeContextType['ticketViewNavigation'] =
    {
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

describe('TicketsLegacyBridgeProvider', () => {
    it('should render children', () => {
        render(
            <TicketsLegacyBridgeProvider
                dispatchNotification={vi.fn()}
                dispatchDismissNotification={vi.fn()}
                dispatchAuditLogEvents={vi.fn()}
                dispatchHideAuditLogEvents={vi.fn()}
                toggleQuickReplies={vi.fn()}
                ticketViewNavigation={mockTicketViewNavigation}
                handleTicketDraft={{
                    hasDraft: false,
                    onResumeDraft: vi.fn(),
                    onDiscardDraft: vi.fn(),
                }}
                makeOutboundCall={vi.fn()}
                voiceDevice={mockVoiceDevice}
            >
                <div>Test Child</div>
            </TicketsLegacyBridgeProvider>,
        )

        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context value to children', () => {
        const mockFn = vi.fn()
        const TestComponent = () => {
            const { dispatchNotification } = useTicketsLegacyBridge()
            return (
                <button
                    onClick={() =>
                        dispatchNotification({
                            status: NotificationStatus.Success,
                            message: 'Test message',
                        })
                    }
                >
                    Trigger Function
                </button>
            )
        }

        render(
            <TicketsLegacyBridgeProvider
                dispatchNotification={mockFn}
                dispatchDismissNotification={mockFn}
                dispatchAuditLogEvents={mockFn}
                dispatchHideAuditLogEvents={mockFn}
                toggleQuickReplies={mockFn}
                ticketViewNavigation={mockTicketViewNavigation}
                handleTicketDraft={{
                    hasDraft: false,
                    onResumeDraft: vi.fn(),
                    onDiscardDraft: vi.fn(),
                }}
                makeOutboundCall={vi.fn()}
                voiceDevice={mockVoiceDevice}
            >
                <TestComponent />
            </TicketsLegacyBridgeProvider>,
        )

        const button = screen.getByRole('button', { name: /trigger function/i })
        button.click()

        expect(mockFn).toHaveBeenCalledOnce()
    })
})

describe('useTicketsLegacyBridge', () => {
    it('should throw error when used outside provider', () => {
        const TestComponent = () => {
            useTicketsLegacyBridge()
            return null
        }

        expect(() => render(<TestComponent />)).toThrow(
            'useTicketsLegacyBridge must be used within TicketsLegacyBridgeProvider',
        )
    })

    it('should return context value when used within provider', () => {
        const mockFn = vi.fn()
        const TestComponent = () => {
            const context = useTicketsLegacyBridge()
            return <div>{context ? 'Context Available' : 'No Context'}</div>
        }

        render(
            <TicketsLegacyBridgeProvider
                dispatchNotification={mockFn}
                dispatchDismissNotification={mockFn}
                dispatchAuditLogEvents={mockFn}
                dispatchHideAuditLogEvents={mockFn}
                toggleQuickReplies={mockFn}
                ticketViewNavigation={mockTicketViewNavigation}
                handleTicketDraft={{
                    hasDraft: false,
                    onResumeDraft: vi.fn(),
                    onDiscardDraft: vi.fn(),
                }}
                makeOutboundCall={vi.fn()}
                voiceDevice={mockVoiceDevice}
            >
                <TestComponent />
            </TicketsLegacyBridgeProvider>,
        )

        expect(screen.getByText('Context Available')).toBeInTheDocument()
    })
})
