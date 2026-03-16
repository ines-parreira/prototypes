import { Panels } from '@repo/layout'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter, Route } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { InfobarNavigationPanel } from '../InfobarNavigationPanel'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetTicket: jest.fn(),
}))

jest.mock('pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent')

jest.mock('@repo/tickets', () => ({
    TicketInfobarNavigation: ({
        hasAIFeedback,
        hasTimeline,
    }: {
        hasAIFeedback?: boolean
        hasTimeline?: boolean
    }) => (
        <div data-testid="ticket-infobar-navigation">
            <div data-testid="has-ai-feedback">{String(!!hasAIFeedback)}</div>
            <div data-testid="has-timeline">{String(!!hasTimeline)}</div>
            {hasTimeline && (
                <button data-testid="timeline-tab">Timeline Tab</button>
            )}
        </div>
    ),
}))

const useGetTicketMock = assumeMock(useGetTicket)
const useHasAIAgentMock = assumeMock(useHasAIAgent)

describe('InfobarNavigationPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useHasAIAgentMock.mockReturnValue(false)
    })

    const renderComponent = (ticketId = '123') => {
        return renderWithStoreAndQueryClientProvider(
            <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
                <Route path="/tickets/:ticketId">
                    <Panels size={1000}>
                        <InfobarNavigationPanel />
                    </Panels>
                </Route>
            </MemoryRouter>,
            {
                integrations: fromJS({ integrations: [] }),
            } as any,
        )
    }

    describe('Timeline tab visibility', () => {
        it('should pass hasTimeline=true to TicketInfobarNavigation when ticket has a customer with shopperId', () => {
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: {
                            id: 456, // shopperId
                            email: 'customer@example.com',
                        },
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-timeline')).toHaveTextContent('true')
        })

        it('should display timeline tab when ticket has a customer with shopperId', () => {
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: {
                            id: 456, // shopperId
                            email: 'customer@example.com',
                        },
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('timeline-tab')).toBeInTheDocument()
            expect(screen.getByText('Timeline Tab')).toBeInTheDocument()
        })

        it('should pass hasTimeline=false to TicketInfobarNavigation when ticket has no customer', () => {
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: null,
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-timeline')).toHaveTextContent(
                'false',
            )
        })

        it('should not display timeline tab when ticket has no customer', () => {
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: null,
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.queryByTestId('timeline-tab')).not.toBeInTheDocument()
        })

        it('should pass hasTimeline=false when customer exists but has no id', () => {
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: {
                            email: 'customer@example.com',
                            // No id property
                        },
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-timeline')).toHaveTextContent(
                'false',
            )
        })

        it('should pass hasTimeline=false when ticket data is undefined', () => {
            useGetTicketMock.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-timeline')).toHaveTextContent(
                'false',
            )
        })
    })

    describe('AI Feedback integration', () => {
        it('should pass hasAIFeedback=true when useHasAIAgent returns true', () => {
            useHasAIAgentMock.mockReturnValue(true)
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: {
                            id: 456,
                        },
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'true',
            )
        })

        it('should pass hasAIFeedback=false when useHasAIAgent returns false', () => {
            useHasAIAgentMock.mockReturnValue(false)
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: null,
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'false',
            )
        })
    })

    describe('TicketInfobarNavigation rendering', () => {
        it('should render TicketInfobarNavigation component', () => {
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: {
                            id: 456,
                        },
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(
                screen.getByTestId('ticket-infobar-navigation'),
            ).toBeInTheDocument()
        })

        it('should pass both hasTimeline and hasAIFeedback as true when conditions are met', () => {
            useHasAIAgentMock.mockReturnValue(true)
            useGetTicketMock.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        customer: {
                            id: 456,
                        },
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            renderComponent()

            expect(screen.getByTestId('has-timeline')).toHaveTextContent('true')
            expect(screen.getByTestId('has-ai-feedback')).toHaveTextContent(
                'true',
            )
            expect(screen.getByTestId('timeline-tab')).toBeInTheDocument()
        })
    })
})
