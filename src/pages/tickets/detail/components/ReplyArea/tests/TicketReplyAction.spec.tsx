import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {createEvent, fireEvent, render} from '@testing-library/react'

import {MacroActionName} from 'models/macroAction/types'

import TicketReplyAction from '../TicketReplyAction'

const mockedDebounce = jest.fn()

jest.mock('lodash/debounce', () => () => mockedDebounce)

describe('<TicketReplyAction />', () => {
    const mockStore = configureMockStore([thunk])

    it('should debounce the internal note update', () => {
        const mockedUpdate = jest.fn()

        const {container} = render(
            <Provider store={mockStore({})}>
                <TicketReplyAction
                    action={fromJS({
                        name: MacroActionName.AddInternalNote,
                        arguments: {},
                    })}
                    index={1}
                    remove={jest.fn()}
                    ticketId={1}
                    update={mockedUpdate}
                />
            </Provider>
        )
        const editor = container.querySelector('.public-DraftEditor-content')!
        const event = createEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => 'hello',
            },
        })

        fireEvent(editor, event)
        fireEvent(editor, event)

        expect(mockedDebounce).toHaveBeenCalledTimes(3)
    })
})
