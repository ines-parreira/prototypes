import {fireEvent, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {useAiAgentEnabled} from 'pages/aiAgent/hooks/useAiAgentEnabled'
import history from 'pages/history'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {reportError} from 'utils/errors'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {AiAgentGuidanceContainer} from '../AiAgentGuidanceContainer'
import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../constants'
import {getGuidanceArticleFixture} from '../fixtures/guidanceArticle.fixture'
import {getStoreConfigurationFixture} from '../fixtures/storeConfiguration.fixtures'
import {useGuidanceAiSuggestions} from '../hooks/useGuidanceAiSuggestions'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'
import {useGuidanceArticles} from '../hooks/useGuidanceArticles'
import {useAiAgentStoreConfigurationContext} from '../providers/AiAgentStoreConfigurationContext'

jest.mock('pages/history')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('sanitize-html', () => () => jest.fn())
jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('../hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: jest.fn(),
}))

jest.mock('../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

jest.mock('models/helpCenter/queries')

jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))

const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)
const mockUseGetHelpCenterList = jest.mocked(useGetHelpCenterList)
const mockedUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext
)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

const helpCenter = {...getHelpCentersResponseFixture.data[0], type: 'guidance'}
const defaultGuidanceArticleProps: ReturnType<typeof useGuidanceArticles> = {
    guidanceArticles: [],
    isGuidanceArticleListLoading: false,
}
const defaultGuidanceArticleMutationProps: ReturnType<
    typeof useGuidanceArticleMutation
> = {
    createGuidanceArticle: jest.fn(),
    deleteGuidanceArticle: jest.fn(),
    updateGuidanceArticle: jest.fn(),
    isGuidanceArticleUpdating: false,
    isGuidanceArticleDeleting: false,
}

const defaultGuidanceAiSuggestionsProps: ReturnType<
    typeof useGuidanceAiSuggestions
> = {
    guidanceArticles: [],
    guidanceAISuggestions: [],
    isLoadingAiGuidances: false,
    isLoadingGuidanceArticleList: false,
    isAllAIGuidancesUsed: false,
    isEmptyStateNoAIGuidances: false,
    isEmptyStateAIGuidances: false,
    isGuidancesOnly: false,
    isGuidancesAndAIGuidances: false,
    invalidateAiGuidances: jest.fn(),
}

const mockStore = configureMockStore([thunk])

