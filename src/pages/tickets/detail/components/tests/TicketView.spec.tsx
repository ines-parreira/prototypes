import { ComponentProps } from 'react'

import { fireEvent, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { useTimelinePanel } from 'timeline/hooks/useTimelinePanel'
import Timeline from 'timeline/Timeline'
import { assumeMock, getLastMockCall, mockStore } from 'utils/testing'

import TicketView, { TIMELINE_CLOSE_BUTTON_ID } from '../TicketView'

jest.mock('timeline/Timeline', () => jest.fn(() => <div>Timeline</div>))
jest.mock('timeline/hooks/useTimelinePanel', () => ({
    useTimelinePanel: jest.fn(),
}))

jest.mock('../TicketBody', () => () => <div>TicketBody</div>)
jest.mock('../TicketBodyNonVirtualized', () => () => (
    <div>TicketBodyNonVirtualized</div>
))
jest.mock('../TicketHeaderWrapper/TicketHeaderWrapper', () => () => (
    <div>TicketHeaderWrapper</div>
))
jest.mock('../ReplyForm', () => () => <div>ReplyForm</div>)

const TimelineMock = assumeMock(Timeline)
const useTimelinePanelMock = assumeMock(useTimelinePanel)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
const scrollToMock = jest.fn()

describe('<TicketView />', () => {
    const minProps = {
        hideTicket: jest.fn(),
        isTicketHidden: false,
        setStatus: jest.fn(),
        submit: jest.fn(),
    } as unknown as ComponentProps<typeof TicketView>

    const closeTimelineMock = jest.fn(() => {})
    beforeEach(() => {
        HTMLElement.prototype.scrollTo = jest.fn(scrollToMock)
        useTimelinePanelMock.mockReturnValue({
            isOpen: false as boolean,
            closeTimeline: closeTimelineMock,
        } as unknown as ReturnType<typeof useTimelinePanel>)
    })

    const mockTicketState = fromJS({
        id: 0,
        _internal: {
            isShopperTyping: false,
        },
        messages: [
            {
                id: 0,
                type: 'message',
                content: 'Hello',
            },
        ],
    })

    const mockBillingState = fromJS({
        products: [
            {
                type: 'helpdesk',
                prices: [
                    {
                        plan_id: 'basic',
                        price_id: 'price_basic',
                        amount: 100,
                        num_quota_tickets: 1000,
                    },
                ],
            },
        ],
    })

    const mockIntegrationsState = fromJS({
        integrations: [
            {
                id: 1,
                type: 'email',
                name: 'Email Integration',
                meta: {
                    address: 'test@example.com',
                },
            },
        ],
    })

    it('should not have the hidden classes', () => {
        const { container } = renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    ticket: mockTicketState,
                    billing: mockBillingState,
                    integrations: mockIntegrationsState,
                })}
            >
                <TicketView {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have the hidden classes', () => {
        const { container } = renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    ticket: mockTicketState,
                    billing: mockBillingState,
                    integrations: mockIntegrationsState,
                })}
            >
                <TicketView {...minProps} isTicketHidden />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `closeTimeline` when the timeline close button is clicked', () => {
        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            closeTimeline: closeTimelineMock,
        } as unknown as ReturnType<typeof useTimelinePanel>)

        renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    ticket: mockTicketState,
                    billing: mockBillingState,
                    integrations: mockIntegrationsState,
                })}
            >
                <TicketView {...minProps} />
            </Provider>,
        )

        fireEvent.click(document.getElementById(TIMELINE_CLOSE_BUTTON_ID)!)

        expect(closeTimelineMock).toHaveBeenCalled()
    })

    it('should call the `Timeline` with correct props and scroll to the top on load', async () => {
        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            closeTimeline: closeTimelineMock,
        } as unknown as ReturnType<typeof useTimelinePanel>)

        renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    ticket: mockTicketState,
                    billing: mockBillingState,
                    integrations: mockIntegrationsState,
                })}
            >
                <TicketView {...minProps} />
            </Provider>,
        )

        expect(TimelineMock).toHaveBeenCalledWith(
            {
                onLoaded: expect.any(Function),
                ticketId: 0,
            },
            {},
        )

        getLastMockCall(TimelineMock)[0].onLoaded?.()

        await waitFor(() =>
            expect(scrollToMock).toHaveBeenCalledWith({
                top: 0,
            }),
        )
    })
})
