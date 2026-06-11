import { useCanAccessAIFeedback } from '@repo/ai-agent'
import { Panels } from '@repo/layout'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useHasAIAgent } from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'

import { InfobarNavigationPanel } from '../InfobarNavigationPanel'

jest.mock('@repo/ai-agent', () => ({
    useCanAccessAIFeedback: jest.fn(),
}))

jest.mock('pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent')

jest.mock('@repo/tickets', () => ({
    TicketInfobarNavigation: ({
        hasAIFeedback,
        hasBigCommerce,
        hasCustomIntegrations,
        hasMagento,
        hasWooCommerce,
    }: {
        hasAIFeedback?: boolean
        hasBigCommerce?: boolean
        hasCustomIntegrations?: boolean
        hasMagento?: boolean
        hasWooCommerce?: boolean
    }) => (
        <div data-testid="ticket-infobar-navigation">
            <div data-testid="has-ai-feedback">{String(!!hasAIFeedback)}</div>
            <div data-testid="has-bigcommerce">{String(!!hasBigCommerce)}</div>
            <div data-testid="has-custom-integrations">
                {String(!!hasCustomIntegrations)}
            </div>
            <div data-testid="has-magento">{String(!!hasMagento)}</div>
            <div data-testid="has-woocommerce">{String(!!hasWooCommerce)}</div>
        </div>
    ),
}))

const useCanAccessAIFeedbackMock = assumeMock(useCanAccessAIFeedback)
const useHasAIAgentMock = assumeMock(useHasAIAgent)

describe('InfobarNavigationPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useHasAIAgentMock.mockReturnValue(false)
        useCanAccessAIFeedbackMock.mockReturnValue(true)
    })

    const renderComponent = (ticketId = '123') => {
        return render(
            <Panels size={1000}>
                <InfobarNavigationPanel />
            </Panels>,
            {
                initialEntries: [`/tickets/${ticketId}`],
                path: '/tickets/:ticketId',
                storeState: {
                    integrations: fromJS({ integrations: [] }),
                } as any,
            },
        )
    }

    describe('AI Feedback integration', () => {
        it('should pass hasAIFeedback=true when useHasAIAgent returns true', () => {
            useHasAIAgentMock.mockReturnValue(true)

            renderComponent()

            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'true',
            )
        })

        it('should pass hasAIFeedback=false when user cannot access AI feedback', () => {
            useHasAIAgentMock.mockReturnValue(true)
            useCanAccessAIFeedbackMock.mockReturnValue(false)

            renderComponent()

            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'false',
            )
        })

        it('should pass hasAIFeedback=true when user can access AI feedback', () => {
            useHasAIAgentMock.mockReturnValue(true)
            useCanAccessAIFeedbackMock.mockReturnValue(true)

            renderComponent()

            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'true',
            )
        })

        it('should pass hasAIFeedback=false when useHasAIAgent returns false', () => {
            useHasAIAgentMock.mockReturnValue(false)

            renderComponent()

            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'false',
            )
        })
    })

    describe('TicketInfobarNavigation rendering', () => {
        it('should render TicketInfobarNavigation component', () => {
            renderComponent()

            expect(
                screen.getByTestId('ticket-infobar-navigation'),
            ).toBeInTheDocument()
        })
    })
})
