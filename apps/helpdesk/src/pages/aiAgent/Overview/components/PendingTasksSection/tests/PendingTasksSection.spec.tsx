import { act, fireEvent, screen } from '@testing-library/react'

import { AlwaysDisplayedTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/AlwaysDisplayed.task'
import { AlwaysHiddenTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/AlwaysHidden.task'
import { renderWithRouter } from 'utils/testing'

import { PendingTasksSection } from '../PendingTasksSection'

const pendingTasks = [
    new AlwaysDisplayedTask(),
    new AlwaysDisplayedTask(),
    new AlwaysDisplayedTask(),
    new AlwaysDisplayedTask(),
    new AlwaysDisplayedTask(),
    new AlwaysDisplayedTask(),
]
const completedTasks = [
    new AlwaysHiddenTask(),
    new AlwaysHiddenTask(),
    new AlwaysHiddenTask(),
    new AlwaysHiddenTask(),
]

describe('PendingTasksSection', () => {
    it('render the section in loading', () => {
        renderWithRouter(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={true}
                isFetched={false}
            />,
        )

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true',
        )
    })

    it('render the component after loading', () => {
        jest.useFakeTimers()
        renderWithRouter(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                isFetched={true}
            />,
        )

        expect(screen.getAllByRole('link')[0]).not.toHaveAttribute('aria-busy')
        expect(screen.getByText('Show all')).toBeInTheDocument()
    })

    it('render the component after loading when all tasks are completed', () => {
        jest.useFakeTimers()
        renderWithRouter(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={[]}
                isLoading={false}
                isFetched={true}
            />,
        )

        expect(
            screen.getByText(
                'Congrats! You’ve finished all tasks for this store.',
            ),
        ).toBeInTheDocument()
    })

    it('should expand when clicking on expand button', () => {
        const rendered = renderWithRouter(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                isFetched={true}
            />,
        )

        expect(screen.getByRole('region').childNodes).toHaveLength(3)
        act(() => {
            fireEvent.click(rendered.container.querySelector('button')!)
        })

        expect(rendered.container.querySelector('button')!).toHaveAttribute(
            'aria-expanded',
            'true',
        )
        expect(screen.getByRole('region').childNodes).toHaveLength(
            pendingTasks.length,
        )
        expect(screen.getByText('Show less')).toBeInTheDocument()
    })
})
