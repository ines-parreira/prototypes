import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {renderWithRouter} from '../../../../../utils/testing'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'

import HelpCenterArticlesView from '../HelpCenterArticlesView'

jest.mock('../../hooks/useHelpcenterApi', () => {
    return {
        useHelpcenterApi: () => ({
            isReady: true,
            client: {
                listArticleTranslations: jest.fn().mockResolvedValue({
                    data: [],
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

jest.mock('../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
}

const route = {
    path: '/app/settings/help-center/:helpcenterId/articles',
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
                    <HelpCenterArticlesView />
                </DndProvider>
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })
})
