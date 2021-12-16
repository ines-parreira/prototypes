import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {renderWithRouter} from '../../../../../utils/testing'
import {EditionManagerContextProvider} from '../../providers/EditionManagerContext'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import HelpCenterArticlesView from '../HelpCenterArticlesView'

jest.mock('../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listArticles: jest.fn().mockResolvedValue({
                    data: {data: [], meta: {item_count: 0}},
                }),
                listArticleTranslations: jest.fn().mockResolvedValue({
                    data: {data: [], meta: {item_count: 0}},
                }),
                listLocales: jest.fn().mockResolvedValue({
                    data: [
                        {
                            name: 'English - USA',
                            code: 'en-US',
                        },
                        {
                            name: 'French - France',
                            code: 'fr-FR',
                        },
                        {
                            name: 'French - Canada',
                            code: 'fr-CA',
                        },
                        {
                            name: 'Czech - Czech Republic',
                            code: 'cs-CZ',
                        },
                    ],
                }),
            },
        }),
    }
})

jest.mock('../../providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getSingleHelpCenterResponseFixture,
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}

const route = {
    path: '/app/settings/help-center/:helpCenterId/articles',
    route: '/app/settings/help-center/1/articles',
}

describe('<HelpCenterArticlesView/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <EditionManagerContextProvider>
                        <HelpCenterArticlesView />
                    </EditionManagerContextProvider>
                </DndProvider>
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })
})
