import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {Map} from 'immutable'
import {fireEvent, render, screen} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'

import Tip from '../Tip'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentUser: Map({
        id: 1,
    }),
} as RootState

const renderTip = () =>
    render(
        <Provider store={mockStore(defaultState)}>
            <Tip icon={true} actionLabel="Got It" storageKey="test">
                test
            </Tip>
        </Provider>
    )

describe('<Tip/>', () => {
    it('should not render another instance after closing', () => {
        const {container} = renderTip()

        fireEvent.click(screen.getByText('Got It'))

        expect(container.firstChild).toBeNull()

        const {container: secondContainer} = renderTip()

        expect(secondContainer.firstChild).toBeNull()
    })
})
