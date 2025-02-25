import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketMessageSourceType } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/constants'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'

jest.mock('../ReplyArea/PhoneTicketSubmitButtons', () => () => (
    <div>PhoneTicketSubmitButtons</div>
))

const mockStore = configureMockStore([thunk])

describe('<ReplyForm />', () => {
    const defaultState = {
        ticket: fromJS({}),
    }

    const phoneState = {
        integrations: fromJS({
            integrations: [{ id: 1, type: IntegrationType.Phone }],
        }),
        newMessage: fromJS({
            newMessage: {
                source: { type: TicketMessageSourceType.Phone },
            },
        }),
    }

    it('should render phone submit buttons', () => {
        const { getByText, queryByText } = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    ...phoneState,
                })}
            >
                <ReplyForm>
                    <p>Children</p>
                </ReplyForm>
            </Provider>,
        )

        expect(getByText('PhoneTicketSubmitButtons')).toBeInTheDocument()
        expect(queryByText('Children')).not.toBeInTheDocument()
    })

    it('should render given children', () => {
        const { getByText, queryByText } = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                })}
            >
                <ReplyForm>
                    <p>Children</p>
                </ReplyForm>
            </Provider>,
        )

        expect(getByText('Children')).toBeInTheDocument()
        expect(queryByText('PhoneTicketSubmitButtons')).not.toBeInTheDocument()
    })
})
