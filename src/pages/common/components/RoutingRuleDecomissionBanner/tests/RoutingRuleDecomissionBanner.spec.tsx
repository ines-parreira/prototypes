import {cleanup, fireEvent, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {mockStore, renderWithRouter} from 'utils/testing'
import {IntegrationType} from 'models/integration/constants'
import * as hooks from 'common/hooks'
import RoutingRuleDecomissionBanner from '../RoutingRuleDecomissionBanner'

const usePersistedStateSpy = jest.spyOn(hooks, 'usePersistedState')

describe('RoutingRuleDecomissionBanner', () => {
    afterEach(cleanup)

    it('should render banner when there are phone integrations', () => {
        usePersistedStateSpy.mockReturnValue([true, jest.fn()])

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
            </Provider>
        )
        expect(
            screen.getByText(/routing rules will no longer be in use/i)
        ).toBeVisible()
    })

    it('should not render banner if it was previously dismissed', () => {
        usePersistedStateSpy.mockReturnValue([false, jest.fn()])

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
            </Provider>
        )
        expect(
            screen.queryByText(/routing rules will no longer be in use/i)
        ).toBeNull()
    })

    it('users should be able to dismiss banner', () => {
        const dismissFn = jest.fn()
        usePersistedStateSpy.mockReturnValue([true, dismissFn])

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
