import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { toast } from '@gorgias/axiom'

import { billingState } from 'fixtures/billing'
import { useSelfServiceStoreIntegration } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { getArticlesResponseFixture } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useCurrentHelpCenter } from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { useHelpCenterCategories } from '../../hooks/useHelpCenterCategories'
import { SearchContextProvider } from '../../providers/SearchContext'
import { useHasAccessToAILibrary } from '../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { HelpCenterArticlesView } from '../HelpCenterArticlesView'

const mockGetArticle = jest.fn()
const mockListArticleTranslations = jest.fn()
const mockListArticles = jest.fn()

jest.mock('../AIArticlesLibraryView/hooks/useHasAccessToAILibrary')
;(useHasAccessToAILibrary as jest.Mock).mockReturnValue(true)
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listArticles: mockListArticles,
                listArticleTranslations: mockListArticleTranslations,
                getArticle: mockGetArticle,
            },
            agentAbility: [
                {
                    action: 'manage',
                    subject: 'all',
                },
            ],
        }),
        useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
    }
})
jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
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
            getParams: jest.fn().mockReturnValue({ id: 1 }),
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
jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration')
;(useSelfServiceStoreIntegration as jest.Mock).mockReturnValue({
    id: 1,
    name: 'My Shop',
})
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
    ui: { helpCenter: { ...uiState, currentId: 1 } } as any,
    billing: fromJS(billingState),
}
const route = {
    path: '/app/settings/help-center/:helpCenterId/articles',
    route: '/app/settings/help-center/1/articles',
}

const renderComponent = (initialEntry: string = route.route) =>
    render(
        <EditionManagerContextProvider>
            <SearchContextProvider
                helpCenter={getSingleHelpCenterResponseFixture}
            >
                <HelpCenterArticlesView />
            </SearchContextProvider>
        </EditionManagerContextProvider>,
        {
            path: route.path,
            initialEntries: [initialEntry],
            dndBackend: HTML5Backend,
            storeState: defaultState,
        },
    )

const existingArticleFixture = getArticlesResponseFixture.data[0]

describe('<HelpCenterArticlesView />', () => {
    beforeEach(() => {
        mockListArticles.mockResolvedValue({
            data: { data: [], meta: { item_count: 0 } },
        })
        mockListArticleTranslations.mockResolvedValue({
            data: { data: [], meta: { item_count: 0 } },
        })
        mockGetArticle.mockResolvedValue({ data: existingArticleFixture })
    })

    afterEach(() => {
        toast.dismiss()
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /help center preview/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /appearance/i }),
        ).toBeInTheDocument()
    })

    it('shows an error toast when fetching the article from the URL fails', async () => {
        mockGetArticle.mockRejectedValue(new Error('boom'))

        renderComponent(`${route.route}?article_id=10`)

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Failed to fetch article',
                }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
    })
})
