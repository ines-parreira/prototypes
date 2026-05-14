import { fireEvent } from '@testing-library/react'

import { render } from '@repo/testing'

import type { AppOption } from '../../types'
import { AddStepDropdown } from './AddStepDropdown'

const shopify: AppOption = {
    id: 'shopify',
    name: 'Shopify',
    icon: { iconUrl: '/img/shopify.svg', alt: 'Shopify' },
    actions: [
        { id: 'cancel', name: 'Cancel order' },
        { id: 'refund', name: 'Issue refund' },
    ],
}

const yotpo: AppOption = {
    id: 'yotpo',
    name: 'Yotpo',
    icon: { iconUrl: '/img/yotpo.svg', alt: 'Yotpo' },
    actions: [{ id: 'reward', name: 'Add reward points' }],
}

const klaviyo: AppOption = {
    id: 'klaviyo',
    name: 'Klaviyo',
    icon: { iconUrl: '/img/klaviyo.svg', alt: 'Klaviyo' },
    actions: [{ id: 'subscribe', name: 'Subscribe customer' }],
}

const orphanApp: AppOption = {
    id: 'orphan',
    name: 'Orphan',
    icon: { iconUrl: '/img/orphan.svg', alt: 'Orphan' },
}

describe('AddStepDropdown', () => {
    it('opens the menu and selects an action through the two-level navigation', () => {
        const onSelectAction = jest.fn()
        const { getByText } = render(
            <AddStepDropdown
                connectedApps={[shopify]}
                onSelectAction={onSelectAction}
            />,
        )
        fireEvent.click(getByText('Add step'))
        fireEvent.click(getByText('Shopify'))
        fireEvent.click(getByText('Issue refund'))
        expect(onSelectAction).toHaveBeenCalledWith('shopify', 'refund')
    })

    it('renders the build advanced action link', () => {
        const onBuildAdvanced = jest.fn()
        const { getByText } = render(
            <AddStepDropdown
                connectedApps={[shopify]}
                onSelectAction={() => {}}
                onBuildAdvanced={onBuildAdvanced}
            />,
        )
        fireEvent.click(getByText('Add step'))
        fireEvent.click(getByText('Build advanced action'))
        expect(onBuildAdvanced).toHaveBeenCalledTimes(1)
    })

    it('groups apps into Connected, Relevant for you, and Other apps sections', () => {
        const { getByText } = render(
            <AddStepDropdown
                connectedApps={[shopify]}
                suggestedApps={[yotpo]}
                otherApps={[klaviyo]}
                onSelectAction={() => {}}
            />,
        )
        fireEvent.click(getByText('Add step'))
        expect(getByText('Connected')).toBeInTheDocument()
        expect(getByText('Relevant for you')).toBeInTheDocument()
        expect(getByText('Other apps')).toBeInTheDocument()
        expect(getByText('Shopify')).toBeInTheDocument()
        expect(getByText('Yotpo')).toBeInTheDocument()
        expect(getByText('Klaviyo')).toBeInTheDocument()
    })

    it('skips empty sections', () => {
        const { queryByText, getByText } = render(
            <AddStepDropdown
                suggestedApps={[yotpo]}
                onSelectAction={() => {}}
            />,
        )
        fireEvent.click(getByText('Add step'))
        expect(getByText('Relevant for you')).toBeInTheDocument()
        expect(queryByText('Connected')).not.toBeInTheDocument()
        expect(queryByText('Other apps')).not.toBeInTheDocument()
    })

    it('returns to the app list when the back row is clicked', () => {
        const { getByText, queryByText } = render(
            <AddStepDropdown
                connectedApps={[shopify]}
                onSelectAction={() => {}}
            />,
        )
        fireEvent.click(getByText('Add step'))
        fireEvent.click(getByText('Shopify'))
        expect(getByText('Issue refund')).toBeInTheDocument()
        // Within the action list, the back row contains the active app name —
        // grabbing it via getByText would also match the app's row, so we click
        // the dedicated back menuitem rendered above the action list.
        fireEvent.click(getByText('Shopify'))
        expect(queryByText('Issue refund')).not.toBeInTheDocument()
        expect(getByText('Connected')).toBeInTheDocument()
    })

    it('does not drill into apps that have no actions', () => {
        const { getByText, queryByText } = render(
            <AddStepDropdown
                connectedApps={[orphanApp]}
                onSelectAction={() => {}}
            />,
        )
        fireEvent.click(getByText('Add step'))
        fireEvent.click(getByText('Orphan'))
        // Still on the app list — the section header remains visible.
        expect(getByText('Connected')).toBeInTheDocument()
        expect(queryByText(/back/i)).not.toBeInTheDocument()
    })

    it('honors a custom trigger label', () => {
        const { getByRole } = render(
            <AddStepDropdown
                triggerLabel="Add another"
                connectedApps={[shopify]}
                onSelectAction={() => {}}
            />,
        )
        expect(
            getByRole('button', { name: /add another/i }),
        ).toBeInTheDocument()
    })

    it('closes the popover and resets the active app after selecting an action', () => {
        const { getByText, queryByText } = render(
            <AddStepDropdown
                connectedApps={[shopify]}
                onSelectAction={() => {}}
            />,
        )
        fireEvent.click(getByText('Add step'))
        fireEvent.click(getByText('Shopify'))
        fireEvent.click(getByText('Issue refund'))
        expect(queryByText('Connected')).not.toBeInTheDocument()
        // Reopening should land back on the app list, not the previously
        // active action list.
        fireEvent.click(getByText('Add step'))
        expect(getByText('Connected')).toBeInTheDocument()
        expect(queryByText('Issue refund')).not.toBeInTheDocument()
    })
})