const renderComponent = () => {
    renderWithRouter(
        <Provider
            store={mockStore({
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                [helpCenter.id]: helpCenter,
                            },
                        },
                    },
                },
            })}
        >
            <AiAgentGuidanceContainer />
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/guidance`,
            route: '/shopify/test-shop/ai-agent/guidance',
        }
    )
}

const mockedAiAgentStoreConfigurationContext = {
    isLoading: false,
    updateStoreConfiguration: jest.fn(),
    createStoreConfiguration: jest.fn(),
    isPendingCreateOrUpdate: false,
}

describe('<AiAgentGuidanceContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture({
                guidanceHelpCenterId: helpCenter.id,
            }),
        })
        mockedUseGuidanceArticles.mockReturnValue(defaultGuidanceArticleProps)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceAiSuggestions.mockReturnValue(
            defaultGuidanceAiSuggestionsProps
        )
        mockUseGetHelpCenterList.mockReturnValue({
            data: axiosSuccessResponse({
                data: [helpCenter],
            }),
            isLoading: false,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })

    it('should render loader', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: undefined,
            isLoading: true,
        })
        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument
    })

    it('should render loader if help centers are loading', () => {
        mockUseGetHelpCenterList.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)
        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument
    })

    it('should render alert about store configuration', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: undefined,
            isLoading: false,
        })

        renderComponent()

        expect(
            screen.getByText((text) => text.includes('Please configure'))
        ).toBeInTheDocument()
    })

    it('should report error when guidance help center is not found', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture({
                guidanceHelpCenterId: undefined,
            }),
            isLoading: false,
        })
        renderComponent()
        expect(reportError).toHaveBeenCalled()
    })

    it('should render loader when guidance articles are loading', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isLoadingAiGuidances: true,
        })

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render empty state component', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateNoAIGuidances: true,
        })

        renderComponent()

        expect(screen.getByText('Create Custom Guidance')).toBeInTheDocument()
        expect(screen.getByText('Create From Template')).toBeInTheDocument()
    })

    it('should render empty state component with ai guidances', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateAIGuidances: true,
        })

        renderComponent()

        expect(
            screen.getByText(
                /Add Guidance to tell AI Agent how to handle specific/
            )
        ).toBeInTheDocument()

        const createCustomGuidanceButton = screen.getByText(
            'Create Custom Guidance'
        )
        userEvent.click(createCustomGuidanceButton)

        expect(history.push).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/ai-agent/guidance/new'
        )
    })

    it('should redirect to guidance library page on click', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateAIGuidances: true,
        })

        renderComponent()

        const browseSuggestions = screen.getByText('Browse Suggestions')
        userEvent.click(browseSuggestions)

        expect(history.push).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/ai-agent/guidance/library'
        )
    })

    describe("when there's guidance articles", () => {
        it('should render guidances and AI guidances', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesAndAIGuidances: true,
                guidanceArticles,
                guidanceAISuggestions: [{name: 'AI Guidance 1'} as any],
            })

            renderComponent()

            expect(screen.getByText('AI Guidance 1')).toBeInTheDocument()

            expect(
                screen.queryByRole('button', {name: 'Create From Template'})
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', {name: 'Browse Suggestions'})
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {name: 'Create Custom Guidance'})
            ).toBeInTheDocument()
        })

        it('should render guidance list', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByText(guidanceArticles[0].title)
            ).toBeInTheDocument()
        })

        it('should call delete action when delete button is clicked', () => {
            const deleteGuidanceArticle = jest.fn()
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })
            mockedUseGuidanceArticleMutation.mockReturnValue({
                ...defaultGuidanceArticleMutationProps,
                deleteGuidanceArticle,
            })

            renderComponent()

            userEvent.click(
                screen.getByRole('button', {name: 'Delete guidance'})
            )

            userEvent.click(screen.getByText('Delete'))

            expect(deleteGuidanceArticle).toHaveBeenCalledWith(
                guidanceArticles[0].id
            )
        })

        it('should show warning about guidance article limit', () => {
            const guidanceArticles = Array(GUIDANCE_ARTICLE_LIMIT_WARNING)
                .fill(null)
                .map((_, index) => getGuidanceArticleFixture(index))
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByText(
                    `You’ve added ${GUIDANCE_ARTICLE_LIMIT_WARNING} out of ${GUIDANCE_ARTICLE_LIMIT} pieces of guidance.`
                )
            ).toBeInTheDocument()
        })

        it('should disable creation button when guidance limit reached', () => {
            const guidanceArticles = Array(GUIDANCE_ARTICLE_LIMIT)
                .fill(null)
                .map((_, index) => getGuidanceArticleFixture(index))
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesAndAIGuidances: false,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByRole('button', {name: 'Create From Template'})
            ).toBeAriaDisabled()
        })

        it('should sort guidance articles by last updated', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1, {
                    title: 'Old article',
                    lastUpdated: '2024-03-18T12:21:00.531Z',
                }),
                getGuidanceArticleFixture(2, {
                    title: 'New article',
                    lastUpdated: '2024-04-18T12:21:00.531Z',
                }),
            ]

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            // Check first row title. Should be Asc by default
            expect(document.querySelector('tbody tr')).toHaveTextContent(
                'New article'
            )

            userEvent.click(screen.getByText('Last updated'))

            // Check first row title. Should be Desc after click
            expect(document.querySelector('tbody tr')).toHaveTextContent(
                'Old article'
            )
        })

        it('should change guidance visibility', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1, {
                    title: 'Old article',
                    lastUpdated: '2024-03-18T12:21:00.531Z',
                }),
                getGuidanceArticleFixture(2, {
                    title: 'New article',
                    lastUpdated: '2024-04-18T12:21:00.531Z',
                }),
            ]
            const updateGuidanceArticle = jest.fn()

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            mockedUseGuidanceArticleMutation.mockReturnValue({
                ...defaultGuidanceArticleMutationProps,
                updateGuidanceArticle,
            })

            renderComponent()

            const firstRowToggle = within(
                document.querySelector('tbody tr')!
            ).getByRole('checkbox', {name: 'Toggle guidance visibility'})

            expect(firstRowToggle).toBeChecked()

            fireEvent.click(firstRowToggle)

            expect(updateGuidanceArticle).toHaveBeenCalledWith(
                {
                    visibility: 'UNLISTED',
                },
                {
                    articleId: guidanceArticles[0].id,
                    locale: guidanceArticles[0].locale,
                }
            )
        })
    })
})
