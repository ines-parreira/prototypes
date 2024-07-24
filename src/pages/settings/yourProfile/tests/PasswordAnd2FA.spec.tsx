import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'
import {assumeMock, renderWithRouter} from 'utils/testing'
import PasswordAnd2FA from '../PasswordAnd2FA'
import ChangePasswordContainer from '../ChangePassword'

jest.mock('../ChangePassword', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

const ChangePasswordContainerMock = assumeMock(ChangePasswordContainer)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PasswordAnd2FA />', () => {
    describe('render()', () => {
        it.each([true, false])(
            'should render with or without change password based on if the user has or not a password',
            (hasPassword) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_password: hasPassword,
                    }),
                })

                renderWithRouter(
                    <Provider store={store}>
                        <PasswordAnd2FA />
                    </Provider>
                )

                // test page title
                expect(
                    screen.getByText(hasPassword ? 'Password & 2FA' : '2FA')
                ).toBeInTheDocument()

                expect(ChangePasswordContainerMock).toHaveBeenCalledTimes(
                    hasPassword ? 1 : 0
                )
            }
        )

        it.each([true, false])(
            'should always render with 2FA section',
            (hasPassword) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_password: hasPassword,
                    }),
                })

                renderWithRouter(
                    <Provider store={store}>
                        <PasswordAnd2FA />
                    </Provider>
                )

                // test label presence
                expect(screen.getByText('2FA Disabled')).toBeInTheDocument()
                // test action button presence
                expect(screen.getByText('Enable 2FA')).toBeInTheDocument()
            }
        )

        it('should always render with 2FA section according to 2fa status', () => {
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: true,
                }),
            })
            renderWithRouter(
                <Provider store={store}>
                    <PasswordAnd2FA />
                </Provider>
            )

            // test label presence
            expect(screen.getByText('2FA Enabled')).toBeInTheDocument()
            // test action button presence
            expect(screen.getByText('Disable 2FA')).toBeInTheDocument()
        })
    })
})
