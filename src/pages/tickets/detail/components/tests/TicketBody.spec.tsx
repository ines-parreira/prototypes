import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import React from 'react'
import {Provider} from 'react-redux'
import {VirtuosoProps} from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {message as defaultMessage} from 'models/ticket/tests/mocks'
import TicketBody from 'pages/tickets/detail/components/TicketBody'
import TicketBodyElement from 'pages/tickets/detail/components/TicketBodyElement'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore([thunk])

jest.mock('pages/tickets/detail/components/TicketBodyElement', () =>
    jest.fn(({index}: {index: number}) => <p>TicketBodyElement {index}</p>)
)

jest.mock('pages/tickets/detail/components/TicketHeaderWrapper', () => () => (
    <p>TicketHeaderWrapper</p>
))

jest.mock(
    'state/queries/selectors',
    () =>
        ({
            ...jest.requireActual('state/queries/selectors'),
            getQueryTimestamp: jest.fn(() => jest.fn()),
        } as Record<string, unknown>)
)

jest.mock('state/billing/selectors')

jest.mock('react-virtuoso', () => {
    const {forwardRef, Fragment} = jest.requireActual('react')
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    function Virtuoso(props: VirtuosoProps<unknown, unknown>, _ref: any) {
        return (
            <>
                {props.data?.map((value, index) => (
                    <Fragment key={index}>
                        {props.itemContent?.(index, value, undefined)}
                    </Fragment>
                ))}
            </>
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return {Virtuoso: forwardRef(Virtuoso)}
})

const mockTicketBodyElement = assumeMock(TicketBodyElement)

describe('TicketBody', () => {
    beforeEach(() => {
        mockTicketBodyElement.mockClear()
    })

    it('should render an element for each given element', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage, defaultMessage]),
                    }),
                })}
            >
                <TicketBody
                    elements={fromJS([])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={_noop}
                    shopperName=""
                    submit={_noop}
                />
            </Provider>
        )

        expect(getByText('TicketHeaderWrapper')).toBeInTheDocument()
        expect(getByText('TicketBodyElement 1')).toBeInTheDocument()
        expect(getByText('TicketBodyElement 2')).toBeInTheDocument()
    })

    it('should correctly pass `isLast` for the last element', () => {
        render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage, defaultMessage]),
                    }),
                })}
            >
                <TicketBody
                    elements={fromJS([defaultMessage, defaultMessage])}
                    hideTicket={() => Promise.resolve()}
                    isShopperTyping={false}
                    setStatus={_noop}
                    shopperName=""
                    submit={_noop}
                />
            </Provider>
        )

        expect(TicketBodyElement).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({isLast: false}),
            {}
        )
        expect(TicketBodyElement).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({isLast: true}),
            {}
        )
    })
})
