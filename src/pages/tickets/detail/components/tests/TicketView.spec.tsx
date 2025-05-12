import { ComponentProps } from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useTimelinePanel } from 'pages/common/components/timeline/hooks/useTimelinePanel'
import Timeline from 'pages/common/components/timeline/Timeline'
import { getBody, getTicketState } from 'state/ticket/selectors'
import { assumeMock, getLastMockCall } from 'utils/testing'

import TicketView, { TIMELINE_CLOSE_BUTTON_ID } from '../TicketView'

jest.mock('hooks/useAppSelector', () => jest.fn((fn: () => unknown) => fn()))
jest.mock('state/ticket/selectors', () => {
    const original = jest.requireActual('state/ticket/selectors')

    return {
        ...original,
        getBody: jest.fn(),
        getTicketState: jest.fn(),
    }
})
jest.mock('pages/common/components/timeline/Timeline', () =>
    jest.fn(() => <div>Timeline</div>),
)
jest.mock('pages/common/components/timeline/hooks/useTimelinePanel', () => ({
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
const getTicketStateMock = assumeMock(getTicketState)
const getBodyMock = assumeMock(getBody)
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
        getTicketStateMock.mockReturnValue(
            fromJS({
                id: 0,
                _internal: {
                    isShopperTyping: false,
                },
            }) as ReturnType<typeof getTicketState>,
        )
        getBodyMock.mockReturnValue(fromJS({}) as ReturnType<typeof getBody>)
        useTimelinePanelMock.mockReturnValue({
            isOpen: false as boolean,
            closeTimeline: closeTimelineMock,
        } as unknown as ReturnType<typeof useTimelinePanel>)
    })

    it('should not have the hidden classes', () => {
        const { container } = render(<TicketView {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have the hidden classes', () => {
        const { container } = render(
            <TicketView {...minProps} isTicketHidden />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `closeTimeline` when the timeline close button is clicked', () => {
        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            closeTimeline: closeTimelineMock,
        } as unknown as ReturnType<typeof useTimelinePanel>)

        render(<TicketView {...minProps} />)

        fireEvent.click(document.getElementById(TIMELINE_CLOSE_BUTTON_ID)!)

        expect(closeTimelineMock).toHaveBeenCalled()
    })

    it('should call the `Timeline` with correct props and scroll to the top on load', async () => {
        useTimelinePanelMock.mockReturnValue({
            isOpen: true,
            closeTimeline: closeTimelineMock,
        } as unknown as ReturnType<typeof useTimelinePanel>)

        render(<TicketView {...minProps} />)

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
