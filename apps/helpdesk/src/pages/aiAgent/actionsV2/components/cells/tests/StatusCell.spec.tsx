import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useListActionsApps } from 'models/workflows/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ServiceConnectionsResult } from '../../../hooks/useServiceConnections'
import StatusCell from '../StatusCell'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            appDetail: (appId: string) =>
                `/app/settings/integrations/app/${appId}/actions`,
        },
    }),
}))

jest.mock('models/workflows/queries', () => ({
    useListActionsApps: jest.fn(),
}))
const mockUseListActionsApps = jest.mocked(useListActionsApps)

const makeAction = (
    overrides?: Partial<StoreWorkflowsConfiguration>,
): StoreWorkflowsConfiguration =>
    ({
        id: 'action-1',
        apps: [],
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: { instructions: '', requires_confirmation: false },
                deactivated_datetime: null,
            },
        ],
        ...overrides,
    }) as unknown as StoreWorkflowsConfiguration

const connections = (
    overrides?: Partial<ServiceConnectionsResult>,
): ServiceConnectionsResult => ({
    byIntegration: {},
    isError: false,
    isLoading: false,
    ...overrides,
})

describe('StatusCell', () => {
    beforeEach(() => {
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
    })

    it('renders the Enabled tag when the entrypoint is active', () => {
        render(
            <StatusCell
                action={makeAction()}
                serviceConnections={connections()}
                shopName="test"
            />,
        )

        expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('renders the Disabled tag when the entrypoint is deactivated', () => {
        const action = makeAction({
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        instructions: '',
                        requires_confirmation: false,
                    },
                    deactivated_datetime: '2026-01-01T00:00:00.000Z',
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ] as any,
        })

        render(
            <StatusCell
                action={action}
                serviceConnections={connections()}
                shopName="test"
            />,
        )

        expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('renders a Failed tag linking to the app detail when a trackstar connection has failed', () => {
        mockUseListActionsApps.mockReturnValue({
            data: [
                {
                    id: 'shipbob',
                    auth_type: 'trackstar',
                    auth_settings: { integration_name: 'shipbob' },
                },
            ],
        } as unknown as ReturnType<typeof useListActionsApps>)

        const action = makeAction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apps: [{ type: 'app', app_id: 'shipbob' }] as any,
        })

        render(
            <StatusCell
                action={action}
                serviceConnections={connections({
                    byIntegration: {
                        shipbob: {
                            integrationName: 'shipbob',
                            isFailed: true,
                            connectionId: 'c1',
                        },
                    },
                })}
                shopName="test"
            />,
        )

        const failedLink = screen.getByRole('link', { name: /failed/i })
        expect(failedLink).toHaveAttribute(
            'href',
            '/app/settings/integrations/app/shipbob/actions',
        )
    })
})
