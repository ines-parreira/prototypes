import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {screen, render, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import TwoFactorAuthenticationEnforcement from 'pages/settings/access/TwoFactorAuthenticationEnforcement'
import {OwnProps} from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

jest.mock(
    'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal',
    () => (props: OwnProps) => {
        return (
            props.isOpen && (
                <div>
                    TwoFactorAuthenticationModal mocked
                    <button type="button" onClick={props.onFinish}>
                        Finish action mocked
                    </button>
                </div>
            )
        )
    }
)

describe('<TwoFactorAuthenticationEnforcement />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const defaultStore = mockStore({
        currentUser: fromJS({
            has_2fa_enabled: false,
        }),
    })

    const minProps = {
        loading: false,
        disabled: false,
        on2FAEnforced: jest.fn(),
    }

    describe('render()', () => {
        it.each([true, false])(
            'should render turned on/off',
            (is2FAEnforced) => {
                const {container} = render(
                    <Provider store={defaultStore}>
                        <TwoFactorAuthenticationEnforcement
                            {...minProps}
                            is2FAEnforced={is2FAEnforced}
                        />
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            }
        )

        it('should enforce 2fa', () => {
            const on2FAEnforced = jest.fn()
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: true,
                }),
            })

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        is2FAEnforced={false}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>
            )

            const toggle = screen.getByLabelText('Enforce 2FA for all users')

            fireEvent.click(toggle)

            expect(on2FAEnforced).toHaveBeenCalledWith(true)
        })

        it('should open 2fa setup modal because user does not have it enabled and enforce 2fa on finish', async () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={defaultStore}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        is2FAEnforced={false}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>
            )

            const toggle = screen.getByLabelText('Enforce 2FA for all users')

            fireEvent.click(toggle)

            // mock waiting for modal to be open
            await screen.findByText('TwoFactorAuthenticationModal mocked')

            // mock finish 2fa setup
            fireEvent.click(screen.getByText('Finish action mocked'))

            expect(on2FAEnforced).toHaveBeenCalledWith(true)
        })
    })
})
