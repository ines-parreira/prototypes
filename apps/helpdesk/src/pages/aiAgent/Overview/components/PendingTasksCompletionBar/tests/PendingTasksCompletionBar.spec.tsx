import { render, screen } from '@testing-library/react'

import { PendingTasksCompletionBar } from '../PendingTasksCompletionBar'

const getSkeleton = () => document.querySelector('.react-loading-skeleton')

describe('PendingTasksCompletionBar', () => {
    it('render component', () => {
        render(
            <PendingTasksCompletionBar
                totalTasks={10}
                totalTasksCompleted={5}
            />,
        )

        expect(screen.getByText('5 tasks remaining')).toBeInTheDocument()
    })

    it('displays remaining tasks correctly when both total and completed are 0', () => {
        render(
            <PendingTasksCompletionBar
                totalTasks={0}
                totalTasksCompleted={0}
            />,
        )

        expect(screen.getByText('0 tasks remaining')).toBeInTheDocument()
    })

    it('render the loading state', () => {
        render(<PendingTasksCompletionBar isLoading={true} />)

        expect(getSkeleton()).toBeInTheDocument()
    })

    it('displays correct pluralization for single task', () => {
        render(
            <PendingTasksCompletionBar
                totalTasks={10}
                totalTasksCompleted={9}
            />,
        )

        expect(screen.getByText('1 task remaining')).toBeInTheDocument()
    })
})
