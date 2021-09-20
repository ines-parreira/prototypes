import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import ImportSection from '../ImportSection'

import {getSingleHelpcenterResponseFixture as helpCenter} from '../../../../../fixtures/getHelpcenterResponse.fixture'

import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {initialState as articlesState} from '../../../../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../../../../state/helpCenter/categories/reducer'
import {buildCsvColumnMatchingUrl, fileIsTooBig} from '../utils'

import {renderWithRouter} from '../../../../../../../../utils/testing'

beforeEach(() => {
    jest.clearAllMocks()
})

describe('<ImportSection />', () => {
    let store: MockStoreEnhanced
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()

        store = mockStore({
            entities: {
                helpCenters: {
                    [helpCenter.id]: helpCenter,
                },
            } as any,
            helpCenter: {
                ui: {...uiState, currentId: 1},
                articles: articlesState,
                categories: categoriesState,
            },
        })
    })

    it('renders import modal', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <ImportSection />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    describe('utils', () => {
        it.each([
            [{size: 9000000}, false],
            [{size: 10000000}, true],
            [{size: 11000000}, true],
        ])(
            'fileIsTooBig returns true for files >= than 10MB',
            (file, expectedIsTooBig) => {
                expect(fileIsTooBig(file)).toEqual(expectedIsTooBig)
            }
        )

        it('buildCsvColumnMatchingUrl generated link from help center id and file url', () => {
            const fileUrl =
                'https://storage.googleapis.com/gorgias-help-center-staging-imports/gorgias-articles-1628254255.csv'

            const expectedLink =
                '/app/settings/help-center/1/import/csv/column-matching?file_url=https%3A%2F%2Fstorage.googleapis.com%2Fgorgias-help-center-staging-imports%2Fgorgias-articles-1628254255.csv'

            expect(buildCsvColumnMatchingUrl(1, fileUrl)).toEqual(expectedLink)
        })
    })
})
