import {fireEvent, render, screen} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import React from 'react'

import {AlwaysDisplayedTask} from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/AlwaysDisplayed.task'
import {AlwaysHiddenTask} from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/AlwaysHidden.task'

import {PendingTasksSection} from '../PendingTasksSection'

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
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={true}
                onStoreChange={() => {}}
                selectedStore={{id: 1, name: 'test store'}}
                stores={[{id: 1, name: 'test store'}]}
            />
        )

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true'
        )
    })

    it('render the component after loading', () => {
        jest.useFakeTimers()
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                onStoreChange={() => {}}
                selectedStore={{id: 1, name: 'test store'}}
                stores={[{id: 1, name: 'test store'}]}
            />
        )

        expect(screen.getAllByRole('link')[0]).not.toHaveAttribute('aria-busy')
    })

    it('should expand when clicking on expand button', () => {
        const rendered = render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                onStoreChange={() => {}}
                selectedStore={{id: 1, name: 'test store'}}
                stores={[{id: 1, name: 'test store'}]}
            />
        )

        expect(screen.getByRole('region').childNodes).toHaveLength(3)
        act(() => {
            fireEvent.click(rendered.container.querySelector('button')!)
        })

        expect(rendered.container.querySelector('button')!).toHaveAttribute(
            'aria-expanded',
            'true'
        )
        expect(screen.getByRole('region').childNodes).toHaveLength(
            pendingTasks.length
        )
    })
})
