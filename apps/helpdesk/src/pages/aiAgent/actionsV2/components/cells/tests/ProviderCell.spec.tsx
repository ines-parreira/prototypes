import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'
import { useGetAppFromTemplateApp } from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'

import { ProviderCell } from '../ProviderCell'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurationTemplates: jest.fn(),
    useListActionsApps: jest.fn(),
}))
jest.mock('pages/automate/actionsPlatform/hooks/useApps', () => ({
    __esModule: true,
    useApps: jest.fn(),
}))
jest.mock(
    'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp',
    () => ({ __esModule: true, useGetAppFromTemplateApp: jest.fn() }),
)
jest.mock('pages/automate/actionsPlatform/components/AppIcon', () => ({
    __esModule: true,
    AppIcon: ({ name, icon }: { name?: string; icon?: string }) => (
        <span
            aria-label={`app-icon ${name ?? ''}`}
            data-icon={icon}
            role="img"
        />
    ),
}))

const mockUseTemplates = jest.mocked(useGetWorkflowConfigurationTemplates)
const mockUseApps = jest.mocked(useApps)
const mockUseGetAppFromTemplateApp = jest.mocked(useGetAppFromTemplateApp)
const mockUseListActionsApps = jest.mocked(useListActionsApps)

const baseAction = {
    id: 'a',
    name: 'Cancel order',
    steps: [],
} as unknown as StoreWorkflowsConfiguration

describe('ProviderCell', () => {
    beforeEach(() => {
        mockUseTemplates.mockReturnValue({
            data: [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        mockUseApps.mockReturnValue({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apps: [] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        mockUseGetAppFromTemplateApp.mockReturnValue(() => undefined)
        mockUseListActionsApps.mockReturnValue({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: [],
        } as any)
    })

    it('renders an Avatar fallback with the action initials when there are no template steps', () => {
        render(<ProviderCell action={baseAction} />)

        // Axiom Avatar derives initials from the name prop ("Cancel order" → "CO")
        expect(screen.getByText('CO')).toBeInTheDocument()
    })

    it('renders the webhook icon when the action has an http-request step', () => {
        const action = {
            ...baseAction,
            steps: [{ kind: 'http-request' }],
        } as unknown as StoreWorkflowsConfiguration

        render(<ProviderCell action={action} />)

        expect(
            screen.getByRole('img', { name: /custom action/i }),
        ).toBeInTheDocument()
    })

    it('renders an AppIcon when a single matching template app is found', () => {
        mockUseTemplates.mockReturnValue({
            data: [
                {
                    id: 'tpl-1',
                    apps: [{ type: 'app', app_id: 'shopify' }],
                },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        mockUseGetAppFromTemplateApp.mockReturnValue(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            () =>
                ({
                    name: 'Shopify',
                    icon: 'shopify-icon',
                }) as any,
        )

        const action = {
            ...baseAction,
            steps: [
                {
                    kind: 'reusable-llm-prompt-call',
                    settings: { configuration_id: 'tpl-1' },
                },
            ],
        } as unknown as StoreWorkflowsConfiguration

        render(<ProviderCell action={action} />)

        expect(
            screen.getByRole('img', { name: /app-icon shopify/i }),
        ).toBeInTheDocument()
    })
})
