import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {screen, render, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
            timezone: 'US/Pacific',
            has_2fa_enabled: false,
        }),
    })

    const minProps = {
        loading: false,
        disabled: false,
        on2FAEnforced: jest.fn(),
    }

    beforeAll(() => {
        const mockTime = 1685709296000 // 2023-06-02T12:34:56
        jest.useFakeTimers().setSystemTime(mockTime)
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    describe('render()', () => {
        it.each(['2023-06-02T12:34:56', null])(
            'should render turned on/off',
            (twoFAEnforcedDatetime) => {
                const {container} = render(
                    <Provider store={defaultStore}>
                        <TwoFactorAuthenticationEnforcement
                            {...minProps}
                            twoFAEnforcedDatetime={twoFAEnforcedDatetime}
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
                        twoFAEnforcedDatetime={null}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>
            )

            const toggle = screen.getByLabelText('Require 2FA for all users')
            fireEvent.click(toggle)

            // current date plus 14 days
            expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-16T12:34:56')
        })

        it('should open 2fa setup modal because user does not have it enabled and enforce 2fa on finish', async () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={defaultStore}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={null}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>
            )

            const toggle = screen.getByLabelText('Require 2FA for all users')

            fireEvent.click(toggle)

            // mock waiting for modal to be open
            await screen.findByText('TwoFactorAuthenticationModal mocked')

            // mock finish 2fa setup
            fireEvent.click(screen.getByText('Finish action mocked'))

            // current date plus 14 days
            expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-16T12:34:56')
        })
    })

    it('should disable 2fa enforcement', () => {
        const on2FAEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <TwoFactorAuthenticationEnforcement
                    {...minProps}
                    twoFAEnforcedDatetime={'2023-06-02T12:34:56'}
                    on2FAEnforced={on2FAEnforced}
                />
            </Provider>
        )

        const toggle = screen.getByLabelText('Require 2FA for all users')
        fireEvent.click(toggle)

        expect(on2FAEnforced).toHaveBeenCalledWith(null)
    })

    it('should allow to customize the enforcement datetime', () => {
        const on2FAEnforced = jest.fn()
        const store = mockStore({
            currentUser: fromJS({
                timezone: 'US/Pacific',
                has_2fa_enabled: true,
            }),
        })

        render(
            <Provider store={store}>
                <TwoFactorAuthenticationEnforcement
                    {...minProps}
                    twoFAEnforcedDatetime={'2023-06-02T12:34:56'}
                    on2FAEnforced={on2FAEnforced}
                />
            </Provider>
        )

        // Open calendar
        const toggle = screen.getByLabelText(/Enforcement time/)
        fireEvent.click(toggle)

        // Click the day 21
        const day = screen
            .getAllByText('21')
            .filter((elt) => elt.getAttribute('data-title') === 'r3c3')[0]
        userEvent.click(day)

        // Confirm choice
        const apply = screen.getByText('Apply')
        fireEvent.click(apply)

        // The seconds are lost since we don't show a second selector in the datetime picker
        expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-21T12:34:00')
    })
})
