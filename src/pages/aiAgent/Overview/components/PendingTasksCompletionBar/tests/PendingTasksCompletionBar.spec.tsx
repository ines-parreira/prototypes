import React from 'react'

import { render, screen } from '@testing-library/react'

import { PendingTasksCompletionBar } from '../PendingTasksCompletionBar'

const getSkeleton = () => document.querySelector('.react-loading-skeleton')
const getProgress = () => screen.getByRole('progressbar')

describe('PendingTasksCompletionBar', () => {
    it('render component', () => {
        render(
            <PendingTasksCompletionBar
                totalTasks={10}
                totalTasksCompleted={5}
            />,
        )

        expect(screen.getByText('5 tasks remaining')).toBeInTheDocument()
        expect(getProgress()).toHaveAttribute('value', '5')
        expect(getProgress()).toHaveAttribute('max', '10')
    })

    it('have value = 1 and max = 1 when both total and completed are 0', () => {
        render(
            <PendingTasksCompletionBar
                totalTasks={0}
                totalTasksCompleted={0}
            />,
        )

        expect(screen.getByText('0 tasks remaining')).toBeInTheDocument()
        expect(getProgress()).toHaveAttribute('value', '1')
        expect(getProgress()).toHaveAttribute('max', '1')
    })

    it('render the loading state', () => {
        render(<PendingTasksCompletionBar isLoading={true} />)

        expect(getSkeleton()).toBeInTheDocument()
    })
})
