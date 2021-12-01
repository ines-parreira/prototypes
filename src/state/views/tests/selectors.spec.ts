import moment from 'moment'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {SYSTEM_VIEW_CATEGORY, ViewVisibility} from '../../../constants/view'
import {UserSettingType} from '../../../config/types/user'
import {getExpirationTimeForCount} from '../../../config/views'
import {user} from '../../../fixtures/users'
import {account} from '../../../fixtures/account'
import {ViewType} from '../../../models/view/types'
import {AccountSettingType} from '../../currentAccount/types'
import {initialState as currentAccountInitialState} from '../../currentAccount/reducers'
import {initialState as currentUserInitialState} from '../../currentUser/reducers'
import {RootState} from '../../types'
import {initialState} from '../reducers'
import * as selectors from '../selectors'

jest.addMatchers(immutableMatchers)

describe('selectors', () => {
    afterEach(() => {
        localStorage.clear()
    })

    describe('isActiveViewTrashView()', () => {
        it('should be the trash view', () => {
            const state = {
                views: initialState.set(
                    'active',
                    fromJS({
                        category: SYSTEM_VIEW_CATEGORY,
                        name: 'Trash',
                    })
                ),
            } as RootState
            expect(selectors.isActiveViewTrashView(state)).toBe(true)
        })

        it('should not be the trash view (wrong category)', () => {
            const state = {
                views: initialState.set(
                    'active',
                    fromJS({
                        category: '',
                        name: 'Trash',
                    })
                ),
            } as RootState
            expect(selectors.isActiveViewTrashView(state)).toBe(false)
        })

        it('should not be the trash view (wrong name)', () => {
            const state = {
                views: initialState.set(
                    'active',
                    fromJS({
                        category: SYSTEM_VIEW_CATEGORY,
                        name: 'Spam',
                    })
                ),
            } as RootState
            expect(selectors.isActiveViewTrashView(state)).toBe(false)
        })
    })

    describe('getActiveViewAllItemsSelected()', () => {
        it('Should return false because in the state the all items selection variable is false', () => {
            const state = {
                views: initialState.set(
                    'active',
                    fromJS({
                        allItemsSelected: false,
                    })
                ),
            } as RootState
            expect(selectors.areAllActiveViewItemsSelected(state)).toBe(false)
        })
        it('Should return false because in the state the all items selection variable is not set', () => {
            const state = {
                views: initialState.set('active', fromJS({})),
            } as RootState
            expect(selectors.areAllActiveViewItemsSelected(state)).toBe(false)
        })
        it('Should return true because in the state the all items selection variable is true', () => {
            const state = {
                views: initialState.set(
                    'active',
                    fromJS({
                        allItemsSelected: true,
                    })
                ),
            } as RootState
            expect(selectors.areAllActiveViewItemsSelected(state)).toBe(true)
        })
    })

    describe('getRecentViews()', () => {
        it('should return value', () => {
            const recent = 12
            const state = {
                views: initialState.set('recent', recent),
            } as RootState
            expect(selectors.getRecentViews(state)).toBe(recent)
        })

        it('should return fallback', () => {
            const state = {
                views: initialState.set('recent', undefined),
            } as RootState
            expect(selectors.getRecentViews(state).toJS()).toEqual({})
        })
    })

    describe('getExpiredViewsCounts()', () => {
        it('should return an empty array because counts are not expired', () => {
            const now = moment.utc().toISOString()
            const counts = {
                1: 50,
                2: 100,
            }
            const recent = {
                1: {updated_datetime: now},
                2: {updated_datetime: now},
            }

            const state = {
                views: initialState.merge(fromJS({recent, counts})),
            } as RootState
            expect(selectors.getExpiredViewsCounts()(state)).toEqual([])
        })

        it('should return some view ids because some counts are expired', () => {
            const now = moment.utc().toISOString()
            const counts = {
                1: 50,
                3: 200,
            }
            const recent = {
                1: {
                    // View count is expired.
                    updated_datetime: moment
                        .utc()
                        .subtract(getExpirationTimeForCount(counts[1]) + 1, 's')
                        .toISOString(),
                },
                2: {
                    // View count was not already requested.
                    updated_datetime: undefined,
                },
                3: {updated_datetime: now},
            }

            const state = {
                views: initialState.merge(fromJS({recent, counts})),
            } as RootState
            expect(selectors.getExpiredViewsCounts()(state)).toEqual([1, 2])
        })
    })

    describe('getViewIdToDisplay()', () => {
        it('should return null because there is no views', () => {
            const state = {
                views: initialState.set('items', fromJS([])),
            } as RootState
            expect(
                selectors.getViewIdToDisplay(ViewType.TicketList)(state)
            ).toEqual(null)
        })

        it('should return the id of the first view of matching type because no urlViewId was passed', () => {
            const viewId = 7
            const state = {
                views: initialState.set(
                    'items',
                    fromJS([{id: viewId, type: ViewType.TicketList}])
                ),
            } as RootState
            expect(
                selectors.getViewIdToDisplay(ViewType.TicketList)(state)
            ).toEqual(viewId)
        })

        it('should return the passed urlViewId because there is a matching view of the same type', () => {
            const viewId = 7
            const state = {
                views: initialState.set(
                    'items',
                    fromJS([{id: viewId, type: ViewType.TicketList}])
                ),
            } as RootState
            expect(
                selectors.getViewIdToDisplay(
                    ViewType.TicketList,
                    viewId.toString()
                )(state)
            ).toEqual(viewId)
        })

        it(
            'should not return the passed urlViewId because there is no matching view of the same type ' +
                '(should instead return the if of the first view of matching type)',
            () => {
                const viewId = 7
                const ticketViewId = 9
                const state = {
                    views: initialState.set(
                        'items',
                        fromJS([
                            {id: viewId, type: ViewType.CustomerList},
                            {id: ticketViewId, type: ViewType.TicketList},
                        ])
                    ),
                } as RootState
                expect(
                    selectors.getViewIdToDisplay(
                        ViewType.TicketList,
                        viewId.toString()
                    )(state)
                ).toEqual(ticketViewId)
            }
        )
    })

    describe('getNavigation()', () => {
        it('should return an empty Map because there is no navigation in the state', () => {
            expect(
                selectors.getNavigation({views: fromJS({})} as RootState)
            ).toEqualImmutable(fromJS({}))
            expect(
                selectors.getNavigation({
                    views: fromJS({_internal: {navigation: {}}}),
                } as RootState)
            ).toEqualImmutable(fromJS({}))
        })

        it('should return navigation from the state', () => {
            const navigation = fromJS({foo: 'bar'})
            const state = {
                views: initialState.setIn(
                    ['_internal', 'navigation'],
                    navigation
                ),
            } as RootState
            expect(selectors.getNavigation(state)).toEqualImmutable(navigation)
        })
    })

    describe('makeGetViewsByType', () => {
        it('should filter views by type and not return hidden', () => {
            const view1 = {
                id: 1,
                type: 'ticket-list',
            }
            const view2 = {
                id: 2,
                type: 'ticket-list',
            }
            const view3 = {
                id: 3,
                type: 'customer-list',
            }
            const viewSetting1 = {
                display_order: 1,
            }
            const viewSetting2 = {
                display_order: 2,
            }
            const viewSetting3 = {
                display_order: 3,
            }
            const state = {
                views: initialState.mergeDeep({
                    items: [view1, view2, view3],
                }),
                currentUser: currentUserInitialState.mergeDeep(user).set(
                    'settings',
                    fromJS([
                        ...user.settings,
                        {
                            id: 1,
                            type: UserSettingType.ViewsOrdering,
                            data: {
                                views: {
                                    [view1.id]: viewSetting1,
                                    [view2.id]: viewSetting2,
                                },
                            },
                        },
                    ])
                ),
                currentAccount: currentAccountInitialState
                    .mergeDeep(account)
                    .set(
                        'settings',
                        fromJS([
                            ...account.settings,
                            {
                                type: AccountSettingType.ViewsOrdering,
                                id: 1,
                                data: {
                                    views: {
                                        [view1.id]: viewSetting1,
                                        [view2.id]: viewSetting2,
                                        [view3.id]: viewSetting3,
                                    },
                                },
                            },
                        ])
                    ),
            } as RootState
            const selector = selectors.makeGetViewsByType()
            expect(selector(state, 'ticket-list')).toEqualImmutable(
                fromJS([
                    {
                        ...view1,
                        ...viewSetting1,
                        hide: false,
                    },
                    {
                        ...view2,
                        ...viewSetting2,
                        hide: false,
                    },
                ])
            )
            expect(selector(state, 'customer-list')).toEqualImmutable(
                fromJS([
                    {
                        ...view3,
                        ...viewSetting3,
                        hide: false,
                    },
                ])
            )
        })

        it('should sort views in the expected order', () => {
            const view1 = {
                id: 1,
                type: 'ticket-list',
                visibility: ViewVisibility.PRIVATE,
            }
            const view2 = {
                id: 2,
                type: 'ticket-list',
                visibility: ViewVisibility.PUBLIC,
            }
            const view3 = {
                id: 3,
                type: 'ticket-list',
                visibility: ViewVisibility.PUBLIC,
            }
            const view4 = {
                id: 4,
                type: 'ticket-list',
                visibility: ViewVisibility.PRIVATE,
            }
            const viewSetting1 = {
                display_order: 1,
            }
            const viewSetting2 = {
                display_order: 0,
            }
            const viewSetting3 = {
                display_order: 1,
            }
            const viewSetting4 = {
                display_order: 0,
            }
            const state = {
                views: initialState.mergeDeep({
                    items: [view1, view2, view3, view4],
                }),
                currentUser: currentUserInitialState.mergeDeep(user).set(
                    'settings',
                    fromJS([
                        ...user.settings,
                        {
                            id: 1,
                            type: UserSettingType.ViewsOrdering,
                            data: {
                                views: {
                                    [view4.id]: viewSetting4,
                                    [view1.id]: viewSetting1,
                                },
                            },
                        },
                    ])
                ),
                currentAccount: currentAccountInitialState
                    .mergeDeep(account)
                    .set(
                        'settings',
                        fromJS([
                            ...account.settings,
                            {
                                type: AccountSettingType.ViewsOrdering,
                                id: 1,
                                data: {
                                    views: {
                                        [view2.id]: viewSetting2,
                                        [view3.id]: viewSetting3,
                                    },
                                },
                            },
                        ])
                    ),
            } as RootState
            const selector = selectors.makeGetViewsByType()
            expect(selector(state, 'ticket-list')).toEqualImmutable(
                fromJS([
                    {
                        ...view2,
                        ...viewSetting2,
                        hide: false,
                    },
                    {
                        ...view3,
                        ...viewSetting3,
                        hide: false,
                    },
                    {
                        ...view4,
                        ...viewSetting4,
                        hide: false,
                    },
                    {
                        ...view1,
                        ...viewSetting1,
                        hide: false,
                    },
                ])
            )
        })
    })

    describe('getViewIdsOrderedByCollapsedSections', () => {
        window.localStorage.setItem(
            'collapsed-view-sections',
            JSON.stringify([1])
        )
        const selector = selectors.getViewIdsOrderedByCollapsedSections()

        expect(
            selector({
                views: fromJS({
                    items: [
                        {id: 1, type: ViewType.TicketList},
                        {id: 2, section_id: 1, type: ViewType.TicketList},
                        {id: 3, section_id: 2, type: ViewType.TicketList},
                    ],
                }),
            } as RootState)
        ).toEqualImmutable(fromJS([1, 3, 2]))
    })
})
