import {fromJS} from 'immutable'
import moment from 'moment'
import {UserSettingType} from 'config/types/user'
import {defaultTicketView, getExpirationTimeForCount} from 'config/views'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import {newViews} from 'models/view/mocks'
import {
    EntityType,
    View,
    ViewCategory,
    ViewType,
    ViewVisibility,
} from 'models/view/types'
import {initialState as currentAccountInitialState} from 'state/currentAccount/reducers'
import {AccountSettingType} from 'state/currentAccount/types'
import {initialState as currentUserInitialState} from 'state/currentUser/reducers'

import {RootState} from 'state/types'

import {initialState as ticketNavbarInitialState} from 'state/ui/ticketNavbar/reducer'
import {TicketNavbarElementType} from 'state/ui/ticketNavbar/types'
import {SYSTEM_VIEWS} from 'state/views/constants'

import {initialState} from 'state/views/reducers'
import * as selectors from 'state/views/selectors'
import {makeGetView} from 'state/views/selectors'

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
                        filters: 'isNotEmpty(ticket.trashed_datetime)',
                    })
                ),
            } as RootState
            expect(selectors.isActiveViewTrashView(state)).toBe(true)
        })
        it('should not be the trash view', () => {
            const state = {
                views: initialState.set(
                    'active',
                    fromJS({
                        filters: 'eq(ticket.spam, true)',
                        category: ViewCategory.System,
                        name: 'Trash',
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
                currentUser: fromJS({settings: []}),
                entities: {
                    sections: {},
                    views: {},
                },
                ui: {ticketNavbar: {}},
                views: initialState.set('items', fromJS([])),
            } as RootState
            expect(
                selectors.getViewIdToDisplay(state)(ViewType.TicketList)
            ).toEqual(null)
        })

        it('should return the id of the first view of matching type because no urlViewId was passed', () => {
            const viewId = 7
            const views = [{id: viewId, type: ViewType.TicketList}]
            const state = {
                currentUser: fromJS({settings: []}),
                entities: {
                    sections: {},
                    views: views.reduce(
                        (acc, view) => {
                            acc[view.id] = view as View
                            return acc
                        },
                        {} as Record<number, View>
                    ),
                },
                ui: {ticketNavbar: {}},
                views: initialState.set('items', fromJS(views)),
            } as RootState
            expect(
                selectors.getViewIdToDisplay(state)(ViewType.TicketList)
            ).toEqual(viewId)
        })

        it('should return the passed urlViewId because there is a matching view of the same type', () => {
            const viewId = 7
            const views = [{id: viewId, type: ViewType.TicketList}]
            const state = {
                currentUser: fromJS({settings: []}),
                entities: {
                    sections: {},
                    views: views.reduce(
                        (acc, view) => {
                            acc[view.id] = view as View
                            return acc
                        },
                        {} as Record<number, View>
                    ),
                },
                ui: {ticketNavbar: {}},
                views: initialState.set('items', fromJS(views)),
            } as RootState
            expect(
                selectors.getViewIdToDisplay(state)(
                    ViewType.TicketList,
                    viewId.toString()
                )
            ).toEqual(viewId)
        })

        it(
            'should not return the passed urlViewId because there is no matching view of the same type ' +
                '(should instead return the if of the first view of matching type)',
            () => {
                const viewId = 7
                const ticketViewId = 9
                const views = [
                    {id: viewId, type: ViewType.CustomerList},
                    {id: ticketViewId, type: ViewType.TicketList},
                ]

                const state = {
                    currentUser: fromJS({settings: []}),
                    entities: {
                        sections: {},
                        views: views.reduce(
                            (acc, view) => {
                                acc[view.id] = view as View
                                return acc
                            },
                            {} as Record<number, View>
                        ),
                    },
                    ui: {ticketNavbar: {}},
                    views: initialState.set('items', fromJS(views)),
                } as RootState
                expect(
                    selectors.getViewIdToDisplay(state)(
                        ViewType.TicketList,
                        viewId.toString()
                    )
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

    describe('makeGetView', () => {
        it('should create getView selector that will return new view', () => {
            const state = {} as RootState
            const getViewSelector = makeGetView(state)

            expect(getViewSelector('', EntityType.Ticket)).toEqual(
                defaultTicketView.newView()
            )
        })

        it('should create getView selector that will return nothing and console an error', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error')
            const state = {} as RootState

            const getViewSelector = makeGetView(state)

            expect(getViewSelector('')).toEqual(fromJS({}))
            expect(consoleErrorSpy).toHaveBeenCalled()
        })
    })

    describe('makeGetViewsByType', () => {
        it('should filter views by type and not return hidden', () => {
            const view1 = {
                id: 1,
                type: ViewType.TicketList,
            }
            const view2 = {
                id: 2,
                type: ViewType.TicketList,
            }
            const view3 = {
                id: 3,
                type: ViewType.CustomerList,
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
            expect(selector(state, ViewType.TicketList)).toEqualImmutable(
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
            expect(selector(state, ViewType.CustomerList)).toEqualImmutable(
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
                type: ViewType.TicketList,
                visibility: ViewVisibility.Private,
            }
            const view2 = {
                id: 2,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            }
            const view3 = {
                id: 3,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            }
            const view4 = {
                id: 4,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Private,
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
            expect(selector(state, ViewType.TicketList)).toEqualImmutable(
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

    describe('shouldFetchActiveViewTickets', () => {
        it('should return false (no active view)', () => {
            const state = {views: initialState} as RootState
            expect(selectors.shouldFetchActiveViewTickets(state)).toBe(false)
        })

        it('should return false (not on a view)', () => {
            window.location.pathname = '/app/ticket/12/'
            const state = {views: initialState} as RootState
            expect(selectors.shouldFetchActiveViewTickets(state)).toBe(false)
        })

        it('should return false (editing view)', () => {
            window.location.pathname = '/app/tickets/12/'
            const viewState = initialState.set(
                'active',
                fromJS({
                    id: 1,
                    editMode: true,
                    type: ViewType.TicketList,
                })
            )
            const state = {views: viewState} as RootState
            expect(selectors.shouldFetchActiveViewTickets(state)).toBe(false)
        })

        it('should return false (already fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const viewState = initialState.mergeDeep(
                fromJS({
                    active: {id: 1, type: ViewType.TicketList},
                    _internal: {
                        loading: {
                            fetchList: true,
                        },
                    },
                })
            )
            const state = {views: viewState} as RootState
            expect(selectors.shouldFetchActiveViewTickets(state)).toBe(false)
        })

        it('should return false (already discreet fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const viewState = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    _internal: {
                        loading: {
                            fetchListDiscreet: true,
                        },
                    },
                })
            )
            const state = {views: viewState} as RootState
            expect(selectors.shouldFetchActiveViewTickets(state)).toBe(false)
        })

        it('return true if conditions are met', () => {
            window.location.pathname = '/app/tickets/12/'
            const viewState = initialState.set(
                'active',
                fromJS({id: 1, type: ViewType.TicketList})
            )
            const state = {views: viewState} as RootState
            expect(selectors.shouldFetchActiveViewTickets(state)).toBe(true)
        })

        describe('getSystemTicketNavbarElementsByCategory', () => {
            const settings = [
                ...account.settings,
                {
                    type: AccountSettingType.ViewsOrdering,
                    id: 1,
                    data: {
                        views_top: {
                            [newViews[2].id]: {
                                display_order: 1,
                            },
                            [newViews[0].id]: {
                                display_order: 2,
                            },
                        },
                        views_bottom: {
                            [newViews[3].id]: {
                                display_order: 2,
                            },
                            [newViews[1].id]: {
                                display_order: 1,
                            },
                        },
                    },
                },
            ]
            const currentAccount = currentAccountInitialState
                .mergeDeep(account)
                .set('settings', fromJS(settings))
            const state = {
                views: initialState.set('items', fromJS(newViews)),
                currentAccount,
            } as RootState

            it('should return the ordered views matching with the correct category', () => {
                expect(
                    selectors.getSystemTicketNavbarElementsByCategory(
                        'views_bottom'
                    )(state)
                ).toEqual([
                    {data: newViews[1], type: TicketNavbarElementType.View},
                    {data: newViews[3], type: TicketNavbarElementType.View},
                ])
            })

            it('should return the visible views', () => {
                expect(
                    selectors.getSystemTicketNavbarElementsByCategory(
                        'views_bottom'
                    )({
                        ...state,
                        currentAccount: currentAccount.setIn(
                            ['settings'],
                            fromJS([
                                ...settings,
                                {
                                    type: AccountSettingType.ViewsVisibility,
                                    id: 10,
                                    data: {
                                        hidden_views: [newViews[3].id],
                                    },
                                },
                            ])
                        ),
                    })
                ).toEqual([
                    {data: newViews[1], type: TicketNavbarElementType.View},
                ])
            })

            it('should include hidden views if includeHiddenViews is true', () => {
                expect(
                    selectors.getSystemTicketNavbarElementsByCategory(
                        'views_bottom',
                        true
                    )({
                        ...state,
                        currentAccount: currentAccount.setIn(
                            ['settings'],
                            fromJS([
                                ...settings,
                                {
                                    type: AccountSettingType.ViewsVisibility,
                                    id: 10,
                                    data: {
                                        hidden_views: [newViews[3].id],
                                    },
                                },
                            ])
                        ),
                    })
                ).toEqual([
                    {data: newViews[1], type: TicketNavbarElementType.View},
                    {data: newViews[3], type: TicketNavbarElementType.View},
                ])
            })
        })
    })

    describe('getDefaultTicketView', () => {
        let state: RootState

        const views = {
            '2': {
                id: 2,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
                section_id: 1,
            },
            '10': {
                id: 10,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
                section_id: 1,
            },
            '5': {
                id: 5,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Private,
                section_id: null,
            },
            '123': {
                id: 123,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Private,
                section_id: 3,
            },
            '1234': {
                id: 123,
                type: ViewType.CustomerList,
                visibility: ViewVisibility.Private,
                section_id: null,
            },
        }

        beforeEach(() => {
            state = {
                entities: {
                    views,
                    sections: {
                        '1': {
                            id: 1,
                            private: false,
                        },
                        '3': {
                            id: 3,
                            private: true,
                        },
                        '48': {
                            id: 48,
                            private: false,
                        },
                    },
                },
                currentAccount: fromJS({
                    ...account,
                    settings: [
                        {
                            id: 3,
                            type: AccountSettingType.ViewsOrdering,
                            data: {
                                views: {
                                    2: {display_order: 4},
                                    10: {display_order: 3},
                                },
                                view_sections: {
                                    1: {display_order: 2},
                                    48: {display_order: 1},
                                },
                            },
                        },
                    ],
                }),
                currentUser: fromJS({
                    ...user,
                    settings: [
                        {
                            id: 2,
                            type: UserSettingType.ViewsOrdering,
                            data: {
                                views: {
                                    5: {display_order: 4},
                                    123: {display_order: 6},
                                },
                                view_sections: {
                                    3: {
                                        display_order: 5,
                                    },
                                },
                            },
                        },
                    ],
                }),
                ui: {
                    ticketNavbar: ticketNavbarInitialState,
                },
            } as any
        })

        it('should return null when no view is available', () => {
            expect(
                selectors.getDefaultTicketView({
                    ...state,
                    entities: {...state.entities, views: {}},
                })
            ).toBeNull()
        })

        it('should return the first available view', () => {
            expect(selectors.getDefaultTicketView(state)).toMatchObject(
                state.entities.views['10']
            )
        })

        it('should return the first view matching the category order stored in local storage', () => {
            localStorage.setItem(
                'viewCategories',
                JSON.stringify([ViewVisibility.Private])
            )

            expect(selectors.getDefaultTicketView(state)).toMatchObject(
                state.entities.views['5']
            )
        })

        it('should return the first available top system view', () => {
            const systemView = {
                id: 1,
                name: SYSTEM_VIEWS[1].name,
                category: ViewCategory.System,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            } as unknown as View

            expect(
                selectors.getDefaultTicketView({
                    ...state,
                    entities: {
                        ...state.entities,
                        views: {
                            ...state.entities.views,
                            '1': systemView,
                        },
                    },
                    views: fromJS({
                        items: Object.values({...views, systemView}),
                    }),
                })
            ).toMatchObject(systemView)
        })

        it('should return the first available bottom system view', () => {
            const systemView = {
                id: 1,
                name: SYSTEM_VIEWS[4].name,
                category: ViewCategory.System,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            } as unknown as View

            expect(
                selectors.getDefaultTicketView({
                    ...state,
                    entities: {
                        ...state.entities,
                        views: {
                            '1': systemView,
                        },
                    },
                    views: fromJS({
                        items: Object.values({systemView}),
                    }),
                })
            ).toMatchObject(systemView)
        })
    })

    describe('getViewPlainJS()', () => {
        const views = {
            '2': {
                id: 2,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            },
            '88': {
                id: 88,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            },
            '1234': {
                id: 123,
                type: ViewType.CustomerList,
                visibility: ViewVisibility.Private,
            },
        }

        const state = {
            views: fromJS({
                items: views,
            }),
        } as RootState

        it('should return the view matching the id', () => {
            expect(selectors.getViewPlainJS(state, '88')).toEqual(views['88'])
        })

        it('should return null when no view matches the id', () => {
            expect(selectors.getViewPlainJS(state, '22')).toEqual(null)
        })
    })

    describe('getViewCount()', () => {
        const views = {
            '2': {
                id: 2,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            },
            '88': {
                id: 88,
                type: ViewType.TicketList,
                visibility: ViewVisibility.Public,
            },
            '1234': {
                id: 123,
                type: ViewType.CustomerList,
                visibility: ViewVisibility.Private,
            },
        }
        const counts = {
            2: 10,
            88: 0,
        }

        const state = {
            views: fromJS({
                items: views,
                counts,
            }),
        } as RootState

        it('should return the count matching the view', () => {
            expect(selectors.getViewCount('88')(state)).toEqual(counts['88'])
        })

        it('should return null when no count matches the view', () => {
            expect(selectors.getViewCount('1234')(state)).toEqual(null)
        })
    })
})
