import moment from 'moment'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {initialState} from '../reducers'
import * as selectors from '../selectors'
import {currentUser} from '../../../fixtures/users'
import {initialState as currentUserInitialState} from '../../currentUser/reducers.ts'
import {SYSTEM_VIEW_CATEGORY} from '../../../constants/view'

jest.addMatchers(immutableMatchers)

describe('selectors', () => {
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
            }
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
            }
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
            }
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
            }
            expect(selectors.areAllActiveViewItemsSelected(state)).toBe(false)
        })
        it('Should return false because in the state the all items selection variable is not set', () => {
            const state = {
                views: initialState.set('active', fromJS({})),
            }
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
            }
            expect(selectors.areAllActiveViewItemsSelected(state)).toBe(true)
        })
    })

    describe('getRecentViews()', () => {
        it('should return value', () => {
            const recent = 12
            const state = {views: initialState.set('recent', recent)}
            expect(selectors.getRecentViews(state)).toBe(recent)
        })

        it('should return fallback', () => {
            const state = {views: initialState.set('recent', undefined)}
            expect(selectors.getRecentViews(state).toJS()).toEqual({})
        })
    })

    describe('getExpiredViewsCounts()', () => {
        it('should return an empty array (no expired counts)', () => {
            const now = moment.utc().toISOString()
            const recent = fromJS({
                1: {updated_datetime: now},
                2: {updated_datetime: now},
            })
            const state = {views: initialState.set('recent', recent)}
            expect(selectors.getExpiredViewsCounts(5)(state).toJS()).toEqual([])
        })

        it('should return some view ids (some counts are expired)', () => {
            const now = moment.utc().toISOString()
            const recent = fromJS({
                1: {updated_datetime: now},
                2: {
                    updated_datetime: moment
                        .utc()
                        .subtract(2, 's')
                        .toISOString(),
                },
                3: {updated_datetime: now},
            })
            const state = {views: initialState.set('recent', recent)}
            expect(selectors.getExpiredViewsCounts(1)(state).toJS()).toEqual([
                2,
            ])
        })
    })

    describe('getViewIdToDisplay()', () => {
        it('should return null because there is no views', () => {
            const viewType = 'ticket-list'
            const state = {views: initialState.set('items', fromJS([]))}
            expect(selectors.getViewIdToDisplay(viewType)(state)).toEqual(null)
        })

        it('should return the id of the first view of matching type because no urlViewId was passed', () => {
            const viewId = 7
            const viewType = 'ticket-list'
            const state = {
                views: initialState.set(
                    'items',
                    fromJS([{id: viewId, type: viewType}])
                ),
            }
            expect(selectors.getViewIdToDisplay(viewType)(state)).toEqual(
                viewId
            )
        })

        it('should return the passed urlViewId because there is a matching view of the same type', () => {
            const viewId = 7
            const viewType = 'ticket-list'
            const state = {
                views: initialState.set(
                    'items',
                    fromJS([{id: viewId, type: viewType}])
                ),
            }
            expect(
                selectors.getViewIdToDisplay(viewType, viewId.toString())(state)
            ).toEqual(viewId)
        })

        it(
            'should not return the passed urlViewId because there is no matching view of the same type ' +
                '(should instead return the if of the first view of matching type)',
            () => {
                const viewId = 7
                const viewType = 'customer-list'
                const ticketViewId = 9
                const ticketViewType = 'ticket-list'
                const state = {
                    views: initialState.set(
                        'items',
                        fromJS([
                            {id: viewId, type: viewType},
                            {id: ticketViewId, type: ticketViewType},
                        ])
                    ),
                }
                expect(
                    selectors.getViewIdToDisplay(
                        ticketViewType,
                        viewId.toString()
                    )(state)
                ).toEqual(ticketViewId)
            }
        )
    })

    describe('getNavigation()', () => {
        it('should return an empty Map because there is no navigation in the state', () => {
            expect(
                selectors.getNavigation({views: fromJS({})})
            ).toEqualImmutable(fromJS({}))
            expect(
                selectors.getNavigation({
                    views: fromJS({_internal: {navigation: {}}}),
                })
            ).toEqualImmutable(fromJS({}))
        })

        it('should return navigation from the state', () => {
            const navigation = fromJS({foo: 'bar'})
            const state = {
                views: initialState.setIn(
                    ['_internal', 'navigation'],
                    navigation
                ),
            }
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
                hide: false,
                display_order: 1,
            }
            const viewSetting2 = {
                hide: true,
                display_order: 2,
            }
            const viewSetting3 = {
                hide: false,
                display_order: 3,
            }
            const state = {
                views: initialState.mergeDeep({
                    items: [view1, view2, view3],
                }),
                currentUser: currentUserInitialState.mergeDeep(currentUser).set(
                    'settings',
                    fromJS([
                        {
                            id: 1,
                            type: 'ticket-views',
                            data: {
                                [view1.id]: viewSetting1,
                                [view2.id]: viewSetting2,
                            },
                        },
                        {
                            id: 2,
                            type: 'customer-views',
                            data: {
                                [view3.id]: viewSetting3,
                            },
                        },
                    ])
                ),
            }
            const selector = selectors.makeGetViewsByType()
            expect(selector(state, 'ticket-list')).toEqualImmutable(
                fromJS([
                    {
                        ...view1,
                        ...viewSetting1,
                    },
                    {
                        ...view2,
                        ...viewSetting2,
                    },
                ])
            )
            expect(selector(state, 'customer-list')).toEqualImmutable(
                fromJS([
                    {
                        ...view3,
                        ...viewSetting3,
                    },
                ])
            )
        })
    })
})
