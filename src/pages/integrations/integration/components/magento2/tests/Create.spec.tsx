import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Create from '../Create'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<Create/>', () => {
    const minProps: ComponentProps<typeof Create> = {
        integration: fromJS({}),
        loading: fromJS({}),
        redirectUri: '',
    }

    it('should show the one click editor when clicking on the related button', () => {
        render(
            <Provider store={store}>
                <Create {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText('Connect in 1 click'))
        expect(screen.queryByLabelText(/Consumer key/)).toBe(null)
    })

    it('should show the manual editor when clicking on the related button', () => {
        render(
            <Provider store={store}>
                <Create {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText('Connect manually'))
        expect(screen.getByLabelText(/Consumer key/))
    })
})
