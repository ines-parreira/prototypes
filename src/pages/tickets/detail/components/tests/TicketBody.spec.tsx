import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import React from 'react'
import {Provider} from 'react-redux'
import {VirtuosoProps} from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {message as defaultMessage} from 'models/ticket/tests/mocks'
import TicketBodyVirtualized from 'pages/tickets/detail/components/TicketBodyVirtualized'

const mockStore = configureMockStore([thunk])

jest.mock(
    'pages/tickets/detail/components/TicketBodyElement',
    () =>
        ({index}: {index: number}) =>
            <p>TicketBodyElement {index}</p>
)

jest.mock('pages/tickets/detail/components/TicketHeaderWrapper', () => () => (
    <p>TicketHeaderWrapper</p>
))

jest.mock('react-virtuoso', () => {
    const {forwardRef} = jest.requireActual('react')
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    function Virtuoso(props: VirtuosoProps<unknown, unknown>, _ref: any) {
        return (
            <>
                {props.data?.map((value, index) =>
                    props.itemContent?.(index, value, undefined)
                )}
            </>
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return {Virtuoso: forwardRef(Virtuoso)}
})

describe('TicketBody', () => {
    it('should render an element for each given element', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ticket: fromJS({
                        messages: fromJS([defaultMessage, defaultMessage]),
                    }),
                })}
            >
                <TicketBodyVirtualized
                    elements={fromJS([])}
                    handleHistoryToggle={_noop}
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
})
