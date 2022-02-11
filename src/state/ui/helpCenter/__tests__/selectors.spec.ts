import {StoreState} from 'state/types'

import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from '../reducer'
import {getCurrentHelpCenterId, getViewLanguage} from '../selectors'

const store: Partial<StoreState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {helpCenter: uiState} as any,
}

const nextStore: Partial<StoreState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {
        helpCenter: {...uiState, currentLanguage: 'en-US', currentId: 1},
    } as any,
}

describe('Help Center/UI selectors', () => {
    describe('getViewLanguage()', () => {
        it('reads the current language', () => {
            expect(getViewLanguage(store as StoreState)).toEqual(null)
            expect(getViewLanguage(nextStore as StoreState)).toEqual('en-US')
        })
    })

    describe('getCurrentHelpCenterId()', () => {
        it('reads the current help center id', () => {
            expect(getCurrentHelpCenterId(store as StoreState)).toEqual(null)

            expect(getCurrentHelpCenterId(nextStore as StoreState)).toEqual(1)
        })
    })
})
