import { renderHook } from '@repo/testing'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { compareActionStatus, useActionStatuses } from '../useActionStatus'
import type { ServiceConnectionStatuses } from '../useServiceConnectionStatuses'

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

const statuses = (
    overrides?: Partial<ServiceConnectionStatuses>,
): ServiceConnectionStatuses => ({
    byAppId: {},
    isError: false,
    isLoading: false,
    ...overrides,
})

describe('useActionStatuses()', () => {
    it('returns "enabled" for an action with no deactivated entrypoint', () => {
        const { result } = renderHook(() =>
            useActionStatuses([makeAction({ id: 'a' })], statuses()),
        )

        expect(result.current.get('a')).toBe('enabled')
    })

    it('returns "disabled" when the entrypoint has a deactivated_datetime', () => {
        const { result } = renderHook(() =>
            useActionStatuses(
                [makeAction({ id: 'a', deactivated: true })],
                statuses(),
            ),
        )

        expect(result.current.get('a')).toBe('disabled')
    })

    it('returns "failed" when a referenced app has a broken service connection', () => {
        const { result } = renderHook(() =>
            useActionStatuses(
                [makeAction({ id: 'a', appId: 'shipbob' })],
                statuses({
                    byAppId: {
                        shipbob: { isBroken: true, brokenConnectionId: 'c1' },
                    },
                }),
            ),
        )

        expect(result.current.get('a')).toBe('failed')
    })

    it('ignores connection failures when statuses has an error', () => {
        const { result } = renderHook(() =>
            useActionStatuses(
                [makeAction({ id: 'a', appId: 'shipbob' })],
                statuses({
                    isError: true,
                    byAppId: {
                        shipbob: { isBroken: true, brokenConnectionId: 'c1' },
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
