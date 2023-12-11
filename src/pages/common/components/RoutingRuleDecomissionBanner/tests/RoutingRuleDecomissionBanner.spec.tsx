import {cleanup, fireEvent, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {mockStore, renderWithRouter} from 'utils/testing'
import {IntegrationType} from 'models/integration/constants'
import * as hooks from 'common/hooks'
import {UserRole} from 'config/types/user'
import * as utils from 'utils'
import RoutingRuleDecomissionBanner from '../RoutingRuleDecomissionBanner'

const isAdminSpy = jest.spyOn(utils, 'isAdmin')
const usePersistedStateSpy = jest.spyOn(hooks, 'usePersistedState')

describe('RoutingRuleDecomissionBanner', () => {
    afterEach(cleanup)

    it('should always render banner when there are phone integrations for admins', () => {
        usePersistedStateSpy.mockReturnValue([false, jest.fn()])
        isAdminSpy.mockReturnValue(true)

        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                type: IntegrationType.Phone,
                            },
                        ],
                    }),
                    currentUser: fromJS({name: UserRole.Admin}),
                } as any)}
            >
                <RoutingRuleDecomissionBanner />
            </Provider>
        )
        expect(
            screen.getByText(/routing rules will no longer be in use/i)
        ).toBeVisible()

        const closeIcon = screen.queryByRole('img', {
            name: /close\-icon/i,
        })
        expect(closeIcon).toBeNull()
    })

    it('should not render banner for non-admins if they previously dismissed it', () => {
        usePersistedStateSpy.mockReturnValue([false, jest.fn()])
        isAdminSpy.mockReturnValue(false)

        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                type: IntegrationType.Phone,
                            },
                        ],
                    }),
                    currentUser: fromJS({name: UserRole.Agent}),
                } as any)}
            >
                <RoutingRuleDecomissionBanner />
            </Provider>
        )
        expect(
            screen.queryByText(/routing rules will no longer be in use/i)
        ).toBeNull()
    })

    it('non-admins should be able to dismiss banner', () => {
        const dismissFn = jest.fn()
        usePersistedStateSpy.mockReturnValue([true, dismissFn])
        isAdminSpy.mockReturnValue(false)

        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                type: IntegrationType.Phone,
                            },
                        ],
                    }),
                    currentUser: fromJS({name: UserRole.Agent}),
                } as any)}
            >
                <RoutingRuleDecomissionBanner />
            </Provider>
        )

        expect(
            screen.getByText(/routing rules will no longer be in use/i)
        ).toBeVisible()
        const closeIcon = screen.getByRole('img', {
            name: /close\-icon/i,
        })
        fireEvent.click(closeIcon)
        expect(dismissFn).toHaveBeenCalledWith(false)
    })

    it('should not render banner when there are no phone integrations', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                type: IntegrationType.Email,
                            },
                        ],
                    }),
                } as any)}
            >
                <RoutingRuleDecomissionBanner />
            </Provider>
        )
        expect(
            screen.queryByText(/routing rules will no longer be in use/i)
        ).toBeNull()
    })

    it('should not render banner while on the phone settings page', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                type: IntegrationType.Phone,
                            },
                        ],
                    }),
                } as any)}
            >
                <RoutingRuleDecomissionBanner />
            </Provider>,
            {
                route: '/app/settings/channels/phone/1/preferences',
            }
        )

        expect(
            screen.queryByText(/routing rules will no longer be in use/i)
        ).toBeNull()
    })
})
