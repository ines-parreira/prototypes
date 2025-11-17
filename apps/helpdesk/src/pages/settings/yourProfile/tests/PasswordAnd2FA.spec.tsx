import { assumeMock } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ChangePasswordContainer from '../ChangePassword'
import PasswordAnd2FA from '../PasswordAnd2FA'

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
                    </Provider>,
                )

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
                const store = mockStore({
                    currentUser: fromJS({
                        has_password: hasPassword,
                    }),
                })

                renderWithRouter(
                    <Provider store={store}>
                        <PasswordAnd2FA />
                    </Provider>,
                )

                // test label presence
                expect(screen.getByText('2FA Disabled')).toBeInTheDocument()
                // test action button presence
                expect(screen.getByText('Enable 2FA')).toBeInTheDocument()
            },
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
                </Provider>,
            )

            // test label presence
            expect(screen.getByText('2FA Enabled')).toBeInTheDocument()
            // test action button presence
            expect(screen.getByText('Disable 2FA')).toBeInTheDocument()
        })
    })

    describe('Identity verification', () => {
        const store = mockStore({
            currentUser: fromJS({}),
        })

        it('should not show the modal when the login is recent', () => {
            window.AUTH_TIME = Date.now() / 1000

            renderWithRouter(
                <Provider store={store}>
                    <PasswordAnd2FA />
                </Provider>,
            )

            expect(
                screen.queryByText('Verify Your Identity'),
            ).not.toBeInTheDocument()
        })

        it('should show the modal when the login is old', () => {
            window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60

            renderWithRouter(
                <Provider store={store}>
                    <PasswordAnd2FA />
                </Provider>,
            )

            expect(
                screen.queryByText('Verify Your Identity'),
            ).toBeInTheDocument()
        })

        it('should trigger a fresh login when clicking Continue', () => {
            window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60

            renderWithRouter(
                <Provider store={store}>
                    <PasswordAnd2FA />
                </Provider>,
            )
            fireEvent.click(screen.getByText('Continue'))

            expect(window.location.href).toContain('/login/fresh')
        })

        it('should navigate to the previous page when clicking Back', () => {
            const history = createMemoryHistory({
                initialEntries: ['/previous', '/settings'],
                initialIndex: 1,
            })
            window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60

            renderWithRouter(
                <Provider store={store}>
                    <PasswordAnd2FA />
                </Provider>,
                { history },
            )

            expect(history.location.pathname).toBe('/settings')
            fireEvent.click(screen.getByText('Back'))
            expect(history.location.pathname).toBe('/previous')
        })
    })
})
