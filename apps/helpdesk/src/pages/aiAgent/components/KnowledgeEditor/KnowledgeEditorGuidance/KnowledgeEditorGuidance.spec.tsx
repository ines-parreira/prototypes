import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidance } from './KnowledgeEditorGuidance'

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({
        id: 1,
        name: 'FAQ Help Center',
        default_locale: 'en-US',
    })),
}))

const guidanceArticle = getGuidanceArticleFixture(1)

jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(() => ({
        guidanceArticle,
        isGuidanceArticleLoading: false,
    })),
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

const updateGuidanceArticle = jest.fn()

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        updateGuidanceArticle,
        deleteGuidanceArticle: jest.fn(),
        duplicateGuidanceArticle: jest.fn(),
        isGuidanceArticleUpdating: false,
    })),
}))

describe('KnowledgeEditorGuidance', () => {
    it('renders', () => {
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidance
                    shopName="Test Shop"
                    shopType="Test Shop Type"
                    guidanceArticleId={1}
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    guidanceMode="edit"
                />
            </Provider>,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        act(() => {
            fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
            fireEvent.click(screen.getByRole('button', { name: 'Save' }))
        })

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            mapGuidanceFormFieldsToGuidanceArticle(
                {
                    name: 'Updated Name',
                    content: guidanceArticle.content,
                    isVisible: true,
                },
                guidanceArticle.locale,
            ),
            { articleId: guidanceArticle.id, locale: guidanceArticle.locale },
        )
    })
})
