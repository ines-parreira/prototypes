import _keyBy from 'lodash/keyBy'

import {StoreState} from 'state/types'

import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import {getCurrentHelpCenter, getHelpCenterList} from '../selectors'

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

    describe('getHelpCenterList', () => {
        it('returns the list', () => {
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

            expect(getHelpCenterList(dataStore as StoreState)).toEqual(
                getHelpCentersResponseFixture.data
            )
        })
    })
})
