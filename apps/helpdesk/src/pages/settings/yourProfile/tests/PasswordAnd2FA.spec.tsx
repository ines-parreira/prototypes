import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import ChangePasswordContainer from '../ChangePassword'
import PasswordAnd2FA from '../PasswordAnd2FA'

jest.mock('../ChangePassword', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))
const ChangePasswordContainerMock = assumeMock(ChangePasswordContainer)
const LocationPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
describe('<PasswordAnd2FA />', () => {
    beforeEach(() => {
        ChangePasswordContainerMock.mockClear()
    })
    describe('render()', () => {
        it.each([true, false])(
            'should render with or without change password based on if the user has or not a password',
            (hasPassword) => {
                render(<PasswordAnd2FA />, {
                    storeState: {
                        currentUser: fromJS({
                            has_password: hasPassword,
                        }),
                    },
                })
                // test page title
                expect(
                    screen.getByText(hasPassword ? 'Password & 2FA' : '2FA'),
                ).toBeInTheDocument()
                expect(ChangePasswordContainerMock).toHaveBeenCalledTimes(
                    hasPassword ? 1 : 0,
                )
            },
        )
        it.each([true, false])(
            'should always render with 2FA section',
            (hasPassword) => {
                render(<PasswordAnd2FA />, {
                    storeState: {
                        currentUser: fromJS({
                            has_password: hasPassword,
                        }),
                    },
                })
                // test label presence
                expect(screen.getByText('2FA Disabled')).toBeInTheDocument()
                // test action button presence
                expect(screen.getByText('Enable 2FA')).toBeInTheDocument()
            },
        )
        it('should always render with 2FA section according to 2fa status', () => {
            render(<PasswordAnd2FA />, {
                storeState: {
                    currentUser: fromJS({
                        has_2fa_enabled: true,
                    }),
                },
            })
            // test label presence
            expect(screen.getByText('2FA Enabled')).toBeInTheDocument()
            // test action button presence
            expect(screen.getByText('Disable 2FA')).toBeInTheDocument()
        })
    })
    describe('Identity verification', () => {
        const storeState = {
            currentUser: fromJS({}),
        }

        it('should not show the modal when the login is recent', () => {
            window.AUTH_TIME = Date.now() / 1000
            render(<PasswordAnd2FA />, { storeState })
            expect(
                screen.queryByText('Verify Your Identity'),
            ).not.toBeInTheDocument()
        })
        it('should show the modal when the login is old', () => {
            window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60
            render(<PasswordAnd2FA />, { storeState })
            expect(
                screen.queryByText('Verify Your Identity'),
            ).toBeInTheDocument()
        })
        it('should trigger a fresh login when clicking Continue', () => {
            window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60
            render(<PasswordAnd2FA />, { storeState })
            fireEvent.click(screen.getByText('Continue'))
            expect(window.location.href).toContain('/login/fresh')
        })
        it('should navigate to the previous page when clicking Back', () => {
            window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60
            render(
                <>
                    <PasswordAnd2FA />
                    <LocationPath />
                </>,
                {
                    initialEntries: [
                        '/app/settings/profile',
                        '/app/settings/profile/password',
                    ],
                    storeState,
                },
            )
            fireEvent.click(screen.getByText('Back'))
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/profile',
            )
        })
    })
})
