import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

import { TestSection } from '../TestSection'
import type { PostOnboardingStepMetadata } from '../types'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        PostOnboardingTaskActionDone: 'PostOnboardingTaskActionDone',
        PostOnboardingTaskCompleted: 'PostOnboardingTaskCompleted',
    },
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        shopName: 'test-shop',
        shopType: 'shopify',
    }),
}))

const mockOpenPlayground = jest.fn()
const mockClosePlayground = jest.fn()
const mockIsPlaygroundOpen = false

jest.mock('pages/aiAgent/hooks/usePlaygroundPanel', () => ({
    usePlaygroundPanel: jest.fn(() => ({
        isPlaygroundOpen: mockIsPlaygroundOpen,
        openPlayground: mockOpenPlayground,
        closePlayground: mockClosePlayground,
    })),
}))

const { usePlaygroundPanel } = require('pages/aiAgent/hooks/usePlaygroundPanel')
const mockUsePlaygroundPanel = jest.mocked(usePlaygroundPanel)

describe('TestSection', () => {
    const mockStepMetadata: PostOnboardingStepMetadata = {
        stepName: StepName.TEST,
        stepTitle: 'Test AI Agent',
        stepDescription: 'This is a test description for testing',
        stepImage: 'test-image-url',
    }

    const mockStep = {
        stepName: StepName.TEST,
        stepStartedDatetime: null,
        stepCompletedDatetime: null,
        stepDismissedDatetime: null,
    }

    const mockUpdateStep = jest.fn()
    const mockOnEditGuidanceArticle = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: false,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })
    })

    it('renders the component with correct description', () => {
        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(
            screen.getByText(mockStepMetadata.stepDescription),
        ).toBeInTheDocument()
    })

    it('renders the image with correct src and alt text', () => {
        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        const image = screen.getByAltText('AI Agent testing')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', mockStepMetadata.stepImage)
    })

    it('renders the Test button', () => {
        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        const testButton = screen.getByRole('button', { name: 'Test' })
        expect(testButton).toBeInTheDocument()
    })

    it('calls openPlayground and updates step with startedDatetime when opening playground for the first time', async () => {
        const user = userEvent.setup()

        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Test' }))

        expect(mockUpdateStep).toHaveBeenCalledWith({
            ...mockStep,
            stepStartedDatetime: expect.any(String),
        })
        expect(mockOpenPlayground).toHaveBeenCalled()
    })

    it('calls openPlayground but does not update startedDatetime if already set', async () => {
        const user = userEvent.setup()
        const stepWithStartDate = {
            ...mockStep,
            stepStartedDatetime: '2023-01-01T00:00:00Z',
        }

        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStartDate}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Test' }))

        expect(mockUpdateStep).not.toHaveBeenCalled()
        expect(mockOpenPlayground).toHaveBeenCalled()
    })

    it('hides Test button when playground is open', () => {
        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: true,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(
            screen.queryByRole('button', { name: 'Test' }),
        ).not.toBeInTheDocument()
    })

    it('passes onGuidanceClick callback to usePlaygroundPanel', () => {
        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(mockUsePlaygroundPanel).toHaveBeenCalledWith({
            onGuidanceClick: expect.any(Function),
        })

        const onGuidanceClick =
            mockUsePlaygroundPanel.mock.calls[0][0].onGuidanceClick
        onGuidanceClick(123)

        expect(mockOnEditGuidanceArticle).toHaveBeenCalledWith(123)
    })

    it('completes step when playground is closed after message was sent', () => {
        const stepWithStart = {
            ...mockStep,
            stepStartedDatetime: '2023-01-01T00:00:00Z',
        }

        const { rerender } = render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStart}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: false,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        act(() => {
            document.dispatchEvent(
                new CustomEvent('message-sent-ai-agent-playground'),
            )
        })

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: true,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStart}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: false,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStart}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(mockUpdateStep).toHaveBeenCalledWith({
            ...stepWithStart,
            stepCompletedDatetime: expect.any(String),
        })
    })

    it('does not complete step when playground is closed but no message was sent', () => {
        const stepWithStart = {
            ...mockStep,
            stepStartedDatetime: '2023-01-01T00:00:00Z',
        }

        const { rerender } = render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStart}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: true,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStart}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: false,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={stepWithStart}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(mockUpdateStep).not.toHaveBeenCalled()
    })

    it('does not complete step if step is already completed', () => {
        const completedStep = {
            ...mockStep,
            stepStartedDatetime: '2023-01-01T00:00:00Z',
            stepCompletedDatetime: '2023-01-01T00:05:00Z',
        }

        const { rerender } = render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={completedStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        act(() => {
            document.dispatchEvent(
                new CustomEvent('message-sent-ai-agent-playground'),
            )
        })

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: true,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={completedStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: false,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={completedStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(mockUpdateStep).not.toHaveBeenCalled()
    })

    it('does not complete step if step was not started', () => {
        const { rerender } = render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        act(() => {
            document.dispatchEvent(
                new CustomEvent('message-sent-ai-agent-playground'),
            )
        })

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: true,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        mockUsePlaygroundPanel.mockReturnValue({
            isPlaygroundOpen: false,
            openPlayground: mockOpenPlayground,
            closePlayground: mockClosePlayground,
            togglePlayground: jest.fn(),
        })

        rerender(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        expect(mockUpdateStep).not.toHaveBeenCalled()
    })
})
