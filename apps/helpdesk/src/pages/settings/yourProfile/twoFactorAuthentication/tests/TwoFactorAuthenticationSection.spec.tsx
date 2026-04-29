import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'

import { AccountSettingType } from 'state/currentAccount/types'

import type { OwnProps } from '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import TwoFactorAuthenticationSection from '../TwoFactorAuthenticationSection'

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
    },
)
describe('<TwoFactorAuthenticationSection />', () => {
    beforeAll(() => {
        window.AUTH_TIME = Date.now() / 1000
    })
    describe('render()', () => {
        it.each([true, false])(
            'should render the Two-Factor Authentication Section with status tag',
            (has2FAEnabled) => {
                const { baseElement } = render(
                    <TwoFactorAuthenticationSection />,
                    {
                        storeState: {
                            currentUser: fromJS({
                                has_2fa_enabled: has2FAEnabled,
                            }),
                        },
                    },
                )
                expect(baseElement).toMatchSnapshot()
            },
        )
        it.each([true, false])(
            'should open the Two-Factor Authentication Modal via Enable or Update button',
            async (has2FAEnabled) => {
                const { baseElement, findByText } = render(
                    <TwoFactorAuthenticationSection />,
                    {
                        storeState: {
                            currentUser: fromJS({
                                has_2fa_enabled: has2FAEnabled,
                            }),
                        },
                    },
                )
                const button = await findByText(
                    has2FAEnabled ? /Update 2FA/ : /Enable 2FA/,
                )
                fireEvent.click(button)
                expect(baseElement).toMatchSnapshot()
            },
        )
        it('should not open the Two-Factor Authentication Modal for the Gorgias Agent', async () => {
            const { findByText } = render(<TwoFactorAuthenticationSection />, {
                storeState: {
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                        role: { name: 'internal-agent' },
                    }),
                },
            })
            const button = await findByText(/Enable 2FA/)
            fireEvent.click(button)
            const modalQuery = screen.queryByText(
                /TwoFactorAuthenticationModal mocked/,
            )
            expect(modalQuery).toBeNull()
        })
        it.each([true, false])(
            'should open or not the Two-Factor Authentication Modal via queryParam',
            (has2FAEnabled) => {
                render(<TwoFactorAuthenticationSection />, {
                    path: 'app/settings/password-2fa',
                    initialEntries: [
                        'app/settings/password-2fa?enforce_2fa_setup_modal=true',
                    ],
                    storeState: {
                        currentUser: fromJS({
                            has_2fa_enabled: has2FAEnabled,
                        }),
                    },
                })
                const modalQuery = screen.queryByText(
                    /TwoFactorAuthenticationModal mocked/,
                )
                if (has2FAEnabled) {
                    expect(modalQuery).toBeNull()
                } else {
                    expect(modalQuery).not.toBeNull()
                }
            },
        )
        it('should show the enforcement message without the date', () => {
            const { getByTestId } = render(<TwoFactorAuthenticationSection />, {
                path: 'app/settings/password-2fa',
                initialEntries: [
                    'app/settings/password-2fa?enforce_2fa_setup_modal=true',
                ],
                storeState: {
                    currentAccount: fromJS({
                        settings: [
                            {
                                type: AccountSettingType.Access,
                                data: {
                                    two_fa_enforced_datetime:
                                        '2024-08-16T15:00:00',
                                },
                            },
                        ],
                    }),
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                    }),
                },
            })
            expect(getByTestId('banner-text').textContent).not.toContain(
                'by August 16, 2024.',
            )
            expect(getByTestId('banner-text').textContent).not.toContain(
                'For security reasons, your admin requires you to set up two-factor authentication to access your account by.',
            )
        })
        it('should show the enforcement message', () => {
            const tomorrow = new Date(Date.now() + 86400000)
            const { getByTestId } = render(<TwoFactorAuthenticationSection />, {
                path: 'app/settings/password-2fa',
                initialEntries: [
                    'app/settings/password-2fa?enforce_2fa_setup_modal=true',
                ],
                storeState: {
                    currentAccount: fromJS({
                        settings: [
                            {
                                type: AccountSettingType.Access,
                                data: {
                                    two_fa_enforced_datetime: tomorrow
                                        .toISOString()
                                        .slice(0, 19),
                                },
                            },
                        ],
                    }),
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                    }),
                },
            })
            const formattedDate = moment(tomorrow).format('MMMM D, YYYY')
            expect(getByTestId('banner-text').textContent).toContain(
                `by ${formattedDate}.`,
            )
        })
    })
})
