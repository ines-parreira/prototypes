import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import type { ServiceConnectionStatuses } from '../../../hooks/useServiceConnectionStatuses'
import StatusCell from '../StatusCell'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            appDetail: (appId: string) =>
                `/app/settings/integrations/app/${appId}/actions`,
        },
    }),
}))

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

const statuses = (
    overrides?: Partial<ServiceConnectionStatuses>,
): ServiceConnectionStatuses => ({
    byAppId: {},
    isError: false,
    isLoading: false,
    ...overrides,
})

describe('StatusCell', () => {
    it('renders the Enabled tag when the entrypoint is active', () => {
        render(
            <StatusCell
                action={makeAction()}
                serviceConnectionStatuses={statuses()}
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
                serviceConnectionStatuses={statuses()}
                shopName="test"
            />,
        )

        expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('renders a Failed tag linking to the app detail when a service connection has failed', () => {
        const action = makeAction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apps: [{ type: 'app', app_id: 'shipbob' }] as any,
        })

        render(
            <StatusCell
                action={action}
                serviceConnectionStatuses={statuses({
                    byAppId: {
                        shipbob: { isBroken: true, brokenConnectionId: 'c1' },
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
