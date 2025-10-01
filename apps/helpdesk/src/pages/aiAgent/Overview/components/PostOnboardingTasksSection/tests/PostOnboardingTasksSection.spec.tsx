import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PostOnboardingTasksSection } from '../PostOnboardingTasksSection'
import { POST_ONBOARDING_TASKS } from '../utils'

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

jest.mock('../TrainSection', () => ({
    TrainSection: ({ task }: any) => (
        <div data-testid="train-section">{task.stepTitle}</div>
    ),
}))

jest.mock('../TestSection', () => ({
    TestSection: ({ task }: any) => (
        <div data-testid="test-section">{task.stepTitle}</div>
    ),
}))

jest.mock('../DeploySection', () => ({
    DeploySection: ({ task }: any) => (
        <div data-testid="deploy-section">{task.stepTitle}</div>
    ),
}))

describe('PostOnboardingTasksSection', () => {
    it('renders the correct section component based on task type', async () => {
        jest.useFakeTimers()
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

        jest.useRealTimers()
    })

    it('renders all task items from POST_ONBOARDING_TASKS', () => {
        render(<PostOnboardingTasksSection />)

        Object.values(POST_ONBOARDING_TASKS).forEach((task) => {
            const titleElements = screen.getAllByText(task.stepTitle)
            expect(
                titleElements.some((el) => el.closest('.stepHeader')),
            ).toBeTruthy()
        })
    })
})
