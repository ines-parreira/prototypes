import {fromJS} from 'immutable'

import {
    FACEBOOK_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
} from '../../../constants/integration'

import {integrationsState} from '../../../fixtures/integrations'
import {getIntegrationsState, getEmailIntegrations} from '../selectors.ts'
import reducer, {initialState} from '../reducers.ts'
import * as types from '../constants'

const state = {
    integrations: fromJS(integrationsState),
}

describe('integrations reducers', () => {
    it('should handle DELETE_INTEGRATION_SUCCESS', () => {
        const action = {
            type: types.DELETE_INTEGRATION_SUCCESS,
            id: getEmailIntegrations(state).getIn([0, 'id']),
        }
        const newState = reducer(state.integrations, action)
        const expected = getIntegrationsState(state)
            .update('integrations', (integrations) =>
                integrations
                    .valueSeq()
                    .filter((int) => int.get('id') !== action.id)
                    .toList()
            )
            .setIn(['state', 'loading', 'delete'], false)

        expect(newState).toEqual(expected)
    })

    it('should handle DELETE_INTEGRATION_ERROR', () => {
        const newState = reducer(state.integrations, {
            type: types.DELETE_INTEGRATION_ERROR,
        })
        const expected = getIntegrationsState(state).setIn(
            ['state', 'loading', 'delete'],
            false
        )
        expect(newState).toEqual(expected)
    })

    it('should set integration.meta.verified to true on EMAIL_INTEGRATION_VERIFIED', () => {
        const newState = reducer(state.integrations, {
            type: types.EMAIL_INTEGRATION_VERIFIED,
            integrationId: getIntegrationsState(state).getIn([
                'integrations',
                0,
                'id',
            ]),
        })
        const expected = getIntegrationsState(state)
            .setIn(['integration', 'meta', 'verified'], true)
            .setIn(['integrations', 0, 'meta', 'verified'], true)
        expect(newState).toEqual(expected)
    })

    describe('FETCH_ONBOARDING_INTEGRATIONS_SUCCESS', () => {
        const integrationTypes = [
            FACEBOOK_INTEGRATION_TYPE,
            OUTLOOK_INTEGRATION_TYPE,
        ]

        integrationTypes.forEach((integrationType) => {
            it(`should set the data because there is no current page (${integrationType})`, () => {
                const onboardingIntegrations = {
                    data: [{id: 1}],
                    meta: {
                        page: 1,
                        nb_pages: 1,
                        item_count: 1,
                    },
                }

                expect(
                    reducer(state.integrations, {
                        type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp: onboardingIntegrations,
                        integrationType,
                    })
                ).toEqual(
                    getIntegrationsState(state).setIn(
                        ['extra', integrationType, 'onboardingIntegrations'],
                        fromJS(onboardingIntegrations)
                    )
                )
            })

            it(`should set the data because the forceOverride flag is set (${integrationType})`, () => {
                const integrationsState = state.integrations.setIn(
                    [
                        'extra',
                        integrationType,
                        'onboardingIntegrations',
                        'meta',
                        'page',
                    ],
                    1
                )
                const onboardingIntegrations = {
                    data: [{id: 1}],
                    meta: {
                        page: 2,
                        nb_pages: 2,
                        item_count: 1,
                    },
                }

                expect(
                    reducer(integrationsState, {
                        type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp: onboardingIntegrations,
                        forceOverride: true,
                        integrationType,
                    })
                ).toEqual(
                    getIntegrationsState({
                        integrations: integrationsState,
                    }).setIn(
                        ['extra', integrationType, 'onboardingIntegrations'],
                        fromJS(onboardingIntegrations)
                    )
                )
            })

            it(`should set the data because the page of the response matches the current page (${integrationType})`, () => {
                const integrationsState = state.integrations.setIn(
                    [
                        'extra',
                        integrationType,
                        'onboardingIntegrations',
                        'meta',
                        'page',
                    ],
                    1
                )
                const onboardingIntegrations = {
                    data: [{id: 1}],
                    meta: {
                        page: 1,
                        nb_pages: 2,
                        item_count: 1,
                    },
                }

                expect(
                    reducer(integrationsState, {
                        type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp: onboardingIntegrations,
                        integrationType,
                    })
                ).toEqual(
                    getIntegrationsState({
                        integrations: integrationsState,
                    }).setIn(
                        ['extra', integrationType, 'onboardingIntegrations'],
                        fromJS(onboardingIntegrations)
                    )
                )
            })

            it(
                'should not set the data but still set the meta because there is a current page different from the page ' +
                    `associated with the response, and the forceOverride flag is not set  (${integrationType})`,
                () => {
                    const integrationsState = state.integrations.setIn(
                        [
                            'extra',
                            integrationType,
                            'onboardingIntegrations',
                            'meta',
                            'page',
                        ],
                        1
                    )
                    const onboardingIntegrations = {
                        data: [{id: 1}],
                        meta: {
                            page: 2,
                            nb_pages: 2,
                            item_count: 1,
                        },
                    }

                    expect(
                        reducer(integrationsState, {
                            type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                            resp: onboardingIntegrations,
                            integrationType,
                        })
                    ).toEqual(
                        getIntegrationsState({
                            integrations: integrationsState,
                        }).setIn(
                            [
                                'extra',
                                integrationType,
                                'onboardingIntegrations',
                                'meta',
                            ],
                            fromJS(onboardingIntegrations.meta)
                        )
                    )
                }
            )
        })
    })

    describe('CREATE_INTEGRATION_SUCCESS', () => {
        it(
            'should store the new integration in the `integration` field, push it in the list of `integrations` and ' +
                'set the loading flag for integration update to `false`',
            () => {
                const newIntegration = {
                    id: 118712,
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                }

                const integrationsState = initialState.mergeDeep(
                    fromJS({
                        integrations: [
                            {
                                id: 241,
                                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                                meta: {foo: 'bar'},
                            },
                        ],
                    })
                )

                const action = {
                    type: types.CREATE_INTEGRATION_SUCCESS,
                    resp: newIntegration,
                }

                expect(reducer(integrationsState, action)).toMatchSnapshot()
            }
        )
    })

    describe('UPDATE_INTEGRATION_SUCCESS', () => {
        it(
            'should store the new integration in the `integration` field, update it in the list of `integrations` and ' +
                'set the loading flag for integration update to `false`',
            () => {
                const integration = {
                    id: 118712,
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                }
                const updatedIntegration = Object.assign({}, ...integration, {
                    meta: {foo: 'bar'},
                })

                const integrationsState = initialState.mergeDeep(
                    fromJS({
                        integrations: [
                            {
                                id: 241,
                                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                                meta: {foo: 'bar'},
                            },
                            integration,
                        ],
                        state: {loading: {updateIntegration: 118712}},
                    })
                )

                const action = {
                    type: types.UPDATE_INTEGRATION_SUCCESS,
                    resp: updatedIntegration,
                }

                expect(reducer(integrationsState, action)).toMatchSnapshot()
            }
        )
    })
})
