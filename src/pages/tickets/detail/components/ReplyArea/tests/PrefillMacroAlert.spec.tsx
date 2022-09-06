import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'

import PrefillMacroAlert from '../PrefillMacroAlert'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PrefillMacroAlert />', () => {
    const defaultState: Partial<RootState> = {
        newMessage: fromJS({
            channel: 'email',
            macros: [
                {
                    id: 1,
                },
            ],
            body_html: '<div>Hello Shopper</div>',
            body_text: 'Hello Shopper',
        }),
    } as RootState

    it('should render alert', () => {
        const {baseElement} = render(
            <Provider store={mockStore(defaultState)}>
                <PrefillMacroAlert
                    onKeepMacro={jest.fn()}
                    onRemoveMacro={jest.fn()}
                />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should call prop callback', () => {
        const handleKeepMacro = jest.fn()
        const handleRemoveMacro = jest.fn()

        render(
            <Provider store={mockStore(defaultState)}>
                <PrefillMacroAlert
                    onKeepMacro={handleKeepMacro}
                    onRemoveMacro={handleRemoveMacro}
                />
            </Provider>
        )

        fireEvent.click(screen.getByText(/keep macro/i))
        fireEvent.click(screen.getByText(/remove macro/i))

        expect(handleRemoveMacro).toHaveBeenCalled()
        expect(handleKeepMacro).toHaveBeenCalled()
    })
})
