import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TwoFactorAuthenticationEnforcement from 'pages/settings/access/TwoFactorAuthenticationEnforcement'
import { OwnProps } from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import { TWO_FA_REQUIRED_AFTER_DAYS } from 'state/currentUser/constants'
import { RootState, StoreDispatch } from 'state/types'

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
    },
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
                const { container } = render(
                    <Provider store={defaultStore}>
                        <TwoFactorAuthenticationEnforcement
                            {...minProps}
                            twoFAEnforcedDatetime={twoFAEnforcedDatetime}
                        />
                    </Provider>,
                )

                expect(container).toMatchSnapshot()
            },
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
                </Provider>,
            )

            const toggle = screen.getByLabelText('Require 2FA for all users')
            fireEvent.click(toggle)

            // current date plus 14 days
            expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-16T12:34:56')
        })

        it('should be disabled for the Gorgias agent', () => {
            const on2FAEnforced = jest.fn()
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                    role: { name: 'internal-agent' },
                }),
            })

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={null}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )

            const toggle = screen.getByLabelText('Require 2FA for all users')
            expect(toggle).toHaveProperty('disabled')
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
                </Provider>,
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
            </Provider>,
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
            </Provider>,
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

    describe('Early enforcement check', () => {
        const store = mockStore({
            currentUser: fromJS({
                timezone: 'US/Pacific',
                has_2fa_enabled: true,
            }),
        })

        const performEnforcementFlow = () => {
            // Open calendar
            fireEvent.click(screen.getByLabelText(/Enforcement time/))

            // Click the day 11 (less than 14 days away)
            const day = screen
                .getAllByText('12')
                .filter((elt) => elt.getAttribute('data-title') === 'r2c1')[0]
            userEvent.click(day)

            // Confirm choice
            fireEvent.click(screen.getByText('Apply'))
        }

        it('should show the confirmation popover when setting a value less than 14 days away', () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={'2023-06-02T12:34:56'}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )
            performEnforcementFlow()

            expect(
                screen.getByText('Confirm Enforcement Time'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Review' }),
            ).toBeInTheDocument()
            expect(on2FAEnforced).not.toHaveBeenCalled()
        })

        it('should not warn when using the default recommended value', () => {
            const on2FAEnforced = jest.fn()
            const recommendedEnforcement = moment()
                .add(TWO_FA_REQUIRED_AFTER_DAYS, 'days')
                .toISOString()

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={recommendedEnforcement}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )

            // Open the calendar and direcly re-apply the same date
            fireEvent.click(screen.getByLabelText(/Enforcement time/))
            fireEvent.click(screen.getByText('Apply'))

            expect(
                screen.queryByText('Confirm Enforcement Time'),
            ).not.toBeInTheDocument()
            expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-16T12:34:00')
        })

        it('should not warn when not changing the current date', () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={'2023-06-12T12:34:00'}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )

            // Open the calendar and direcly re-apply the same date
            fireEvent.click(screen.getByLabelText(/Enforcement time/))
            fireEvent.click(screen.getByText('Apply'))

            expect(
                screen.queryByText('Confirm Enforcement Time'),
            ).not.toBeInTheDocument()
            expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-12T12:34:00')
        })

        it('should re-open the date picker when clicking the review button', () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={'2023-06-02T12:34:56'}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )
            performEnforcementFlow()

            fireEvent.click(screen.getByRole('button', { name: 'Review' }))

            expect(screen.getByText('Apply')).toBeInTheDocument()
            expect(on2FAEnforced).not.toHaveBeenCalled()
        })

        it('should re-open the date picker when clicking outside of the popover', () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={'2023-06-02T12:34:56'}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )
            performEnforcementFlow()

            fireEvent.click(screen.getByText(/Two-Factor Authentication/))

            expect(screen.getByText('Apply')).toBeInTheDocument()
            expect(on2FAEnforced).not.toHaveBeenCalled()
        })

        it('should save the value when clicking the confirm button', () => {
            const on2FAEnforced = jest.fn()

            render(
                <Provider store={store}>
                    <TwoFactorAuthenticationEnforcement
                        {...minProps}
                        twoFAEnforcedDatetime={'2023-06-02T12:34:56'}
                        on2FAEnforced={on2FAEnforced}
                    />
                </Provider>,
            )
            performEnforcementFlow()

            fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
            jest.runAllTimers() // Wait for the popover to close

            expect(on2FAEnforced).toHaveBeenCalledWith('2023-06-12T12:34:00')
        })
    })
})
