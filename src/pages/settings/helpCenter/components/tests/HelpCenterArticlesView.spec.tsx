import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {renderWithRouter} from '../../../../../utils/testing'

import HelpCenterArticlesView from '../HelpCenterArticlesView'

jest.mock('../../hooks/useHelpcenterApi', () => {
    return {
        useHelpcenterApi: () => ({
            isReady: true,
            client: {
                listArticleTranslations: jest.fn().mockReturnValue(
                    Promise.resolve({
                        data: [],
                    })
                ),
                listLocales: jest.fn().mockReturnValue([
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
                ]),
            },
        }),
    }
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    helpCenter: {
        articles: {
            articlesById: {},
        },
        categories: {
            categoriesById: {},
        },
    },
}

const mockNotify = jest.fn()

const route = {
    path: '/app/settings/help-center/:helpcenterId/articles',
    route: '/app/settings/help-center/1/articles',
}

describe('<HelpCenterArticlesView/>', () => {
    const props = {
        notify: mockNotify,
        match: {
            params: {
                helpcenterId: 1,
            },
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <DndProvider backend={HTML5Backend}>
                    <HelpCenterArticlesView {...props} />
                </DndProvider>
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })
})
