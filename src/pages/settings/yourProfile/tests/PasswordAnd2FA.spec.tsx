import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import PasswordAnd2FA from '../PasswordAnd2FA'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PasswordAnd2FA />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it.each([true, false])(
            'should render with or without change password based on if the user has or not a password',
            (hasPassword) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_password: hasPassword,
                    }),
                })

                const {container} = render(
                    <Provider store={store}>
                        <PasswordAnd2FA />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )

        it.each(['acme', 'some-unauthorized-domain-for-2fa'])(
            'should render with or without 2FA section based on account access to the feature',
            (domain) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_password: true,
                    }),
                    currentAccount: fromJS({domain: domain}),
                })

                const {container} = render(
                    <Provider store={store}>
                        <PasswordAnd2FA />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })
})
