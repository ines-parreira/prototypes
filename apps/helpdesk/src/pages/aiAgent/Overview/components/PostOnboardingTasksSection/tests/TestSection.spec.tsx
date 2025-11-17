import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

import { TestSection } from '../TestSection'
import type { PostOnboardingStepMetadata } from '../types'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        shopName: 'test-shop',
    }),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(() => false),
}))

const mockAiAgentPlaygroundView = jest.fn()
const mockAiAgentPlayground = jest.fn()

jest.mock('pages/aiAgent/Playground/AiAgentPlaygroundView', () => ({
    AiAgentPlaygroundView: (props: any) => {
        mockAiAgentPlaygroundView(props)
        return <div>Playground</div>
    },
}))

jest.mock('pages/aiAgent/PlaygroundV2/AiAgentPlayground', () => ({
    AiAgentPlayground: (props: any) => {
        mockAiAgentPlayground(props)
        return <div>Playground V2</div>
    },
}))

const { useFlag } = require('core/flags')
const mockUseFlag = jest.mocked(useFlag)

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
        mockUseFlag.mockReturnValue(false)
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

    it('updates step with startedDatetime when opening playground for the first time', async () => {
        const user = userEvent.setup()

        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Test' }))
        })

        expect(mockUpdateStep).toHaveBeenCalledWith({
            ...mockStep,
            stepStartedDatetime: expect.any(String),
        })
    })

    it('does not update startedDatetime if already set', async () => {
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

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Test' }))
        })

        expect(mockUpdateStep).not.toHaveBeenCalled()
    })

    it('dispatches refresh event when refresh button is clicked', async () => {
        const user = userEvent.setup()
        const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent')

        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Test' }))
        })

        await act(async () => {
            const refreshButton = screen.getByLabelText('refresh playground')
            await user.click(refreshButton)
        })

        expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'refresh-ai-agent-playground',
            }),
        )
    })

    it('closes playground, dispatches refresh, and calls onEditGuidanceArticle when onGuidanceClick is invoked', async () => {
        const user = userEvent.setup()
        const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent')
        mockUseFlag.mockReturnValue(true)

        render(
            <TestSection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                onEditGuidanceArticle={mockOnEditGuidanceArticle}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Test' }))
        })

        const onGuidanceClick =
            mockAiAgentPlayground.mock.calls[0][0].onGuidanceClick

        await act(async () => {
            onGuidanceClick(123)
        })

        expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'refresh-ai-agent-playground',
            }),
        )
        expect(mockOnEditGuidanceArticle).toHaveBeenCalledWith(123)
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('renders Playground V2 when drawer is opened', async () => {
            const user = userEvent.setup()

            render(
                <TestSection
                    stepMetadata={mockStepMetadata}
                    step={mockStep}
                    updateStep={mockUpdateStep}
                    onEditGuidanceArticle={mockOnEditGuidanceArticle}
                />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Test' }))
            })

            expect(screen.getByText('Playground V2')).toBeInTheDocument()
        })

        it('resets playground when refresh button is clicked', async () => {
            const user = userEvent.setup()

            render(
                <TestSection
                    stepMetadata={mockStepMetadata}
                    step={mockStep}
                    updateStep={mockUpdateStep}
                    onEditGuidanceArticle={mockOnEditGuidanceArticle}
                />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Test' }))
            })

            expect(screen.getByText('Playground V2')).toBeInTheDocument()

            await act(async () => {
                const refreshButton =
                    screen.getByLabelText('refresh playground')
                await user.click(refreshButton)
            })

            expect(screen.getByText('Playground V2')).toBeInTheDocument()
        })

        it('does not display reset button in Playground V2', async () => {
            const user = userEvent.setup()

            render(
                <TestSection
                    stepMetadata={mockStepMetadata}
                    step={mockStep}
                    updateStep={mockUpdateStep}
                    onEditGuidanceArticle={mockOnEditGuidanceArticle}
                />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Test' }))
            })

            expect(screen.getByText('Playground V2')).toBeInTheDocument()
        })
    })

    describe('when feature flag is disabled', () => {
        it('renders original Playground when drawer is opened', async () => {
            const user = userEvent.setup()

            render(
                <TestSection
                    stepMetadata={mockStepMetadata}
                    step={mockStep}
                    updateStep={mockUpdateStep}
                    onEditGuidanceArticle={mockOnEditGuidanceArticle}
                />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Test' }))
            })

            expect(screen.getByText('Playground')).toBeInTheDocument()
            expect(screen.queryByText('Playground V2')).not.toBeInTheDocument()
        })
    })
})
