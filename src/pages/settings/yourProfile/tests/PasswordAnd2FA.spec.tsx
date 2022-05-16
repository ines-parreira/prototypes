import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
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

                const {container} = renderWithRouter(
                    <Provider store={store}>
                        <PasswordAnd2FA />
                    </Provider>
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )

        it('should always render with 2FA section', () => {
            const store = mockStore({
                currentUser: fromJS({
                    has_password: true,
                }),
            })

            const {container} = renderWithRouter(
                <Provider store={store}>
                    <PasswordAnd2FA />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
