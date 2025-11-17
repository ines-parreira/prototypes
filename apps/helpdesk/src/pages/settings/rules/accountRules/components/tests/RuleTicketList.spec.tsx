import type { ComponentProps } from 'react'

import { logEvent } from '@repo/logging'
import { fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ticket as ticketFixture } from 'fixtures/ticket'
import { fetchTicketsByRuleId } from 'models/ticket/resources'
import { renderWithRouter } from 'utils/testing'

import { RuleTicketList } from '../RuleTicketList'

jest.mock('models/ticket/resources')
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('@repo/logging')
jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

describe('<RuleTicketList/>', () => {
    const minProps: ComponentProps<typeof RuleTicketList> = {
        ruleId: 1,
        numTickets: 10,
    }
    const fetchTicketsByRuleIdMock =
        fetchTicketsByRuleId as jest.MockedFunction<typeof fetchTicketsByRuleId>
    const mockStore = configureMockStore([thunk])
    const store = mockStore({ entities: {} })
    const defaultApiResponse = {
        data: [{ ...ticketFixture }],
        meta: { prev_cursor: null, next_cursor: null, total_resources: null },
        object: '',
        uri: '',
    }

    beforeEach(() => {
        fetchTicketsByRuleIdMock.mockResolvedValue(defaultApiResponse)
    })
    it('should render the rule ticket list', async () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>,
        )
        await waitFor(() =>
            expect(container.getElementsByClassName('md-spin').length).toBe(0),
        )
        expect(container).toMatchSnapshot()
    })
    it('should fetch the tickets on render', async () => {
        await waitFor(() =>
            renderWithRouter(
                <Provider store={store}>
                    <RuleTicketList {...minProps} />
                </Provider>,
            ),
        )
        expect(fetchTicketsByRuleIdMock.mock.calls).toMatchSnapshot()
    })

    it('should show navigation if response has cursor', async () => {
        fetchTicketsByRuleIdMock.mockResolvedValue({
            ...defaultApiResponse,
            meta: {
                next_cursor: 'foo',
                prev_cursor: null,
                total_resources: null,
            },
        })
        const { container } = renderWithRouter(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>,
        )
        await waitFor(() =>
            expect(container.getElementsByClassName('md-spin').length).toBe(0),
        )
        expect(container).toMatchSnapshot()
    })
    it('should query on click on next page', async () => {
        fetchTicketsByRuleIdMock.mockResolvedValue({
            ...defaultApiResponse,
            meta: {
                next_cursor: 'foo',
                prev_cursor: null,
                total_resources: null,
            },
        })
        const { container, getByText } = renderWithRouter(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>,
        )
        await waitFor(() =>
            expect(container.getElementsByClassName('md-spin').length).toBe(0),
        )
        fireEvent.click(getByText('keyboard_arrow_right'))
        await waitFor(() =>
            expect(fetchTicketsByRuleIdMock).toHaveBeenCalledTimes(2),
        )
    })
    it('should log segment event on click', async () => {
        const { container, getByText } = renderWithRouter(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>,
        )
        await waitFor(() =>
            expect(container.getElementsByClassName('md-spin').length).toBe(0),
        )
        fireEvent.mouseDown(getByText(ticketFixture.subject))
        await waitFor(() => expect(logEvent).toHaveBeenCalled())
    })
})
