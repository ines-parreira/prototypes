import _keyBy from 'lodash/keyBy'

import {StoreState} from '../../../types'

import {getHelpcentersResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getHelpcenterResponse.fixture'

import {initialState as uiState} from '../../../helpCenter/ui/reducer'
import {initialState as articlesState} from '../../../helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../helpCenter/categories/reducer'

import {getCurrentHelpCenter, getHelpcenterSortedList} from '../selectors'

describe('Entities/Help Center', () => {
    describe('getCurrentHelpCenter', () => {
        it('returns null if the currentId is not defined', () => {
            const store: Partial<StoreState> = {
                entities: {
                    helpCenters: {},
                } as any,
                helpCenter: {
                    ui: uiState,
                    articles: articlesState,
                    categories: categoriesState,
                },
            }
            expect(getCurrentHelpCenter(store as StoreState)).toEqual(null)
        })

        it('returns the right help center by currentId', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenters: _keyBy(getHelpcentersResponseFixture, 'id'),
                } as any,
                helpCenter: {
                    ui: {
                        ...uiState,
                        currentId: 1,
                    },
                    articles: articlesState,
                    categories: categoriesState,
                },
            }

            expect(getCurrentHelpCenter(dataStore as StoreState)).toEqual(
                getHelpcentersResponseFixture[0]
            )
        })
    })

    describe('getHelpcenterSortedList', () => {
        it('returns the list sorted by created date', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    helpCenters: _keyBy(getHelpcentersResponseFixture, 'id'),
                } as any,
            }
            const sortedFixture = getHelpcentersResponseFixture.sort(
                (
                    {created_datetime: createdDate1},
                    {created_datetime: createdDate2}
                ) => {
                    if (
                        new Date(createdDate1).getTime() >
                        new Date(createdDate2).getTime()
                    ) {
                        return -1
                    }
                    return 1
                }
            )

            expect(getHelpcenterSortedList(dataStore as StoreState)).toEqual(
                sortedFixture
            )
        })
    })
})
