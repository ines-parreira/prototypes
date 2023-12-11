import {cleanup, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {mockStore, renderWithRouter} from 'utils/testing'
import {IntegrationType} from 'models/integration/constants'
import RoutingRuleDecomissionBanner from '../RoutingRuleDecomissionBanner'

describe('RoutingRuleDecomissionBanner', () => {
    afterEach(cleanup)

    it('should render banner when there are phone integrations', () => {
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
