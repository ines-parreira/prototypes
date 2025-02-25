import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import { getInitialRootCategory } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getValidStoreIntegrationId } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ArticleLandingPage from '../ArticleLandingPage'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('../../../../Imports/components/ImportSection', () => ({
    ImportSection: () => {
        return <div>Import Content</div>
    },
}))
jest.mock('pages/settings/helpCenter/utils/helpCenter.utils')
;(getValidStoreIntegrationId as jest.Mock).mockReturnValue(1)

const queryClient = mockQueryClient()

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

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
    },
    ui: {
        helpCenter: {
            currentId: 1,
            currentLanguage: 'en-US',
        },
    },
    integrations: fromJS({
        integrations: [
            { id: 1, type: IntegrationType.Shopify, name: 'My Shop' },
        ],
    }),
} as unknown as RootState

describe('<ArticleLandingPage />', () => {
    it('should render', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(initialState)}>
                    <EditionManagerContextProvider>
                        <ArticleLandingPage
                            onCreateArticle={jest.fn()}
                            onCreateArticleWithTemplate={jest.fn()}
                            canUpdateArticle={true}
                            showBackButton={false}
                            onBackButtonClick={jest.fn()}
                        />
                    </EditionManagerContextProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Create Article')).toBeInTheDocument()

        expect(
            screen.getByText('Choose a customizable article template:'),
        ).toBeInTheDocument()
    })

    it('should trigger onCreateArticle', () => {
        const onCreateArticle = jest.fn()

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(initialState)}>
                    <EditionManagerContextProvider>
                        <ArticleLandingPage
                            onCreateArticle={onCreateArticle}
                            onCreateArticleWithTemplate={jest.fn()}
                            canUpdateArticle={true}
                            showBackButton={false}
                            onBackButtonClick={jest.fn()}
                        />
                    </EditionManagerContextProvider>
                </Provider>
            </QueryClientProvider>,
        )

        screen.getByText('Create Article').click()

        expect(onCreateArticle).toHaveBeenCalled()
    })
    it('should render when an account has a single Shopify integration', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(initialState)}>
                    <EditionManagerContextProvider>
                        <ArticleLandingPage
                            onCreateArticle={jest.fn()}
                            onCreateArticleWithTemplate={jest.fn()}
                            canUpdateArticle={true}
                            showBackButton={false}
                            onBackButtonClick={jest.fn()}
                        />
                    </EditionManagerContextProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Create Article')).toBeInTheDocument()

        expect(
            screen.getByText('Choose a customizable article template:'),
        ).toBeInTheDocument()
    })
    it('should render when help center does not have a store connection', () => {
        ;(getValidStoreIntegrationId as jest.Mock).mockReturnValue(null)
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(initialState)}>
                    <EditionManagerContextProvider>
                        <ArticleLandingPage
                            onCreateArticle={jest.fn()}
                            onCreateArticleWithTemplate={jest.fn()}
                            canUpdateArticle={true}
                            showBackButton={false}
                            onBackButtonClick={jest.fn()}
                        />
                    </EditionManagerContextProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Create Article')).toBeInTheDocument()

        expect(
            screen.getByText('Choose a customizable article template:'),
        ).toBeInTheDocument()
    })
})
