import {StoreState} from '../../../types'

import {initialState as articlesState} from '../../articles/reducer'
import {initialState as categoriesState} from '../../categories/reducer'

import {readViewLanguage} from '../selectors'

const store: Partial<StoreState> = {
    helpCenter: {
        ui: {
            currentLanguage: 'en-US',
        },
        articles: articlesState,
        categories: categoriesState,
    },
}

describe('Help Center/UI selectors', () => {
    describe('readViewLanguage()', () => {
        it('reads the current language', () => {
            expect(readViewLanguage(store as StoreState)).toEqual('en-US')
        })
    })
})
