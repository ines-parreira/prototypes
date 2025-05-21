import { act, fireEvent, render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'
import { AlwaysDisplayedTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/AlwaysDisplayed.task'
import { AlwaysHiddenTask } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/AlwaysHidden.task'

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
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={true}
                isFetched={false}
                onStoreChange={() => {}}
                selectedStore={{
                    id: 1,
                    name: 'test store',
                    type: IntegrationType.Shopify,
                }}
                stores={[
                    {
                        id: 1,
                        name: 'test store',
                        type: IntegrationType.Shopify,
                    },
                ]}
            />,
        )

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true',
        )
    })

    it('render the component after loading', () => {
        jest.useFakeTimers()
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                isFetched={true}
                onStoreChange={() => {}}
                selectedStore={{
                    id: 1,
                    name: 'test store',
                    type: IntegrationType.Shopify,
                }}
                stores={[
                    {
                        id: 1,
                        name: 'test store',
                        type: IntegrationType.Shopify,
                    },
                ]}
            />,
        )

        expect(screen.getAllByRole('link')[0]).not.toHaveAttribute('aria-busy')
        expect(screen.getByText('Show all')).toBeInTheDocument()
    })

    it('render the store selector when multiple stores', () => {
        jest.useFakeTimers()
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                isFetched={true}
                onStoreChange={() => {}}
                selectedStore={{
                    id: 1,
                    name: 'test store',
                    type: IntegrationType.Shopify,
                }}
                stores={[
                    {
                        id: 1,
                        name: 'test store',
                        type: IntegrationType.Shopify,
                    },
                    {
                        id: 2,
                        name: 'other test store',
                        type: IntegrationType.Shopify,
                    },
                ]}
            />,
        )

        expect(screen.getAllByText('test store')).not.toHaveLength(0)
    })

    it('not render the store selector when single store', () => {
        jest.useFakeTimers()
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                isFetched={true}
                onStoreChange={() => {}}
                selectedStore={{
                    id: 1,
                    name: 'test store',
                    type: IntegrationType.Shopify,
                }}
                stores={[
                    {
                        id: 1,
                        name: 'test store',
                        type: IntegrationType.Shopify,
                    },
                ]}
            />,
        )

        expect(screen.queryAllByText('test store')).toHaveLength(0)
    })

    it('render the component after loading when all tasks are completed', () => {
        jest.useFakeTimers()
        render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={[]}
                isLoading={false}
                isFetched={true}
                onStoreChange={() => {}}
                selectedStore={{
                    id: 1,
                    name: 'test store',
                    type: IntegrationType.Shopify,
                }}
                stores={[
                    {
                        id: 1,
                        name: 'test store',
                        type: IntegrationType.Shopify,
                    },
                ]}
            />,
        )

        expect(
            screen.getByText(
                'Congrats! You’ve finished all tasks for this store.',
            ),
        ).toBeInTheDocument()
    })

    it('should expand when clicking on expand button', () => {
        const rendered = render(
            <PendingTasksSection
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                isLoading={false}
                isFetched={true}
                onStoreChange={() => {}}
                selectedStore={{
                    id: 1,
                    name: 'test store',
                    type: IntegrationType.Shopify,
                }}
                stores={[
                    {
                        id: 1,
                        name: 'test store',
                        type: IntegrationType.Shopify,
                    },
                ]}
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
