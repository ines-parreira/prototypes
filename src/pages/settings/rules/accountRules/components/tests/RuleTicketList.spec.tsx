import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'

import {fetchTicketsByRuleId} from 'models/ticket/resources'
import {ticket as ticketFixture} from 'fixtures/ticket'
import history from 'pages/history'

import {RuleTicketList} from '../RuleTicketList'

jest.mock('models/ticket/resources')
jest.mock('pages/history')

describe('<RuleTicketList/>', () => {
    const minProps: ComponentProps<typeof RuleTicketList> = {
        ruleId: 1,
        numTickets: 10,
    }
    const fetchTicketsByRuleIdMock =
        fetchTicketsByRuleId as jest.MockedFunction<typeof fetchTicketsByRuleId>
    const mockStore = configureMockStore([thunk])
    const store = mockStore({entities: {}})
    const defaultApiResponse = {
        data: [{...ticketFixture}],
        meta: {prev_cursor: null, next_cursor: null},
        object: '',
        uri: '',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        fetchTicketsByRuleIdMock.mockResolvedValue(defaultApiResponse)
    })

    it('should render the rule ticket list', async () => {
        const {container, getByText} = render(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>
        )
        await waitFor(() => getByText('List of tickets triggering the rule'))
        expect(container).toMatchSnapshot()
    })
    it('should fetch the tickets on render', async () => {
        await waitFor(() =>
            render(
                <Provider store={store}>
                    <RuleTicketList {...minProps} />
                </Provider>
            )
        )
        expect(fetchTicketsByRuleIdMock.mock.calls).toMatchSnapshot()
    })

    it('should show navigation if response has cursor', async () => {
        fetchTicketsByRuleIdMock.mockResolvedValue({
            ...defaultApiResponse,
            meta: {next_cursor: 'foo', prev_cursor: null},
        })
        const {container, getByText} = render(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>
        )
        await waitFor(() => getByText('List of tickets triggering the rule'))
        expect(container).toMatchSnapshot()
    })
    it('should query on click on next page', async () => {
        fetchTicketsByRuleIdMock.mockResolvedValue({
            ...defaultApiResponse,
            meta: {next_cursor: 'foo', prev_cursor: null},
        })
        const {getByText} = render(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>
        )
        await waitFor(() => getByText('List of tickets triggering the rule'))
        fireEvent.click(getByText('keyboard_arrow_right'))
        await waitFor(() =>
            expect(fetchTicketsByRuleIdMock).toHaveBeenCalledTimes(2)
        )
    })
    it('should go to ticket on click', async () => {
        const {getByText} = render(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>
        )
        await waitFor(() => getByText('List of tickets triggering the rule'))
        fireEvent.click(getByText(ticketFixture.subject))
        await waitFor(() => expect(history.push).toHaveBeenCalled())
    })

    it('should collapse the element when clicking the header', async () => {
        const {container, getByText} = render(
            <Provider store={store}>
                <RuleTicketList {...minProps} />
            </Provider>
        )
        const header = await waitFor(() =>
            getByText('List of tickets triggering the rule')
        )
        fireEvent.click(header)
        expect(container).toMatchSnapshot()
    })
})
