import 'tests/__mocks__/editionManagerContextMock'

import React from 'react'

import { userEvent } from '@repo/testing'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useCategoriesOptions from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/hooks/useCategoriesOptions'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { AILibraryArticleItemsFixture } from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import { getInitialRootCategory } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState, StoreDispatch } from 'state/types'

import AIArticlesLibraryArticleEditor from '../AIArticlesLibraryArticleEditor'

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture.id,
)

jest.mock(
    'pages/settings/helpCenter/components/articles/ArticleCategorySelect/hooks/useCategoriesOptions',
)
;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
    { label: '- No category -', value: 'null' },
    { label: 'Orders', value: 1 },
    { label: 'Pricing', value: 2 },
])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))

const initialState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: {
                articlesById: {},
            },
            categories: {
                categoriesById: {
                    '0': getInitialRootCategory,
                },
            },
        },
    } as any,
    ui: {
        helpCenter: {
            currentId: 1,
            currentLanguage: 'en-US',
        },
    } as any,
}

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const wrapper = ({ children }: any) => (
    <Provider store={mockedStore(initialState)}>
        <CurrentHelpCenterContext.Provider
            value={getSingleHelpCenterResponseFixture}
        >
            <EditionManagerContextProvider>
                {children}
            </EditionManagerContextProvider>
        </CurrentHelpCenterContext.Provider>
    </Provider>
)

const article = AILibraryArticleItemsFixture[0]

describe('AIArticlesLibraryArticleEditor', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture,
        )
    })
    it('renders without crashing', () => {
        render(
            <AIArticlesLibraryArticleEditor
                isLoading={false}
                locale="en-US"
                onEditorClose={jest.fn()}
                onEditorSave={jest.fn()}
                article={article}
                isEditModalOpen={false}
            />,
            {
                wrapper,
            },
        )
    })

    it('displays the article title', () => {
        const { getByTestId } = render(
            <AIArticlesLibraryArticleEditor
                onEditorClose={jest.fn()}
                isLoading={false}
                locale="en-US"
                onEditorSave={jest.fn()}
                article={article}
                isEditModalOpen={false}
            />,
            { wrapper },
        )

        expect(getByTestId('article-title-input')).toHaveValue(article.title)
    })

    it('calls onEditorClose when the close button is clicked', () => {
        const onEditorClose = jest.fn()

        const { getByText } = render(
            <AIArticlesLibraryArticleEditor
                onEditorClose={onEditorClose}
                isLoading={false}
                locale="en-US"
                onEditorSave={jest.fn()}
                article={article}
                isEditModalOpen={false}
            />,
            { wrapper },
        )

        userEvent.click(getByText('keyboard_tab'))

        expect(onEditorClose).toHaveBeenCalled()
    })

    it('calls onEditorSave when the save button is clicked', () => {
        const onEditorSave = jest.fn()

        const { getByTestId } = render(
            <AIArticlesLibraryArticleEditor
                onEditorSave={onEditorSave}
                isLoading={false}
                locale="en-US"
                onEditorClose={jest.fn()}
                article={article}
                isEditModalOpen={false}
            />,
            { wrapper },
        )

        userEvent.click(getByTestId('save-changes-button'))

        expect(onEditorSave).toHaveBeenCalled()
    })
})
