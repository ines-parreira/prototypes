import React from 'react'

import {fireEvent, screen, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {ContentState} from 'draft-js'
import {emailTicket} from 'state/ticket/tests/fixtures'
import {toJS} from 'utils'
import {setMeta, setResponseText} from 'state/newMessage/actions'
import AISuggestion from '../AISuggestion'

jest.mock('state/newMessage/actions.ts')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

const mockStore = configureMockStore([thunk])
const store = {
    ui: {editor: {isFocused: false}},
    ticket: fromJS({_internal: {isPartialUpdating: false}}),
    newMessage: fromJS({
        state: {contentState: ContentState.createFromText('')},
    }),
}

const ticket = {
    ...emailTicket.toJS(),
    meta: {ai_suggestion: {body_text: 'suggested text'}},
}

const minProps = {
    ticket,
}

describe('AISuggestion', () => {
    it('should display AISuggestion', () => {
        const {container} = render(
            <Provider store={mockStore(store)}>
                <AISuggestion {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should not display AISuggestion (no suggestion)', () => {
        const {container} = render(
            <Provider store={mockStore(store)}>
                <AISuggestion ticket={toJS(emailTicket)} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should set response text when clicked', () => {
        render(
            <Provider store={mockStore(store)}>
                <AISuggestion {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/Copy/))
        expect(setResponseText as jest.Mock).toHaveBeenCalled()
        expect(setMeta as jest.Mock).toHaveBeenCalled()
    })
})
