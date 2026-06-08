import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { render, userEvent } from '@repo/testing/vitest'

import { OnboardingChecklistCard } from './OnboardingChecklistCard'
import type { ChecklistTask } from './OnboardingChecklistCard.types'

const tasks: ChecklistTask[] = [
    { content: 'Step 1', status: 'completed' },
    { content: 'Step 2', status: 'pending' },
    { content: 'Step 3', status: 'pending' },
    { content: 'Step 4', status: 'pending' },
]

describe('OnboardingChecklistCard', () => {
    it('renders the title, progress count, ring, and every step', () => {
        render(<OnboardingChecklistCard tasks={tasks} title="Get started" />)

        expect(screen.getByText('Get started')).toBeInTheDocument()
        expect(screen.getByText('1 of 4')).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /1 of 4 steps completed/i }),
        ).toBeInTheDocument()

        expect(screen.getByText('Step 1')).toBeInTheDocument()
        expect(screen.getByText('Step 4')).toBeInTheDocument()
    })

    it('marks completed and pending steps with the right status icons', () => {
        render(<OnboardingChecklistCard tasks={tasks} />)

        expect(
            screen.getAllByRole('img', { name: /^completed$/i }),
        ).toHaveLength(1)
        expect(
            screen.getAllByRole('img', { name: /not completed/i }),
        ).toHaveLength(3)
    })

    it('collapses into a pill and expands again', async () => {
        const user = userEvent.setup()
        render(<OnboardingChecklistCard tasks={tasks} />)

        expect(screen.getByText('Step 2')).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /collapse checklist/i }),
        )
        // Steps are hidden in the collapsed pill, but the progress stays.
        expect(screen.queryByText('Step 2')).not.toBeInTheDocument()
        expect(screen.getByText('Get started')).toBeInTheDocument()
        expect(screen.getByText('1 of 4')).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /expand checklist/i }),
        )
        expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('shows a completion check in the ring when every step is done', () => {
        const allDone = tasks.map((task) => ({
            ...task,
            status: 'completed' as const,
        }))
        render(<OnboardingChecklistCard tasks={allDone} />)

        expect(
            screen.getByRole('img', { name: /4 of 4 steps completed/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('4 of 4')).toBeInTheDocument()
    })

    it('renders nothing when there are no steps', () => {
        const { container } = render(<OnboardingChecklistCard tasks={[]} />)
        expect(container).toBeEmptyDOMElement()
    })
})
