import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {render, fireEvent, screen} from '@testing-library/react'

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

window.GORGIAS_CONSTANTS = {
    INTENTS: {
        'foo/intent': 'foo intent description',
    },
}

const renderOpenedDropdown = ({
    showPrivateReplyAction = true,
    showHideAction = true,
    showIntentsAction = true,
    collapseIntents = true,
} = {}) => {
    const {container} = render(
        <Provider store={store}>
            <CollapsedSourceActions
                message={message}
                showPrivateReplyAction={showPrivateReplyAction}
                showHideAction={showHideAction}
                showIntentsAction={showIntentsAction}
                shouldHide={false}
                isFacebookComment={false}
                collapseIntents={collapseIntents}
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

    it('content should move between intents and all options', () => {
        const container = renderOpenedDropdown()

        fireEvent.click(screen.getByText('See detected intents'))

        expect(container.firstChild).toMatchSnapshot()

        fireEvent.click(screen.getByText('arrow_back'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('content should move between intents and all options', () => {
        const container = renderOpenedDropdown()

        fireEvent.click(screen.getByText('See detected intents'))

        expect(container.firstChild).toMatchSnapshot()

        fireEvent.click(screen.getByText('arrow_back'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('content should be intents if no other option is available', () => {
        const container = renderOpenedDropdown({
            showPrivateReplyAction: false,
            showHideAction: false,
            showIntentsAction: true,
            collapseIntents: true,
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render any options', () => {
        const container = renderOpenedDropdown({
            showPrivateReplyAction: false,
            showHideAction: false,
            showIntentsAction: false,
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render any options if only intents are allowed but not yet collapsed', () => {
        const container = renderOpenedDropdown({
            showPrivateReplyAction: false,
            showHideAction: false,
            showIntentsAction: true,
            collapseIntents: false,
        })
        expect(container.firstChild).toMatchSnapshot()
    })
})
