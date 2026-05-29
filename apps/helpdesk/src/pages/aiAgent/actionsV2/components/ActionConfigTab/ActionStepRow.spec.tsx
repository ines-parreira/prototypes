import { render } from '@repo/testing'

import { screen } from '@testing-library/react'

import type { App } from 'pages/automate/actionsPlatform/types'

import { ActionStepRow } from './ActionStepRow'

const buildApp = (overrides: Partial<App> = {}): App =>
    ({
        id: 'app-1',
        name: 'Shopify',
        icon: 'https://example.com/shopify.png',
        ...overrides,
    }) as App

describe('<ActionStepRow />', () => {
    const renderRow = (
        overrides: Partial<Parameters<typeof ActionStepRow>[0]> = {},
    ) => {
        const onDelete = jest.fn()
        const onClick = jest.fn()
        const onMove = jest.fn()
        const onDrop = jest.fn()
        const onCancel = jest.fn()

        const props = {
            index: 0,
            app: buildApp(),
            stepName: 'Inventory stock',
            onDelete,
            onClick,
            onMove,
            onDrop,
            onCancel,
            ...overrides,
        }

        return {
            ...render(<ActionStepRow {...props} />),
            onDelete,
            onClick,
        }
    }

    it('renders the underlying step card with app name and step name', () => {
        renderRow()

        expect(screen.getByText('Shopify')).toBeInTheDocument()
        expect(screen.getByText('Inventory stock')).toBeInTheDocument()
    })

    it('forwards the step-scoped drag handle and delete labels to the step card', () => {
        renderRow()

        expect(
            screen.getByRole('button', {
                name: 'Reorder Shopify Inventory stock step',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: 'Delete Shopify Inventory stock step',
            }),
        ).toBeInTheDocument()
    })

    it('invokes onDelete when the delete button is clicked', async () => {
        const { user, onDelete } = renderRow()

        await user.click(
            screen.getByRole('button', {
                name: 'Delete Shopify Inventory stock step',
            }),
        )

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('invokes onClick when the row is activated', async () => {
        const { user, onClick } = renderRow()

        await user.click(
            screen.getByRole('button', {
                name: 'Shopify — Inventory stock',
            }),
        )

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
