import React from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    duplicatedHiddenFacebookMessage,
    message,
} from 'models/ticket/tests/mocks'
import Meta from 'pages/tickets/detail/components/TicketMessages/Meta'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

import Header from '../Header'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

jest.mock('pages/tickets/detail/components/TicketMessages/Meta')
jest.mock(
    'pages/tickets/detail/components/TicketMessages/SourceActionsHeader',
    () => ({
        default: () => null,
    }),
)
jest.mock(
    'pages/tickets/detail/components/TicketMessages/SourceDetailsHeader',
    () => () => null,
)
const metaMock = assumeMock(Meta)

describe('Header', () => {
    beforeEach(() => {
        metaMock.mockImplementation(() => <div></div>)
    })

    it('should display header', () => {
        const { container } = render(
            <Provider store={store}>
                <Header
                    id="some-header"
                    message={message}
                    timezone="America/Los_Angeles"
                    isMessageHidden={false}
                    isMessageDeleted={false}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display header with metaContent = "Message hidden"', () => {
        const { container } = render(
            <Provider store={store}>
                <Header
                    id="some-header"
                    message={message}
                    timezone="America/Los_Angeles"
                    isMessageHidden={true}
                    isMessageDeleted={false}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display header with metaContent = "Message hidden" because the message is duplicated', () => {
        const { container } = render(
            <Provider store={store}>
                <Header
                    id="some-header"
                    message={duplicatedHiddenFacebookMessage}
                    timezone="America/Los_Angeles"
                    isMessageHidden={true}
                    isMessageDeleted={false}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display header with metaContent = "Comment deleted on Facebook"', () => {
        const { container } = render(
            <Provider store={store}>
                <Header
                    id="some-header"
                    message={message}
                    timezone="America/Los_Angeles"
                    isMessageHidden={false}
                    isMessageDeleted={true}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should pass the correct message id to Meta', () => {
        render(
            <Provider store={store}>
                <Header
                    id="some-header"
                    message={message}
                    timezone="America/Los_Angeles"
                    isMessageHidden={false}
                    isMessageDeleted={false}
                />
            </Provider>,
        )

        expect(metaMock).toHaveBeenCalledWith(
            expect.objectContaining({ messageId: message.message_id }),
            expect.any(Object),
        )
    })

    it('should correctly display intents', () => {
        const { container } = render(
            <Provider store={store}>
                <Header
                    id="some-header"
                    message={message}
                    timezone="America/Los_Angeles"
                    isMessageHidden={false}
                    isMessageDeleted={false}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
