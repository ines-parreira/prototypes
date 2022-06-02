import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, waitFor, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Slides from 'pages/integrations/components/Detail/Slides'
import {dummyAppDetail} from 'fixtures/apps'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})

describe(`Slides`, () => {
    it('should display carousel on screenshot click, and remove it on close', async () => {
        render(
            <Provider store={store}>
                <Slides screenshots={dummyAppDetail.screenshots} isApp />
            </Provider>
        )

        fireEvent.click(screen.getAllByAltText(/Screenshot number/)[0])
        await waitFor(() => expect(screen.getAllByAltText(/Showcase number/)))
        fireEvent.click(screen.getByRole('button', {name: 'close'}))
        await waitFor(() =>
            expect(screen.queryByAltText(/Showcase number/)).toBeNull()
        )
    })

    it('should have a carousel displaying all screenshots', async () => {
        render(
            <Provider store={store}>
                <Slides screenshots={dummyAppDetail.screenshots} isApp />
            </Provider>
        )
        fireEvent.click(screen.getAllByAltText(/Screenshot number/)[0])
        await screen.findAllByAltText(/Showcase number/)
        expect(screen.getAllByAltText(/Showcase number/)).toMatchSnapshot()
    })
})
