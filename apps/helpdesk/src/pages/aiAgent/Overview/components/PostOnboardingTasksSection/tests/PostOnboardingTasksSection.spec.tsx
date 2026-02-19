import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { mockPostStoreInstallationStep } from 'pages/aiAgent/fixtures/post-store-installation-steps.fixture'

import { PostOnboardingTasksSection } from '../PostOnboardingTasksSection'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        shopName: 'test-shop',
        shopType: 'shopify',
    }),
    useLocation: () => ({
        pathname: '/test-path',
        search: '',
        hash: '',
        state: null,
    }),
}))

jest.mock('../../../hooks/usePostOnboardingTasksSection', () => ({
    usePostOnboardingTasksSection: jest.fn(() => ({
        isLoading: false,
        isError: false,
        postOnboardingSteps: mockPostStoreInstallationStep,
        step: (stepName: StepName) => ({
            stepName,
            stepStartedDatetime: null,
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        }),
        isStepCompleted: (stepName: StepName) => stepName === StepName.TRAIN,
        completedStepsCount: 1,
        firstUncompletedStepName: StepName.TEST,
        updateStep: jest.fn(),
        createPostOnboardingStep: jest.fn(),
        updatePostStoreInstallation: jest.fn(),
        markPostStoreInstallationAsCompleted: jest.fn(),
    })),
}))

jest.mock('../../../hooks/usePostOnboardingKnowledgeEditor', () => ({
    usePostOnboardingKnowledgeEditor: jest.fn(() => ({
        openEditorForCreate: jest.fn(),
        openEditorForEdit: jest.fn(),
        closeEditor: jest.fn(),
        knowledgeEditorProps: {
            variant: 'guidance',
            shopName: 'test-shop',
            shopType: 'shopify',
            guidanceArticleId: undefined,
            guidanceTemplate: undefined,
            guidanceArticles: [],
            guidanceMode: 'create',
            isOpen: false,
            onClose: jest.fn(),
            onCreate: jest.fn(),
            onUpdate: jest.fn(),
            onDelete: jest.fn(),
        },
    })),
}))

jest.mock('../TrainSection', () => ({
    TrainSection: ({ stepMetadata }: { stepMetadata: any }) => (
        <div data-testid="train-section">{stepMetadata.stepTitle}</div>
    ),
}))

jest.mock('../TestSection', () => ({
    TestSection: ({ stepMetadata }: { stepMetadata: any }) => (
        <div data-testid="test-section">{stepMetadata.stepTitle}</div>
    ),
}))

jest.mock('../DeploySection', () => ({
    DeploySection: ({ stepMetadata }: { stepMetadata: any }) => (
        <div data-testid="deploy-section">{stepMetadata.stepTitle}</div>
    ),
}))

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: () => (
        <div data-testid="knowledge-editor">KnowledgeEditor</div>
    ),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(() => ({
        guidanceArticles: [],
        isGuidanceArticleListLoading: false,
        isFetched: true,
    })),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(() => ({
        storeConfiguration: {
            guidanceHelpCenterId: 123,
        },
    })),
}))

async function clickAccordionHeader(
    user: ReturnType<typeof userEvent.setup>,
    title: string,
) {
    const headers = screen.getAllByText(title)
    const headerElement = headers.find((el) => el.closest('.stepHeader'))

    await act(async () => {
        await user.click(headerElement || headers[0])
        // Allow time for accordion animation to complete
        jest.advanceTimersByTime(300)
    })
}

describe('PostOnboardingTasksSection', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders the component with header and progress', () => {
        render(<PostOnboardingTasksSection />)

        expect(
            screen.getByText('Get started with AI Agent'),
        ).toBeInTheDocument()
        expect(screen.getByText('1 / 3 steps')).toBeInTheDocument()
    })

    it('displays completion status indicators correctly', () => {
        render(<PostOnboardingTasksSection />)

        // Check for completed step icon
        expect(
            screen.getByRole('img', { name: 'circle-check' }),
        ).toBeInTheDocument()

        // Check for incomplete step icons
        const circleIcons = screen.getAllByRole('img', { name: 'shape-circle' })
        expect(circleIcons.length).toBe(2)
    })

    it('renders the correct section components when expanded', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })

        render(<PostOnboardingTasksSection />)

        // Train section
        await clickAccordionHeader(user, 'Train AI Agent')
        expect(screen.getByTestId('train-section')).toBeInTheDocument()

        // Test section
        await clickAccordionHeader(user, 'Test AI Agent')
        expect(screen.getByTestId('test-section')).toBeInTheDocument()

        // Deploy section
        await clickAccordionHeader(user, 'Deploy AI Agent')
        expect(screen.getByTestId('deploy-section')).toBeInTheDocument()
    })
})
