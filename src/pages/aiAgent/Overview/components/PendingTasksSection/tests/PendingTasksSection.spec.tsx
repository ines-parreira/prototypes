import {render, screen} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import React from 'react'

import {PendingTasksSection} from '../PendingTasksSection'

describe('PendingTasksSection', () => {
    it('render the section in loading', () => {
        render(<PendingTasksSection />)

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true'
        )
    })

    it('render the loading state', () => {
        jest.useFakeTimers()
        render(<PendingTasksSection />)

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true'
        )

        act(() => {
            jest.runAllTimers()
        })

        expect(screen.getAllByRole('link')[0]).not.toHaveAttribute('aria-busy')
    })
})
