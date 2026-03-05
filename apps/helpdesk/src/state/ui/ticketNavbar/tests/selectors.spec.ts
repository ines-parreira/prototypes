import { fromJS } from 'immutable'

import { UserSettingType } from 'config/types/user'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { ViewType, ViewVisibility } from 'models/view/types'
import type { TicketNavbarSectionElement } from 'pages/tickets/navbar/TicketNavbarContent'
import { AccountSettingType } from 'state/currentAccount/types'
import type { RootState } from 'state/types'

import { initialState } from '../reducer'
import {
    getPrivateTicketNavbarElements,
    getPublicTicketNavbarElements,
} from '../selectors'
import { TicketNavbarElementType } from '../types'

describe('selectors', () => {
    const state = {
        entities: {
            views: {
                '1': {
                    id: 1,
                    type: ViewType.TicketList,
                    visibility: ViewVisibility.Public,
                    section_id: 2,
                },
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
                '4': {
                    id: 4,
                    type: ViewType.TicketList,
                    visibility: ViewVisibility.Public,
                    section_id: null,
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
            },
            sections: {
                '1': {
                    id: 1,
                    private: false,
                },
                '2': {
                    id: 2,
                    private: false,
                },
                '3': {
                    id: 3,
                    private: true,
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
                            1: { display_order: 6 },
                            2: { display_order: 3 },
                            10: { display_order: 2 },
                            4: { display_order: 4 },
                        },
                        view_sections: {
                            1: { display_order: 1 },
                            2: { display_order: 5 },
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
                            5: { display_order: 7 },
                            123: { display_order: 9 },
                        },
                        view_sections: {
                            3: {
                                display_order: 8,
                            },
                        },
                    },
                },
            ],
        }),
        ui: {
            ticketNavbar: initialState,
        },
    } as unknown as RootState

    describe('getPublicTicketNavbarElements', () => {
        it('should properly display a section view without section', () => {
            expect(
                getPublicTicketNavbarElements({
                    ...state,
                    entities: { ...state.entities, sections: {} },
                }),
            ).toMatchSnapshot()
        })

        it('should sort a newly created view without display_order to the end', () => {
            const stateWithNewView = {
                ...state,
                entities: {
                    ...state.entities,
                    views: {
                        ...state.entities.views,
                        '999': {
                            id: 999,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: null,
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(stateWithNewView)

            const topLevelViews = result.filter(
                (el) => el.type === TicketNavbarElementType.View,
            )
            const lastView = topLevelViews[topLevelViews.length - 1]
            expect(lastView.data.id).toBe(999)
        })

        it('should sort a newly created optimistic view without display_order to the end', () => {
            const stateWithOptimisticNewView = {
                ...state,
                entities: {
                    ...state.entities,
                    views: {
                        ...state.entities.views,
                        '999': {
                            id: 999,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: null,
                        },
                    },
                },
                ui: {
                    ...state.ui,
                    ticketNavbar: {
                        ...state.ui.ticketNavbar,
                        optimisticAccountSettings: {
                            ...state.ui.ticketNavbar.optimisticAccountSettings,
                            views: {
                                ...state.ui.ticketNavbar
                                    .optimisticAccountSettings.views,
                                999: {} as any,
                            },
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(
                stateWithOptimisticNewView,
            )

            const topLevelViews = result.filter(
                (el) => el.type === TicketNavbarElementType.View,
            )
            const lastView = topLevelViews[topLevelViews.length - 1]
            expect(lastView.data.id).toBe(999)
        })

        it('should sort a newly created view without display_order to the end of its section', () => {
            const stateWithNewSectionView = {
                ...state,
                entities: {
                    ...state.entities,
                    views: {
                        ...state.entities.views,
                        '999': {
                            id: 999,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: 1,
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(
                stateWithNewSectionView,
            )

            const section = result.find(
                (el): el is TicketNavbarSectionElement =>
                    el.type === TicketNavbarElementType.Section &&
                    el.data.id === 1,
            )
            const lastChild = section!.children[section!.children.length - 1]
            expect(lastChild.id).toBe(999)
        })

        it('should sort section views with optimistic entries missing display_order to the end', () => {
            const stateWithOptimisticNewSectionViews = {
                ...state,
                entities: {
                    ...state.entities,
                    views: {
                        ...state.entities.views,
                        '999': {
                            id: 999,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: 1,
                        },
                        '1000': {
                            id: 1000,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: 1,
                        },
                    },
                },
                ui: {
                    ...state.ui,
                    ticketNavbar: {
                        ...state.ui.ticketNavbar,
                        optimisticAccountSettings: {
                            ...state.ui.ticketNavbar.optimisticAccountSettings,
                            views: {
                                ...state.ui.ticketNavbar
                                    .optimisticAccountSettings.views,
                                999: {} as any,
                                1000: {} as any,
                            },
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(
                stateWithOptimisticNewSectionViews,
            )

            const section = result.find(
                (el): el is TicketNavbarSectionElement =>
                    el.type === TicketNavbarElementType.Section &&
                    el.data.id === 1,
            )

            expect(section?.children.map((child) => child.id)).toEqual([
                10, 2, 999, 1000,
            ])
        })

        it('should handle ordering settings without views map', () => {
            const stateWithMissingViewsMap = {
                ...state,
                currentAccount: fromJS({
                    ...account,
                    settings: [
                        {
                            id: 3,
                            type: AccountSettingType.ViewsOrdering,
                            data: {
                                view_sections: {
                                    1: { display_order: 1 },
                                    2: { display_order: 5 },
                                },
                            },
                        },
                    ],
                }),
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(
                stateWithMissingViewsMap,
            )
            const section = result.find(
                (el): el is TicketNavbarSectionElement =>
                    el.type === TicketNavbarElementType.Section &&
                    el.data.id === 1,
            )

            expect(section?.children.map((child) => child.id)).toEqual([2, 10])
        })

        it('should handle section sorting when all optimistic display_order values are missing', () => {
            const stateWithOnlyOptimisticSectionViews = {
                ...state,
                entities: {
                    ...state.entities,
                    views: {
                        first: {
                            id: 2001,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: 1,
                        },
                        second: {
                            id: 2002,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: 1,
                        },
                    },
                    sections: {
                        '1': state.entities.sections['1'],
                    },
                },
                ui: {
                    ...state.ui,
                    ticketNavbar: {
                        ...state.ui.ticketNavbar,
                        optimisticAccountSettings: {
                            ...state.ui.ticketNavbar.optimisticAccountSettings,
                            views: {
                                ...state.ui.ticketNavbar
                                    .optimisticAccountSettings.views,
                                2001: {} as any,
                                2002: {} as any,
                            },
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(
                stateWithOnlyOptimisticSectionViews,
            )
            const section = result.find(
                (el): el is TicketNavbarSectionElement =>
                    el.type === TicketNavbarElementType.Section &&
                    el.data.id === 1,
            )

            expect(section?.children.map((child) => child.id)).toEqual([
                2001, 2002,
            ])
        })

        it('should sort section without display_order to the end', () => {
            const stateWithNewSection = {
                ...state,
                entities: {
                    ...state.entities,
                    sections: {
                        ...state.entities.sections,
                        '999': {
                            id: 999,
                            private: false,
                        },
                    },
                    views: {
                        ...state.entities.views,
                        '1001': {
                            id: 1001,
                            type: ViewType.TicketList,
                            visibility: ViewVisibility.Public,
                            section_id: 999,
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(stateWithNewSection)

            const sections = result.filter(
                (el): el is TicketNavbarSectionElement =>
                    el.type === TicketNavbarElementType.Section,
            )

            const lastSection = sections[sections.length - 1]
            expect(lastSection.data.id).toBe(999)
        })

        it('should use optimistic section display_order when available', () => {
            const stateWithOptimisticSectionOrder = {
                ...state,
                ui: {
                    ...state.ui,
                    ticketNavbar: {
                        ...state.ui.ticketNavbar,
                        optimisticAccountSettings: {
                            ...state.ui.ticketNavbar.optimisticAccountSettings,
                            view_sections: {
                                ...state.ui.ticketNavbar
                                    .optimisticAccountSettings.view_sections,
                                2: { display_order: 0 },
                            },
                        },
                    },
                },
            } as unknown as RootState

            const result = getPublicTicketNavbarElements(
                stateWithOptimisticSectionOrder,
            )
            const sections = result.filter(
                (el): el is TicketNavbarSectionElement =>
                    el.type === TicketNavbarElementType.Section,
            )

            expect(sections.map((section) => section.data.id)).toEqual([2, 1])
        })
    })

    describe('getPrivateTicketNavbarElements', () => {
        it('should return the elements', () => {
            expect(getPrivateTicketNavbarElements(state)).toMatchSnapshot()
        })

        it('should properly display a section view without section', () => {
            expect(
                getPrivateTicketNavbarElements({
                    ...state,
                    entities: { ...state.entities, sections: {} },
                }),
            ).toMatchSnapshot()
        })
    })
})
