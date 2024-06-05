import React from 'react'
import {fireEvent, screen, within} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import userEvent from '@testing-library/user-event'
import {FeatureFlagKey} from 'config/featureFlags'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithRouter} from 'utils/testing'
import {AiAgentGuidanceContainer} from '../AiAgentGuidanceContainer'
import {useAiAgentHelpCenter} from '../hooks/useAiAgentHelpCenter'
import {useGuidanceArticles} from '../hooks/useGuidanceArticles'
import {getGuidanceArticleFixture} from '../fixtures/guidanceArticle.fixture'
import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../constants'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('sanitize-html', () => () => jest.fn())
jest.mock('../hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)

jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentGuidance]: true,
    [FeatureFlagKey.AiAgentSettings]: true,
    [FeatureFlagKey.AiAgentGuidanceToggle]: true,
}))
const helpCenter = getHelpCentersResponseFixture.data[0]
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

const renderComponent = () => {
    renderWithRouter(<AiAgentGuidanceContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance`,
        route: '/shopify/test-shop/ai-agent/guidance',
    })
}
describe('<AiAgentGuidanceContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticles.mockReturnValue(defaultGuidanceArticleProps)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
    })

    it('should render loader', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(
            screen.getByText((text) => text.includes('Please configure'))
        ).toBeInTheDocument()
    })

    it('should render empty state component', () => {
        renderComponent()

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
        expect(screen.getByText('Start with a template')).toBeInTheDocument()
    })

    describe("when there's guidance articles", () => {
        it('should render guidance list', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceArticles.mockReturnValue({
                ...defaultGuidanceArticleProps,
                guidanceArticles,
                isGuidanceArticleListLoading: false,
            })

            renderComponent()

            expect(
                screen.getByText(guidanceArticles[0].title)
            ).toBeInTheDocument()
        })

        it('should call delete action when delete button is clicked', () => {
            const deleteGuidanceArticle = jest.fn()
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceArticles.mockReturnValue({
                ...defaultGuidanceArticleProps,
                guidanceArticles,
                isGuidanceArticleListLoading: false,
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
            mockedUseGuidanceArticles.mockReturnValue({
                ...defaultGuidanceArticleProps,
                guidanceArticles,
                isGuidanceArticleListLoading: false,
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
            mockedUseGuidanceArticles.mockReturnValue({
                ...defaultGuidanceArticleProps,
                guidanceArticles,
                isGuidanceArticleListLoading: false,
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

            mockedUseGuidanceArticles.mockReturnValue({
                ...defaultGuidanceArticleProps,
                guidanceArticles,
                isGuidanceArticleListLoading: false,
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

            mockedUseGuidanceArticles.mockReturnValue({
                ...defaultGuidanceArticleProps,
                guidanceArticles,
                isGuidanceArticleListLoading: false,
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
