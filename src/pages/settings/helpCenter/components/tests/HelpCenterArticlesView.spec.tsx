import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {EditionManagerContextProvider} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import HelpCenterArticlesView from '../HelpCenterArticlesView'
import {SearchContextProvider} from '../../providers/SearchContext'
import {useHelpCenterCategories} from '../../hooks/useHelpCenterCategories'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
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
            },
        }),
    }
})

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

jest.mock('hooks/useModalManager/useModalManager.tsx', () => {
    return {
        useModalManager: () => ({
            getParams: jest.fn().mockReturnValue({id: 1}),
            isOpen: jest.fn().mockReturnValue(false),
            on: jest.fn(),
        }),
    }
})
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterCategories')
;(useHelpCenterCategories as jest.Mock).mockReturnValue({
    categories: [
        {
            created_datetime: '2022-03-07T14:46:47.212Z',
            updated_datetime: '2022-03-07T14:46:47.212Z',
            deleted_datetime: null,
            id: 0,
            help_center_id: 3,
            available_locales: [],
            children: [],
            articles: [],
            translation: null,
        },
    ],
    isLoading: false,
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
}

const route = {
    path: '/app/settings/help-center/:helpCenterId/articles',
    route: '/app/settings/help-center/1/articles',
}

describe('<HelpCenterArticlesView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <EditionManagerContextProvider>
                        <SearchContextProvider
                            helpCenter={getSingleHelpCenterResponseFixture}
                        >
                            <HelpCenterArticlesView />
                        </SearchContextProvider>
                    </EditionManagerContextProvider>
                </DndProvider>
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })
})
