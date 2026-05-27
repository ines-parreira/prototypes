import { renderHook } from '@repo/testing'

import { useListActionsApps } from 'models/workflows/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { compareActionStatus, useActionStatuses } from '../useActionStatus'
import type { ServiceConnectionsResult } from '../useServiceConnections'

jest.mock('models/workflows/queries', () => ({
    useListActionsApps: jest.fn(),
}))
const mockUseListActionsApps = jest.mocked(useListActionsApps)

type ActionInput = {
    id: string
    deactivated?: boolean
    appId?: string
}

const makeAction = ({
    id,
    deactivated,
    appId,
}: ActionInput): StoreWorkflowsConfiguration =>
    ({
        id,
        apps: appId ? [{ type: 'app', app_id: appId }] : [],
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: { instructions: '', requires_confirmation: false },
                deactivated_datetime: deactivated
                    ? '2026-01-01T00:00:00.000Z'
                    : null,
            },
        ],
    }) as unknown as StoreWorkflowsConfiguration

const trackstarApp = (id: string, integrationName: string) =>
    ({
        id,
        auth_type: 'trackstar',
        auth_settings: { integration_name: integrationName },
    }) as unknown as ReturnType<typeof useListActionsApps>['data'] extends
        | (infer T)[]
        | undefined
        ? T
        : never

const serviceConnections = (
    overrides?: Partial<ServiceConnectionsResult>,
): ServiceConnectionsResult => ({
    byIntegration: {},
    isError: false,
    isLoading: false,
    ...overrides,
})

describe('useActionStatuses()', () => {
    beforeEach(() => {
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
    })

    it('returns "enabled" for an action with no deactivated entrypoint', () => {
        const { result } = renderHook(() =>
            useActionStatuses([makeAction({ id: 'a' })], serviceConnections()),
        )

        expect(result.current.get('a')).toBe('enabled')
    })

    it('returns "disabled" when the entrypoint has a deactivated_datetime', () => {
        const { result } = renderHook(() =>
            useActionStatuses(
                [makeAction({ id: 'a', deactivated: true })],
                serviceConnections(),
            ),
        )

        expect(result.current.get('a')).toBe('disabled')
    })

    it('returns "failed" when a referenced trackstar app has a failed service connection', () => {
        mockUseListActionsApps.mockReturnValue({
            data: [trackstarApp('shipbob', 'shipbob')],
        } as unknown as ReturnType<typeof useListActionsApps>)

        const { result } = renderHook(() =>
            useActionStatuses(
                [makeAction({ id: 'a', appId: 'shipbob' })],
                serviceConnections({
                    byIntegration: {
                        shipbob: {
                            integrationName: 'shipbob',
                            isFailed: true,
                            connectionId: 'c1',
                        },
                    },
                }),
            ),
        )

        expect(result.current.get('a')).toBe('failed')
    })

    it('ignores connection failures when serviceConnections has an error', () => {
        mockUseListActionsApps.mockReturnValue({
            data: [trackstarApp('shipbob', 'shipbob')],
        } as unknown as ReturnType<typeof useListActionsApps>)

        const { result } = renderHook(() =>
            useActionStatuses(
                [makeAction({ id: 'a', appId: 'shipbob' })],
                serviceConnections({
                    isError: true,
                    byIntegration: {
                        shipbob: {
                            integrationName: 'shipbob',
                            isFailed: true,
                            connectionId: 'c1',
                        },
                    },
                }),
            ),
        )

        expect(result.current.get('a')).toBe('enabled')
    })
})

describe('compareActionStatus()', () => {
    it('orders failed before disabled before enabled', () => {
        expect(compareActionStatus('failed', 'disabled')).toBeLessThan(0)
        expect(compareActionStatus('disabled', 'enabled')).toBeLessThan(0)
        expect(compareActionStatus('failed', 'enabled')).toBeLessThan(0)
    })

    it('returns 0 for equal statuses', () => {
        expect(compareActionStatus('enabled', 'enabled')).toBe(0)
    })
})
