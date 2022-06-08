import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'

import {message} from 'models/ticket/tests/mocks'

import CollapsedSourceActions from '../CollapsedSourceActions'

import {TicketMessageIntent} from '../../../../../../../models/ticket/types'

import client from '../../../../../../../models/api/resources'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

const postMock = jest.spyOn(client, 'post')

const messageIntents: TicketMessageIntent[] = [
    {
        name: 'foo/intent',
        is_user_feedback: true,
        rejected: false,
    },
]

const renderOpenedDropdown = ({
    showPrivateReplyAction = true,
    showHideAction = true,
} = {}) => {
    const {container} = render(
        <Provider store={store}>
            <CollapsedSourceActions
                message={message}
                showPrivateReplyAction={showPrivateReplyAction}
                showHideAction={showHideAction}
                shouldHide={false}
                isInstagramComment={true}
                isFacebookComment={false}
                toggleHideComment={() => ({})}
            />
        </Provider>
    )

    return container
}

describe('CollapsedSourceActions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        postMock.mockResolvedValue({data: {intents: messageIntents}})
        message.intents = messageIntents
    })

    it('should not render any options', () => {
        const container = renderOpenedDropdown({
            showPrivateReplyAction: false,
            showHideAction: false,
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render all options', () => {
        const container = renderOpenedDropdown({
            showPrivateReplyAction: true,
            showHideAction: true,
        })
        expect(container.firstChild).toMatchSnapshot()
    })
})
