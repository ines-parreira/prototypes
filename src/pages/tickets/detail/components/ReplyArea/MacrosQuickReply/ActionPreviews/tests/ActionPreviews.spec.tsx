import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {StoreDispatch, RootState} from '../../../../../../../../state/types'
import {ActionPreviews} from '../ActionPreviews'

import {
    setStatusAction,
    setTextAction,
} from '../../../../../../../../fixtures/macro'

jest.mock('draft-js/lib/generateRandomKey', () => () => '42')

describe('<ActionPreviews />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    let store = mockStore({})
    const minProps: ComponentProps<typeof ActionPreviews> = {
        textPreviewMinWidth: 200,
        actions: [],
    }
    beforeEach(() => {
        store = mockStore({})
    })
    it.each([
        ['set text action', [setTextAction]],
        ['other type of action', [setStatusAction]],
        [
            'both set text action and other type of action',
            [setTextAction, setStatusAction],
        ],
    ])('should render %s ', (_, actions) => {
        const {container} = render(
            <Provider store={store}>
                <ActionPreviews {...minProps} actions={actions} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
