import {fromJS} from 'immutable'

import {UserSettingType} from '../../../../config/types/user'
import {account} from '../../../../fixtures/account'
import {user} from '../../../../fixtures/users'
import {ViewType, ViewVisibility} from '../../../../models/view/types'
import {RootState} from '../../../types'
import {
    getPrivateTicketNavbarElements,
    getPublicTicketNavbarElements,
} from '../selectors'
import {AccountSettingType} from '../../../currentAccount/types'
import {initialState} from '../reducer'

describe('selectors', () => {
    const state: RootState = {
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
                            1: {display_order: 6},
                            2: {display_order: 3},
                            10: {display_order: 2},
                            4: {display_order: 4},
                        },
                        view_sections: {
                            1: {display_order: 1},
                            2: {display_order: 5},
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
                            5: {display_order: 7},
                            123: {display_order: 9},
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
    } as any

    describe('getPrivateTicketNavbarElements', () => {
        it('should return the elements', () => {
            expect(getPrivateTicketNavbarElements(state)).toMatchSnapshot()
        })

        it('should properly display a section view without section', () => {
            expect(
                getPrivateTicketNavbarElements({
                    ...state,
                    entities: {...state.entities, sections: {}},
                })
            ).toMatchSnapshot()
        })
    })

    describe('getPublicTicketNavbarElements', () => {
        it('should properly display a section view without section', () => {
            expect(
                getPublicTicketNavbarElements({
                    ...state,
                    entities: {...state.entities, sections: {}},
                })
            ).toMatchSnapshot()
        })
    })
})
