import { render, screen } from '@testing-library/react'

import { InboxSidebar } from '../sidebars/InboxSidebar'

jest.mock('pages/tickets/navbar/TicketNavbar', () => ({
    __esModule: true,
    default: () => <div>TicketNavbar</div>,
}))

const legacyBridgeTestProps = {
    dispatchNotification: jest.fn(),
    dispatchDismissNotification: jest.fn(),
    dispatchAuditLogEvents: jest.fn(),
    dispatchHideAuditLogEvents: jest.fn(),
    toggleQuickReplies: jest.fn(),
    onToggleUnread: jest.fn(),
    ticketViewNavigation: {
        shouldDisplay: false,
        shouldUseLegacyFunctions: false,
        previousTicketId: undefined,
        nextTicketId: undefined,
        legacyGoToPrevTicket: jest.fn(),
        isPreviousEnabled: false,
        legacyGoToNextTicket: jest.fn(),
        isNextEnabled: false,
    },
    handleTicketDraft: {
        hasDraft: false,
        onResumeDraft: jest.fn(),
        onDiscardDraft: jest.fn(),
    },
    makeOutboundCall: jest.fn(),
    voiceDevice: {
        device: {},
        call: null,
    },
    dtpToggle: {
        isEnabled: false,
        setIsEnabled: jest.fn(),
        previousTicketId: undefined,
        nextTicketId: undefined,
        setPrevNextTicketIds: jest.fn(),
        shouldRedirectToSplitView: false,
        setShouldRedirectToSplitView: jest.fn(),
    },
    dtpEnabled: {
        isEnabled: false,
    },
    humanizeChannel: jest.fn(),
    useVoiceDevice: jest.fn(),
}

jest.mock(
    'tickets/core/hooks/legacyBridge/useTicketLegacyBridgeFunctions',
    () => ({
        useTicketLegacyBridgeFunctions: () => legacyBridgeTestProps,
    }),
)

describe('InboxSidebar', () => {
    it('should render TicketNavbar component', () => {
        render(<InboxSidebar />)
        const navbar = screen.getByText('TicketNavbar')
        expect(navbar).toBeInTheDocument()
    })
})
