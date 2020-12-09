import {
    optimisticAccountSettingsReset,
    optimisticAccountSettingsSet,
    optimisticUserSettingsReset,
    optimisticUserSettingsSet,
} from '../actions'
import reducer, {initialState} from '../reducer'

describe('ticketNavbar reducer', () => {
    describe('optimisticAccountSettingsReset action', () => {
        it('should reset the account settings', () => {
            const newState = reducer(
                {
                    ...initialState,
                    optimisticAccountSettings: {
                        views: {
                            1: {display_order: 1},
                        },
                        view_sections: {},
                    },
                },
                optimisticAccountSettingsReset()
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('optimisticUserSettingsReset action', () => {
        it('should reset the user settings', () => {
            const newState = reducer(
                {
                    ...initialState,
                    optimisticUserSettings: {
                        views: {
                            1: {display_order: 1},
                        },
                        view_sections: {},
                    },
                },
                optimisticUserSettingsReset()
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('optimisticAccountSettingsSet action', () => {
        it('should set the account settings', () => {
            const newState = reducer(
                initialState,
                optimisticAccountSettingsSet({
                    views: {
                        1: {display_order: 1},
                    },
                    view_sections: {
                        1: {display_order: 2},
                    },
                })
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('optimisticUserSettingsSet action', () => {
        it('should set the user settings', () => {
            const newState = reducer(
                initialState,
                optimisticUserSettingsSet({
                    views: {
                        1: {display_order: 1},
                    },
                    view_sections: {
                        1: {display_order: 2},
                    },
                })
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
