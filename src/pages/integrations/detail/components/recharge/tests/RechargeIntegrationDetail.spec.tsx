import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {
    PENDING_AUTHENTICATION_STATUS,
    SUCCESS_AUTHENTICATION_STATUS,
} from 'constants/integration'

import {RechargeIntegrationDetail} from '../RechargeIntegrationDetail'

describe('<RechargeIntegrationDetail/>', () => {
    const minProps: ComponentProps<typeof RechargeIntegrationDetail> = {
        integration: fromJS({}),
        shopifyIntegrations: fromJS({}),
        loading: fromJS({}),
        redirectUri: fromJS({}),
        history: fromJS({}),
        location: fromJS({}),
        match: {
            isExact: fromJS({}),
            params: {integrationId: '1'},
            path: fromJS({}),
            url: fromJS({}),
        },
        deleteIntegration: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render a loader (because the integration is loading', () => {
            const {container} = render(
                <RechargeIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                    loading={fromJS({integration: true})}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render an alert because the import is in progress', () => {
            const {container} = render(
                <RechargeIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render a small paragraph because the import is over', () => {
            const {container} = render(
                <RechargeIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: true},
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render buttons loading and disabled because a submit is in progress', () => {
            const {container} = render(
                <RechargeIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                    loading={fromJS({updateIntegration: true})}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render not render deactivate / reactivate buttons because authentication is required', () => {
            const {container} = render(
                <RechargeIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: PENDING_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it(
            'should not render anything about the import and render the re-activate button instead of the deactivate ' +
                'button because the integration is deactivated',
            () => {
                const {container} = render(
                    <RechargeIntegrationDetail
                        {...minProps}
                        integration={fromJS({
                            id: 1,
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                                sync_state: {is_initialized: false},
                            },
                            deactivated_datetime: '2018-01-01 10:12',
                        })}
                    />
                )

                expect(container).toMatchSnapshot()
            }
        )
    })
})
