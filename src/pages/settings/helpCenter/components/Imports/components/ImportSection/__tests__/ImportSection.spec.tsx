import React from 'react'
import {Provider as ReduxProvider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {initialState as articlesState} from '../../../../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {renderWithRouter} from '../../../../../../../../utils/testing'
import {getSingleHelpCenterResponseFixture} from '../../../../../fixtures/getHelpCentersResponse.fixture'
import {useCurrentHelpCenter} from '../../../../../providers/CurrentHelpCenter'
import {buildCsvColumnMatchingUrl, fileIsTooBig} from '../utils'
import ImportSection from '../ImportSection'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            [getSingleHelpCenterResponseFixture.id]:
                getSingleHelpCenterResponseFixture,
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}

jest.mock('../../../../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                generateCsvTemplate: jest.fn(),
            },
        }),
    }
})

jest.mock('../../../../../providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

describe('<ImportSection />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders import modal', () => {
        const {container} = renderWithRouter(
            <ReduxProvider store={mockStore(defaultState)}>
                <ImportSection />
            </ReduxProvider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    describe('utils', () => {
        it.each([
            [{size: 900000}, false],
            [{size: 1000000}, true],
            [{size: 1100000}, true],
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
