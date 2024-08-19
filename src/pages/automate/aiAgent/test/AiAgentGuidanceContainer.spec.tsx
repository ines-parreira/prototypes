import React from 'react'
import {fireEvent, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {reportError} from 'utils/errors'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithRouter} from 'utils/testing'
import {AiAgentGuidanceContainer} from '../AiAgentGuidanceContainer'
import {useGuidanceArticles} from '../hooks/useGuidanceArticles'
import {getGuidanceArticleFixture} from '../fixtures/guidanceArticle.fixture'
import {
    DATA_TEST_ID,
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../constants'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'
import {useStoreConfiguration} from '../hooks/useStoreConfiguration'
import {getStoreConfigurationFixture} from '../fixtures/storeConfiguration.fixtures'
import {useGuidanceAiSuggestions} from '../hooks/useGuidanceAiSuggestions'

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
jest.mock('../hooks/useStoreConfiguration', () => ({
    useStoreConfiguration: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseStoreConfiguration = jest.mocked(useStoreConfiguration)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)

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
    isLoading: false,
    isAllAIGuidancesUsed: false,
    isEmptyStateNoAIGuidances: false,
    isEmptyStateAIGuidances: false,
    isGuidancesOnly: false,
    isGuidancesAndAIGuidances: false,
    getAiGuidanceById: jest.fn(),
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
describe('<AiAgentGuidanceContainer />', () => {
    beforeEach(() => {
        mockedUseStoreConfiguration.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                guidanceHelpCenterId: helpCenter.id,
            }),
            isLoading: false,
        })
        mockedUseGuidanceArticles.mockReturnValue(defaultGuidanceArticleProps)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceAiSuggestions.mockReturnValue(
            defaultGuidanceAiSuggestionsProps
        )
    })

    it('should render loader', () => {
        mockedUseStoreConfiguration.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: true,
        })
        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('should render alert about store configuration', () => {
        mockedUseStoreConfiguration.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
        })

        renderComponent()

        expect(
            screen.getByText((text) => text.includes('Please configure'))
        ).toBeInTheDocument()
    })

    it('should report error when guidance help center is not found', () => {
        mockedUseStoreConfiguration.mockReturnValue({
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
            isLoading: true,
        })

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
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

    it.skip('should render empty state component with ai guidances', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateAIGuidances: true,
        })

        renderComponent()

        expect(
            screen.getByTestId(DATA_TEST_ID.EmptyStateAIGuidances)
        ).toBeInTheDocument()
    })

    describe("when there's guidance articles", () => {
        it.skip('should render guidances and AI guidances', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesAndAIGuidances: true,
                guidanceArticles,
                guidanceAISuggestions: [{name: 'AI Guidance 1'} as any],
            })

            renderComponent()

            expect(
                screen.getByTestId(DATA_TEST_ID.GuidancesAndAIGuidances)
            ).toBeInTheDocument()
            expect(screen.getByText('AI Guidance 1')).toBeInTheDocument()
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
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByRole('button', {name: 'Create From Template'})
            ).toBeDisabled()
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

            const rowsBefore = screen.getAllByTestId('guidance-row')
            // Check first row title. Should be Asc be default
            expect(
                within(rowsBefore[0]).getByTestId('guidance-title')
            ).toHaveTextContent('New article')

            userEvent.click(screen.getByText('Last updated'))

            const rowsAfter = screen.getAllByTestId('guidance-row')
            // Check first row title. Should be Desc after click
            expect(
                within(rowsAfter[0]).getByTestId('guidance-title')
            ).toHaveTextContent('Old article')
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

            const rowsBefore = screen.getAllByTestId('guidance-row')

            const firstRowToggle = within(rowsBefore[0]).getByTestId(
                'guidance-visibility-toggle'
            )

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
