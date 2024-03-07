import _keyBy from 'lodash/keyBy'

import {StoreState} from 'state/types'

import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import {
    getActiveHelpCenterList,
    getCurrentHelpCenter,
    getHelpcenterListByTypes,
} from '../selectors'

describe('Entities/Help Center', () => {
    describe('getCurrentHelpCenter', () => {
        it('returns null if the currentId is not defined', () => {
            const store: Partial<StoreState> = {
                entities: {
                    helpCenter: helpCenterInitialState,
                } as any,
                ui: {helpCenter: uiState} as any,
            }
            expect(getCurrentHelpCenter(store as StoreState)).toEqual(null)
        })

        it('returns the right help center by currentId', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: _keyBy(
                                getHelpCentersResponseFixture.data,
                                'id'
                            ),
                        },
                        articles: articlesState,
                        categories: categoriesState,
                    },
                } as any,
                ui: {
                    helpCenter: {
                        ...uiState,
                        currentId: 1,
                    },
                } as any,
            }

            expect(getCurrentHelpCenter(dataStore as StoreState)).toEqual(
                getHelpCentersResponseFixture.data[0]
            )
        })
    })

    describe('getHelpcenterListByTypes', () => {
        const helpCentersById = _keyBy(
            getHelpCentersResponseFixture.data.map((helpCenter, index) => {
                if (index === 0) {
                    // faking the type of 'guidance' for the first help center
                    return {...helpCenter, type: 'guidance'}
                }

                return helpCenter
            }),
            'id'
        )

        it('returns the list of all help center regardless of their types', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById,
                        },
                    },
                } as any,
            }

            const selectedHelpCenters = getHelpcenterListByTypes()(
                dataStore as StoreState
            )

            expect(selectedHelpCenters).toEqual(Object.values(helpCentersById))

            expect(
                Object.values(helpCentersById).some(
                    (helpCenter) => helpCenter.type === 'faq'
                )
            ).toEqual(true)
            expect(
                Object.values(helpCentersById).some(
                    (helpCenter) => helpCenter.type === 'guidance'
                )
            ).toEqual(true)
        })

        it('returns the list of all help center of type "faq"', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById,
                        },
                    },
                } as any,
            }

            const selectedHelpCenters = getHelpcenterListByTypes(['faq'])(
                dataStore as StoreState
            )

            expect(
                Object.values(selectedHelpCenters).every(
                    (helpCenter) => helpCenter.type === 'faq'
                )
            ).toBeTruthy()
            expect(
                Object.values(selectedHelpCenters).some(
                    (helpCenter) => helpCenter.type === 'guidance'
                )
            ).toBeFalsy()
        })

        it('returns the list of all help center of type "guidance"', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById,
                        },
                    },
                } as any,
            }

            const selectedHelpCenters = getHelpcenterListByTypes(['guidance'])(
                dataStore as StoreState
            )

            expect(
                Object.values(selectedHelpCenters).every(
                    (helpCenter) => helpCenter.type === 'guidance'
                )
            ).toBeTruthy()
            expect(
                Object.values(selectedHelpCenters).some(
                    (helpCenter) => helpCenter.type === 'faq'
                )
            ).toBeFalsy()
        })
    })
    describe('getActiveHelpCenterList', () => {
        it('returns the list of active help centers', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: _keyBy(
                                getHelpCentersResponseFixture.data,
                                'id'
                            ),
                        },
                    },
                } as any,
            }

            expect(getActiveHelpCenterList(dataStore as StoreState)).toEqual(
                getHelpCentersResponseFixture.data.filter(
                    (helpCenter) => !helpCenter.deactivated_datetime
                )
            )
        })
    })
})
