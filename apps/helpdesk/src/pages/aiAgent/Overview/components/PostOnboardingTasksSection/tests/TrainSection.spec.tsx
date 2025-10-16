import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { GuidanceArticle } from 'pages/aiAgent/types'

import { TrainSection } from '../TrainSection'
import { PostOnboardingStepMetadata } from '../types'
import { MAX_VISIBLE_GUIDANCES_TRAIN_SECTION } from '../utils'

jest.mock('pages/aiAgent/hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: () => ({
        guidanceArticles: mockGuidanceArticles,
        isGuidanceArticleListLoading: false,
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        deleteGuidanceArticle: jest.fn().mockResolvedValue(undefined),
        isGuidanceArticleDeleting: false,
    }),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: () => ({
        storeConfiguration: {
            guidanceHelpCenterId: 123,
        },
    }),
}))

jest.mock('lodash/noop', () => jest.fn())

const mockGuidanceArticles: GuidanceArticle[] = [
    {
        id: 1,
        title: 'Guidance Article 1',
        content: 'Content 1',
        visibility: 'PUBLIC' as const,
        locale: 'en-US',
        lastUpdated: '2023-01-01T00:00:00Z',
        templateKey: '',
    },
    {
        id: 2,
        title: 'Guidance Article 2',
        content: 'Content 2',
        visibility: 'PUBLIC' as const,
        locale: 'en-US',
        lastUpdated: '2023-01-02T00:00:00Z',
        templateKey: '',
    },
]

describe('TrainSection', () => {
    const mockStepMetadata: PostOnboardingStepMetadata = {
        stepName: StepName.TRAIN,
        stepTitle: 'Train AI Agent',
        stepDescription: 'This is a test description for training',
        stepImage: 'test-image-url',
    }

    const mockStep = {
        stepName: StepName.TRAIN,
        stepStartedDatetime: '2023-01-01T00:00:00Z',
        stepCompletedDatetime: null,
        stepDismissedDatetime: null,
    }

    const mockUpdateStep = jest.fn()

    const renderTrainSection = () => {
        return render(
            <MemoryRouter initialEntries={['/test-shop/ai-agent']}>
                <Switch>
                    <Route path="/:shopName/ai-agent">
                        <TrainSection
                            stepMetadata={mockStepMetadata}
                            step={mockStep}
                            updateStep={mockUpdateStep}
                        />
                    </Route>
                </Switch>
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with correct description', () => {
        renderTrainSection()

        expect(
            screen.getByText(mockStepMetadata.stepDescription),
        ).toBeInTheDocument()

        expect(screen.getByText('Add Guidance')).toBeInTheDocument()

        expect(screen.getByText('Guidance Article 1')).toBeInTheDocument()
        expect(screen.getByText('Guidance Article 2')).toBeInTheDocument()
    })

    it('opens the DeleteModal when delete icon is clicked', async () => {
        const user = userEvent.setup()
        renderTrainSection()

        expect(screen.queryByText('Delete guidance?')).not.toBeInTheDocument()

        const trashIcons = screen.getAllByRole('img', { name: 'trash-empty' })

        const trashButton = trashIcons[0].closest('.actionButton')
        if (trashButton) {
            await act(async () => {
                await user.click(trashButton)
            })
        }

        expect(screen.getByText('Delete guidance?')).toBeInTheDocument()
    })

    it('calls updateStep when there are enough guidance articles', () => {
        jest.spyOn(
            require('pages/aiAgent/hooks/useGuidanceArticles'),
            'useGuidanceArticles',
        ).mockReturnValue({
            guidanceArticles: Array.from(
                { length: MAX_VISIBLE_GUIDANCES_TRAIN_SECTION },
                (_, i) => ({
                    id: i + 1,
                    title: `Guidance Article ${i + 1}`,
                    content: `Content ${i + 1}`,
                    visibility: 'PUBLIC' as const,
                    locale: 'en-US',
                    lastUpdated: `2023-01-0${i + 1}T00:00:00Z`,
                    templateKey: '',
                }),
            ),
            isGuidanceArticleListLoading: false,
        })

        renderTrainSection()

        expect(mockUpdateStep).toHaveBeenCalledWith({
            ...mockStep,
            stepCompletedDatetime: expect.any(String),
        })
    })
})
