import React from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {renderWithRouter} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {FeatureFlagKey} from 'config/featureFlags'
import {useGuidanceHelpCenter} from '../hooks/useGuidanceHelpCenter'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'
import {AiAgentGuidanceDetailContainer} from '../AiAgentGuidanceDetailContainer'
import {useGuidanceArticle} from '../hooks/useGuidanceArticle'
import {getGuidanceArticleFixture} from '../fixtures/guidanceArticle.fixture'

jest.mock('../hooks/useGuidanceHelpCenter', () => ({
    useGuidanceHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js',
    () => {
        const ComponentToMock = () => <div />
        return ComponentToMock
    }
)
jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentGuidance]: true,
    [FeatureFlagKey.AiAgentSettings]: true,
}))

const mockedUseGuidanceHelpCenter = jest.mocked(useGuidanceHelpCenter)
const mockedUseGuidanceArticle = jest.mocked(useGuidanceArticle)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)

const helpCenter = getHelpCentersResponseFixture.data[0]
const defaultGuidanceArticleMutationProps: ReturnType<
    typeof useGuidanceArticleMutation
> = {
    createGuidanceArticle: jest.fn(),
    deleteGuidanceArticle: jest.fn(),
    updateGuidanceArticle: jest.fn(),
    isGuidanceArticleUpdating: false,
    isGuidanceArticleDeleting: false,
}
const guidanceArticle = getGuidanceArticleFixture(1)

const renderComponent = (articleId = 1) => {
    renderWithRouter(<AiAgentGuidanceDetailContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance/:articleId`,
        route: `/shopify/test-shop/ai-agent/guidance/${articleId}`,
    })
}
describe('<AiAgentGuidanceDetail />', () => {
    beforeEach(() => {
        mockedUseGuidanceHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceArticle.mockReturnValue({
            guidanceArticle: guidanceArticle,
            isGuidanceArticleLoading: false,
        })
    })

    it('should render loader when no help center', () => {
        mockedUseGuidanceHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render loader when guidance article query has not fulfilled', () => {
        mockedUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: true,
        })

        renderComponent()

        expect(screen.getByTestId('article-loader')).toBeInTheDocument()
    })

    it('should render guidance', () => {
        renderComponent()

        expect(screen.getByLabelText(/Guidance name/)).toHaveValue(
            guidanceArticle.title
        )
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Save And Test')).toBeInTheDocument()
        expect(screen.getByText('Delete Guidance')).toBeInTheDocument()
    })

    it('should disable inputs when data not changed', () => {
        renderComponent()

        expect(
            screen.getByRole('button', {name: 'Save Changes'})
        ).toBeDisabled()
        expect(
            screen.getByRole('button', {name: 'Save And Test'})
        ).toBeDisabled()
    })

    it('should disable save when name input is empty', () => {
        renderComponent()

        userEvent.clear(screen.getByLabelText(/Guidance name/))

        expect(
            screen.getByRole('button', {name: 'Save Changes'})
        ).toBeDisabled()
        expect(
            screen.getByRole('button', {name: 'Save And Test'})
        ).toBeDisabled()
    })

    it('should update guidance article', async () => {
        const updateGuidanceArticle = jest.fn()
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            updateGuidanceArticle,
        })

        renderComponent()

        const inputEl = screen.getByLabelText(/Guidance name/)
        userEvent.clear(inputEl)
        await userEvent.type(inputEl, 'New name')

        userEvent.click(screen.getByText('Save Changes'))

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            {
                title: 'New name',
                content: guidanceArticle.content,
                locale: guidanceArticle.locale,
            },
            {articleId: guidanceArticle.id, locale: guidanceArticle.locale}
        )
    })
})
