import React from 'react'
import {screen, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {RootState, StoreDispatch} from 'state/types'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getInitialRootCategory} from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import ArticleLandingPage from '../ArticleLandingPage'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('../../../../Imports/components/ImportSection', () => ({
    ImportSection: () => {
        return <div>Import Content</div>
    },
}))

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const queryClient = mockQueryClient()

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

describe('<ArticleLandingPage />', () => {
    it('should render', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(initialState)}>
                    <ArticleLandingPage
                        onCreateArticle={jest.fn()}
                        canUpdateArticle={true}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(screen.getByText('Create Article')).toBeInTheDocument()

        expect(
            screen.getByText(
                'Start with an article template that you can customize to fit your needs:'
            )
        ).toBeInTheDocument()
    })

    it('should trigger onCreateArticle', () => {
        const onCreateArticle = jest.fn()

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(initialState)}>
                    <ArticleLandingPage
                        onCreateArticle={onCreateArticle}
                        canUpdateArticle={true}
                    />
                </Provider>
            </QueryClientProvider>
        )

        screen.getByText('Create Article').click()

        expect(onCreateArticle).toHaveBeenCalled()
    })
})
