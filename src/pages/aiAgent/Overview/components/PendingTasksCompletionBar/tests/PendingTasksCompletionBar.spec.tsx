import React from 'react'

import { render, screen } from '@testing-library/react'

import { PendingTasksCompletionBar } from '../PendingTasksCompletionBar'

describe('PendingTasksCompletionBar', () => {
    it('render component', () => {
        render(
            <PendingTasksCompletionBar
                totalTasks={10}
                totalTasksCompleted={5}
            />,
        )

        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-value',
            '5',
        )
        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuemax',
            '10',
        )
    })
    it('render the loading state', () => {
        render(<PendingTasksCompletionBar isLoading={true} />)

        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-busy',
            'true',
        )
    })
})
