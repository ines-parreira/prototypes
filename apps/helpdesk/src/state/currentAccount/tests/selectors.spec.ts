import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import * as accountFixtures from 'fixtures/account'
import { initialState } from 'state/currentAccount/reducers'
import * as selectors from 'state/currentAccount/selectors'
import { AccountFeature, AccountSettingType } from 'state/currentAccount/types'
import type { RootState } from 'state/types'

const DATE_TO_USE = new Date('2019-09-03')
jest.spyOn(Date, 'now').mockImplementation(() => DATE_TO_USE.getTime())

const setStateWith = (
    state: RootState,
    pathInMeta: string[] = [],
    value: unknown,
): RootState => {
    return {
        ...state,
        currentAccount: state.currentAccount?.update((currentAccount) =>
            currentAccount.setIn(pathInMeta, value),
        ),
    }
}

describe('current account selectors', () => {
    const defaultState = {
        currentAccount: initialState.mergeDeep(fromJS(accountFixtures.account)),
    } as RootState

    it('getCurrentAccountState', () => {
        expect(selectors.getCurrentAccountState(defaultState)).toEqualImmutable(
            defaultState.currentAccount,
        )
        expect(
            selectors.getCurrentAccountState({} as RootState),
        ).toEqualImmutable(fromJS({}))
    })

    it('getAccountOwnerId', () => {
        expect(selectors.getAccountOwnerId(defaultState)).toEqualImmutable(
            defaultState.currentAccount?.get('user_id'),
        )
    })

    it('getCurrentAccountMeta', () => {
        expect(selectors.getCurrentAccountMeta(defaultState)).toEqualImmutable(
            defaultState.currentAccount?.get('meta'),
        )
        expect(
            selectors.getCurrentAccountMeta({} as RootState),
        ).toEqualImmutable(fromJS({}))
    })

    it('getAccountStatus', () => {
        expect(selectors.getAccountStatus(defaultState)).toEqualImmutable(
            defaultState.currentAccount?.get('status'),
        )
        expect(selectors.getAccountStatus({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
    })

    it('isAccountActive', () => {
        expect(selectors.isAccountActive(defaultState)).toBe(true)
        expect(selectors.isAccountActive({} as RootState)).toBe(false)
    })

    it('getCurrentSubscription', () => {
        expect(selectors.getCurrentSubscription(defaultState)).toEqualImmutable(
            defaultState.currentAccount.get('current_subscription'),
        )
        expect(
            selectors.getCurrentSubscription({} as RootState),
        ).toEqualImmutable(fromJS({}))
    })

    it('hasCreditCard', () => {
        expect(
            selectors.hasCreditCard(
                setStateWith(defaultState, ['meta', 'hasCreditCard'], true),
            ),
        ).toBe(true)
        expect(
            selectors.hasCreditCard(
                setStateWith(defaultState, ['meta', 'hasCreditCard'], false),
            ),
        ).toBe(false)
        expect(selectors.hasCreditCard({} as RootState)).toBe(false)
    })

    it('shouldPayWithShopify', () => {
        expect(
            selectors.shouldPayWithShopify(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    true,
                ),
            ),
        ).toBe(true)
        expect(
            selectors.shouldPayWithShopify(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    false,
                ),
            ),
        ).toBe(false)
        expect(selectors.shouldPayWithShopify({} as RootState)).toBe(false)
    })

    it('getShopifyBillingStatus', () => {
        expect(
            selectors.getShopifyBillingStatus(
                setStateWith(
                    defaultState,
                    ['meta', 'shopify_billing', 'active'],
                    true,
                ),
            ),
        ).toBe('active')
        expect(
            selectors.getShopifyBillingStatus(
                setStateWith(
                    defaultState,
                    ['meta', 'shopify_billing', 'active'],
                    false,
                ),
            ),
        ).toBe('inactive')
        expect(selectors.getShopifyBillingStatus({} as RootState)).toBe(
            'inactive',
        )

        const newState = setStateWith(
            defaultState,
            ['meta', 'shopify_billing'],
            fromJS({ active: false, charge_id: '123' }),
        )
        expect(selectors.getShopifyBillingStatus(newState)).toBe('canceled')
    })

    it('paymentMethod', () => {
        expect(
            selectors.paymentMethod(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    true,
                ),
            ),
        ).toBe('shopify')
        expect(
            selectors.paymentMethod(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    false,
                ),
            ),
        ).toBe('stripe')
        expect(selectors.paymentMethod({} as RootState)).toBe('stripe')
    })

    describe.each<[string, (state: RootState) => unknown, Map<any, any>]>([
        [
            'getSurveySettings',
            selectors.getSurveysSettings,
            fromJS({ type: AccountSettingType.SatisfactionSurveys }),
        ],
        [
            'DEPRECATED_getBusinessHoursSettings',
            selectors.DEPRECATED_getBusinessHoursSettings,
            fromJS({ type: AccountSettingType.BusinessHours }),
        ],
        [
            'getTicketAssignmentSettings',
            selectors.getTicketAssignmentSettings,
            fromJS({ type: AccountSettingType.TicketAssignment }),
        ],
        [
            'getViewsOrderingSetting',
            selectors.DEPRECATED_getViewsOrderingSetting,
            fromJS({ type: AccountSettingType.ViewsOrdering }),
        ],
    ])('%s', (_testName, selector, expectedResult) => {
        it('should return the setting', () => {
            const state = setStateWith(
                defaultState,
                ['settings'],
                fromJS([expectedResult]),
            )
            expect(selector(state)).toEqualImmutable(expectedResult)
        })

        it('should return an empty map when no setting found', () => {
            const state = setStateWith(
                defaultState,
                ['settings'],
                fromJS([{ type: 'unknown' }]),
            )
            expect(selector(state)).toEqualImmutable(fromJS({}))
        })

        it('should return an empty map when state is empty', () => {
            expect(selector({} as RootState)).toEqualImmutable(fromJS({}))
        })
    })

    describe('getSurveysSettingsJS', () => {
        it('should return the setting', () => {
            expect(
                selectors.getSurveysSettingsJS(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([
                            { type: AccountSettingType.SatisfactionSurveys },
                        ]),
                    ),
                ),
            ).toEqual({ type: AccountSettingType.SatisfactionSurveys })
        })

        it('should return undefined when there is no setting', () => {
            expect(
                selectors.getSurveysSettingsJS(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([{ type: 'unknown' }]),
                    ),
                ),
            ).toBe(undefined)
        })
    })

    describe('getBusinessHoursSettings', () => {
        it('should return the setting', () => {
            expect(
                selectors.getBusinessHoursSettings(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([{ type: AccountSettingType.BusinessHours }]),
                    ),
                ),
            ).toEqual({ type: AccountSettingType.BusinessHours })
        })

        it('should return undefined when there is no setting', () => {
            expect(
                selectors.getBusinessHoursSettings(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([{ type: 'unknown' }]),
                    ),
                ),
            ).toBe(undefined)
        })
    })

    describe('getViewOrderingSettingJS', () => {
        it('should return the setting', () => {
            const setting = { type: AccountSettingType.ViewsOrdering }
            const state = setStateWith(
                defaultState,
                ['settings'],
                fromJS([setting]),
            )
            expect(selectors.getViewsOrderingSetting(state)).toEqual(setting)
        })

        it('should return the empty object when state is empty', () => {
            expect(selectors.getViewsOrderingSetting({} as RootState)).toEqual(
                {},
            )
        })
    })

    describe('getViewsVisibilitySettings', () => {
        it('should return the setting', () => {
            expect(
                selectors.getViewsVisibilitySettings(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([{ type: AccountSettingType.ViewsVisibility }]),
                    ),
                ),
            ).toEqual({ type: AccountSettingType.ViewsVisibility })
        })

        it('should return undefined when there is no setting', () => {
            expect(
                selectors.getViewsVisibilitySettings(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([{ type: 'unknown' }]),
                    ),
                ),
            ).toBe(undefined)
        })
    })

    describe('currentAccountHasFeature()', () => {
        it.each(Object.values(AccountFeature))(
            'should return true for feature %s',
            (feature) => {
                expect(
                    selectors.currentAccountHasFeature(feature)(defaultState),
                ).toBe(true)
            },
        )

        it('should return false', () => {
            const feature = AccountFeature.AutoAssignment

            expect(
                selectors.currentAccountHasFeature(feature)(
                    setStateWith(defaultState, ['features', feature], {
                        enabled: false,
                    }),
                ),
            ).toBe(false)
        })
    })

    describe('getBusinessHoursRangesByUserTimezone()', () => {
        it('should return the business hours range', () => {
            expect(
                selectors.getBusinessHoursRangesByUserTimezone(
                    setStateWith(
                        {
                            ...defaultState,
                            currentUser: fromJS({
                                timezone: 'Europe/Paris',
                            }),
                        },
                        ['settings'],
                        fromJS([
                            {
                                data: {
                                    business_hours: [
                                        {
                                            days: '0,1,2,3,4,5,6',
                                            from_time: '9:00',
                                            to_time: '11:00',
                                        },
                                        {
                                            days: '0,1,2,3,4,5,6',
                                            from_time: '14:00',
                                            to_time: '16:00',
                                        },
                                        {
                                            days: '0,1,2,3,4,5,6',
                                            from_time: '8:00',
                                            to_time: '12:00',
                                        },
                                        {
                                            days: '0,1,2,3,4,5,6',
                                            from_time: '13:00',
                                            to_time: '17:30',
                                        },
                                    ],
                                    timezone: 'US/Pacific',
                                },
                                id: 2,
                                type: 'business-hours',
                            },
                        ]),
                    ),
                ),
            ).toMatchSnapshot()
        })
    })

    describe('getTwoFAEnforcedDatetime()', () => {
        it('should return the datetime when 2fa was enforced', () => {
            expect(
                selectors.getTwoFAEnforcedDatetime(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        [
                            fromJS({
                                type: 'access',
                                data: {
                                    two_fa_enforced_datetime:
                                        '2022-03-24T14:17:05',
                                },
                            }),
                        ],
                    ),
                ),
            ).toBe('2022-03-24T14:17:05')
        })
    })

    describe('is2FAEnforcedSelector()', () => {
        it.each([
            ['2022-03-24T14:17:05', true],
            [null, false],
        ])(
            'should return if the 2fa is enforced or not',
            (twoFAEnforcedDatetime, expectedValue) => {
                expect(
                    selectors.is2FAEnforcedSelector(
                        setStateWith(
                            defaultState,
                            ['settings'],
                            [
                                fromJS({
                                    type: 'access',
                                    data: {
                                        two_fa_enforced_datetime:
                                            twoFAEnforcedDatetime,
                                    },
                                }),
                            ],
                        ),
                    ),
                ).toBe(expectedValue)
            },
        )
    })

    describe('getDefaultIntegrationSettings', () => {
        it('should return the setting', () => {
            expect(
                selectors.getDefaultIntegrationSettings(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([
                            {
                                type: AccountSettingType.DefaultIntegration,
                                data: {
                                    email: 123,
                                },
                            },
                        ]),
                    ),
                ),
            ).toEqual({
                type: AccountSettingType.DefaultIntegration,
                data: {
                    email: 123,
                },
            })
        })

        it('should return undefined when there is no setting', () => {
            expect(
                selectors.getDefaultIntegrationSettings(
                    setStateWith(
                        defaultState,
                        ['settings'],
                        fromJS([{ type: 'unknown' }]),
                    ),
                ),
            ).toBe(undefined)
        })
    })

    describe('getIsCurrentSubscriptionCanceled', () => {
        it('should return true when subscription state is empty', () => {
            expect(
                selectors.getIsCurrentSubscriptionCanceled({} as RootState),
            ).toEqual(true)
        })

        it('should return false when there is a subscription', () => {
            expect(
                selectors.getIsCurrentSubscriptionCanceled(defaultState),
            ).toEqual(false)
        })
    })

    describe('getIsCurrentSubscriptionTrialingOrCanceled', () => {
        it('should return true when subscription state is empty', () => {
            expect(
                selectors.getIsCurrentSubscriptionTrialingOrCanceled(
                    {} as RootState,
                ),
            ).toEqual(true)
        })

        it('should return true when there is a trial subscription', () => {
            expect(
                selectors.getIsCurrentSubscriptionTrialingOrCanceled(
                    defaultState,
                ),
            ).toEqual(true)
        })

        it('should return false when there is a non trialing subscription', () => {
            expect(
                selectors.getIsCurrentSubscriptionTrialingOrCanceled({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...defaultState.currentAccount.toJS(),
                        current_subscription: {
                            ...defaultState.currentAccount.get(
                                'current_subscription',
                            ),
                            status: 'active',
                        },
                    }),
                }),
            ).toEqual(false)
        })
    })
})
