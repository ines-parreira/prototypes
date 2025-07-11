import { fireEvent, render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent } from 'common/segment'
import { account } from 'fixtures/account'
import {
    addTagsAction,
    httpAction,
    macroFixture,
    setTextAction,
    shopifyAction,
} from 'fixtures/macro'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { RootState, StoreDispatch } from 'state/types'

import MacrosQuickReply from '../MacrosQuickReply'

jest.mock('common/segment')
jest.mock('lodash/debounce', () => {
    const _identity: <T>(v: T) => T = jest.requireActual('lodash/identity')
    return _identity
})
jest.mock('pages/tickets/common/macros/Preview', () => () => <>Preview</>)

const logEventMock = logEvent as jest.Mock
const applyMacro = jest.fn()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
describe('<MacrosQuickReply />', () => {
    const minProps = {
        macros: [
            [setTextAction],
            [shopifyAction, addTagsAction, httpAction],
            [setTextAction, shopifyAction, addTagsAction, httpAction],
        ].map((actions, i) => ({
            ...macroFixture,
            actions: actions,
            name: `macro-${i}`,
            id: i + 1,
        })),
        applyMacro,
    }
    const state: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        ticket: fromJS(ticket),
    }

    const store = mockStore(state)

    it('should render the macros quick reply area', () => {
        const { getByText, getAllByRole } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />{' '}
            </Provider>,
        )

        expect(getByText('Suggested macros')).toBeInTheDocument()
        expect(getByText('info_outline')).toBeInTheDocument()

        const buttons = getAllByRole('button')
        expect(buttons).toHaveLength(3)

        expect(getByText('macro-0')).toBeInTheDocument()
        expect(getByText('macro-1')).toBeInTheDocument()
        expect(getByText('macro-2')).toBeInTheDocument()
    })

    it('should show the tooltip when hovering on the icon', async () => {
        const { getByText, findByText } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>,
        )
        fireEvent.mouseOver(getByText('info_outline'))

        const tooltip = await findByText('Macros are suggested', {
            exact: false,
        })

        expect(tooltip).toHaveTextContent(
            'Macros are suggested based on your previous macro usage.',
        )
        expect(tooltip).toHaveTextContent(
            'Use macros to save time answering tickets.',
        )
    })

    it('should send an event to segment when applying a macro', async () => {
        const { getAllByRole } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>,
        )
        getAllByRole('button').map((button) => fireEvent.click(button))
        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledTimes(3)

            expect(logEventMock).toHaveBeenNthCalledWith(
                1,
                'macros-quick-reply-sent',
                {
                    account_domain: 'acme',
                    user_id: 2,
                    ticket_id: 152,
                    macro_id: 1,
                    macro_rank: 1,
                },
            )

            expect(logEventMock).toHaveBeenNthCalledWith(
                2,
                'macros-quick-reply-sent',
                {
                    account_domain: 'acme',
                    user_id: 2,
                    ticket_id: 152,
                    macro_id: 2,
                    macro_rank: 2,
                },
            )

            expect(logEventMock).toHaveBeenNthCalledWith(
                3,
                'macros-quick-reply-sent',
                {
                    account_domain: 'acme',
                    user_id: 2,
                    ticket_id: 152,
                    macro_id: 3,
                    macro_rank: 3,
                },
            )
        })
    })

    it('should send an event to segment when hovering the info icon', async () => {
        const { getByText } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>,
        )
        fireEvent.mouseOver(getByText('info_outline'))
        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledTimes(1)
            expect(logEventMock).toHaveBeenCalledWith(
                'macros-quick-reply-tooltip',
                {
                    account_domain: 'acme',
                    user_id: 2,
                    ticket_id: 152,
                },
            )
        })
    })

    it('should send an event to segment when hovering over a macro', async () => {
        const { getAllByRole } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>,
        )
        fireEvent.mouseOver(getAllByRole('button')[0])
        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledTimes(1)
            expect(logEventMock).toHaveBeenCalledWith(
                'macros-quick-reply-get-details',
                {
                    account_domain: 'acme',
                    user_id: 2,
                    ticket_id: 152,
                    macroId: 1,
                    macroRank: 1,
                },
            )
        })
    })

    it('should filter out macros without an ID', () => {
        const macrosWithInvalidId = [
            ...minProps.macros,
            {
                ...macroFixture,
                actions: [setTextAction],
                name: 'macro-without-id',
                id: undefined,
            },
        ]
        const { getAllByRole } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} macros={macrosWithInvalidId} />
            </Provider>,
        )

        expect(getAllByRole('button')).toHaveLength(3)
    })
})
