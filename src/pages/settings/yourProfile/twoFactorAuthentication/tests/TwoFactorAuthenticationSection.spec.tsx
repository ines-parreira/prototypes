import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {AccountSettingType} from 'state/currentAccount/types'
import TwoFactorAuthenticationSection from '../TwoFactorAuthenticationSection'
import {OwnProps} from '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

jest.mock(
    'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationModal/TwoFactorAuthenticationModal',
    () => (props: OwnProps) => {
        return (
            props.isOpen && (
                <div>
                    TwoFactorAuthenticationModal mocked
                    {props.initialBannerText ? (
                        <p data-testid="banner-text">
                            {props.initialBannerText}
                        </p>
                    ) : null}
                    <button type="button" onClick={props.onFinish}>
                        Finish action mocked
                    </button>
                </div>
            )
        )
    }
)

describe('<TwoFactorAuthenticationSection />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    describe('render()', () => {
        it.each([true, false])(
            'should render the Two-Factor Authentication Section with status tag',
            (has2FAEnabled) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: has2FAEnabled,
                    }),
                })

                const {baseElement} = renderWithRouter(
                    <Provider store={store}>
                        <TwoFactorAuthenticationSection />
                    </Provider>
                )

                expect(baseElement).toMatchSnapshot()
            }
        )

        it.each([true, false])(
            'should open the Two-Factor Authentication Modal via Enable or Update button',
            async (has2FAEnabled) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: has2FAEnabled,
                    }),
                })

                const {baseElement, findByText} = renderWithRouter(
                    <Provider store={store}>
                        <TwoFactorAuthenticationSection />
                    </Provider>
                )

                const button = await findByText(
                    has2FAEnabled ? /Update 2FA/ : /Enable 2FA/
                )
                fireEvent.click(button)

                expect(baseElement).toMatchSnapshot()
            }
        )

        it.each([true, false])(
            'should open or not the Two-Factor Authentication Modal via queryParam',
            (has2FAEnabled) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: has2FAEnabled,
                    }),
                })

                renderWithRouter(
                    <Provider store={store}>
                        <TwoFactorAuthenticationSection />
                    </Provider>,
                    {
                        path: 'app/settings/password-2fa',
                        route: 'app/settings/password-2fa?enforce_2fa_setup_modal=true',
                    }
                )

                const modalQuery = screen.queryByText(
                    /TwoFactorAuthenticationModal mocked/
                )

                if (has2FAEnabled) {
                    expect(modalQuery).toBeNull()
                } else {
                    expect(modalQuery).not.toBeNull()
                }
            }
        )

        it('should show the enforcement message', () => {
            jest.resetAllMocks()
            const store = mockStore({
                currentAccount: fromJS({
                    settings: [
                        {
                            type: AccountSettingType.Access,
                            data: {
                                two_fa_enforced_datetime: '2024-08-16T15:00:00',
                            },
                        },
                    ],
                }),
                currentUser: fromJS({
                    has_2fa_enabled: false,
                }),
            })

            const {getByTestId} = renderWithRouter(
                <Provider store={store}>
                    <TwoFactorAuthenticationSection />
                </Provider>,
                {
                    path: 'app/settings/password-2fa',
                    route: 'app/settings/password-2fa?enforce_2fa_setup_modal=true',
                }
            )

            expect(getByTestId('banner-text').textContent).toContain(
                'by August 16, 2024.'
            )
        })
    })
})
