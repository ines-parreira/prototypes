import {StoreState} from '../../../types'

import {initialState as articlesState} from '../../articles/reducer'
import {initialState as categoriesState} from '../../categories/reducer'
import {initialState as uiState} from '../reducer'

import {getCurrentHelpCenterId, getViewLanguage} from '../selectors'

const store: Partial<StoreState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
}

const nextStore: Partial<StoreState> = {
    helpCenter: {
        ui: {...uiState, currentLanguage: 'en-US', currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
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
