import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {renderWithRouter} from '../../../../../utils/testing'

import {getSingleHelpcenterResponseFixture} from '../../fixtures/getHelpcenterResponse.fixture'
import {getArticlesResponseFixture} from '../../fixtures/getArticlesResponse.fixture'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'
import {getCategoriesResponseEnglish} from '../../fixtures/getCategoriesResponse.fixtures'

import HelpCenterArticlesView from '../HelpCenterArticlesView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenterArticles: {
            '1': getArticlesResponseFixture.data[0],
            '2': getArticlesResponseFixture.data[1],
            '3': getArticlesResponseFixture.data[2],
            '4': getArticlesResponseFixture.data[3],
        },
    } as any,
}

const mockedGetHelpCenter = () =>
    Promise.resolve({
        data: getSingleHelpcenterResponseFixture,
    })
const mockedListArticles = () => Promise.resolve(getArticlesResponseFixture)
const mockedListLocales = () => Promise.resolve(getLocalesResponseFixture)
const mockedListCategories = () =>
    Promise.resolve({
        data: getCategoriesResponseEnglish,
    })
const mockedListCategoryArticles = () =>
    Promise.resolve({
        data: getArticlesResponseFixture,
    })
const mockedGetPositions = () =>
    Promise.resolve({
        data: [],
    })
const mockedListArticleTranslations = jest.fn()
const mockedUpdateArticleTranslation = jest.fn()
const mockedCreateArticle = jest.fn()
const mockedDeleteArticle = jest.fn()

const mockedHelpCenterClient = {
    getHelpCenter: mockedGetHelpCenter,
    listArticles: mockedListArticles,
    listArticleTranslations: mockedListArticleTranslations,
    updateArticleTranslation: mockedUpdateArticleTranslation,
    createArticle: mockedCreateArticle,
    deleteArticle: mockedDeleteArticle,
    listLocales: mockedListLocales,
    listCategories: mockedListCategories,
    listCategoryArticles: mockedListCategoryArticles,
    getCategoriesPositions: mockedGetPositions,
    getCategoryArticlesPositions: mockedGetPositions,
    getUncategorizedArticlesPositions: mockedGetPositions,
}
jest.mock('../../../../../../../../rest_api/help_center_api/index', () => ({
    getHelpCenterClient: () => Promise.resolve(mockedHelpCenterClient),
}))

const mockNotify = jest.fn()
const mockHelpCenterArticleCreated = jest.fn()
const mockHelpCenterArticleDeleted = jest.fn()
const mockHelpcenterArticlesFetched = jest.fn()
const mockHelpCenterArticleUpdated = jest.fn()

const route = {
    path: '/app/settings/help-center/:helpcenterId/articles',
    route: '/app/settings/help-center/1/articles',
}

describe('<HelpCenterArticlesView/>', () => {
    const props = {
        notify: mockNotify,
        helpCenterArticleCreated: mockHelpCenterArticleCreated,
        helpCenterArticleDeleted: mockHelpCenterArticleDeleted,
        helpcenterArticlesFetched: mockHelpcenterArticlesFetched,
        helpCenterArticleUpdated: mockHelpCenterArticleUpdated,
    }

    beforeEach(() => {
        jest.resetAllMocks()
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

    describe('Edit modale', () => {
        it('should be closed on initialization', () => {
            const {queryByRole} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <DndProvider backend={HTML5Backend}>
                        <HelpCenterArticlesView {...props} />
                    </DndProvider>
                </Provider>,
                route
            )
            const closeModaleButton = queryByRole('button', {
                name: /close modal/i,
            })
            expect(closeModaleButton).toBeNull()
        })
        // ! Redo these tests to wait for the modal to load content.
        // ! These tests are failing with `<div class="modal open"></div>`
        // it('should open the edit modale in normal mode when click on a row', async () => {
        //     const {findAllByRole, findByRole} = renderWithRouter(
        //         <Provider store={mockedStore(defaultState)}>
        //             <DndProvider backend={HTML5Backend}>
        //                 <HelpCenterArticlesView {...props} />
        //             </DndProvider>
        //         </Provider>,
        //         route
        //     )
        //     const rows = await findAllByRole('row', {
        //         name: /open article/i,
        //     })
        //     const firstRow = rows[0]
        //     fireEvent.click(firstRow)
        //     const closeModaleButton = await findByRole('button', {
        //         name: /close modal/i,
        //     })
        //     expect(closeModaleButton).toBeDefined()
        // })
        // it('should open the edit modale in advanced mode when click on the gear button', async () => {
        //     const {findAllByTestId, findAllByText} = renderWithRouter(
        //         <Provider store={mockedStore(defaultState)}>
        //             <DndProvider backend={HTML5Backend}>
        //                 <HelpCenterArticlesView {...props} />
        //             </DndProvider>
        //         </Provider>,
        //         route
        //     )
        //     const gearButtons = await findAllByTestId('articleSettings')
        //     const firstGearButton = gearButtons[0]
        //     fireEvent.click(firstGearButton)
        //     const slugTextBox = await findAllByText('Article Settings')
        //     expect(slugTextBox).toBeDefined()
        // })
    })
})
