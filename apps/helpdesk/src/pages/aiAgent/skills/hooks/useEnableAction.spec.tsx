import { renderHook } from '@repo/testing'

import { useUpsertStoreWorkflowsConfiguration } from 'models/workflows/queries'
import type { Paths } from 'rest_api/workflows_api/client.generated'

import { useEnableAction } from './useEnableAction'

jest.mock('models/workflows/queries', () => ({
    useUpsertStoreWorkflowsConfiguration: jest.fn(),
}))

const mockUseUpsertStoreWorkflowsConfiguration =
    useUpsertStoreWorkflowsConfiguration as jest.MockedFunction<
        typeof useUpsertStoreWorkflowsConfiguration
    >

type StoreConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]

const buildConfiguration = (
    overrides: Partial<StoreConfiguration> = {},
): StoreConfiguration =>
    ({
        internal_id: 'wf-internal-1',
        id: 'wf-logical-1',
        account_id: 1,
        name: 'Refund',
        is_draft: false,
        initial_step_id: null,
        entrypoint: null,
        steps: [],
        transitions: [],
        available_languages: ['en-US'],
        created_datetime: '2026-01-01T00:00:00.000Z',
        updated_datetime: '2026-01-01T00:00:00.000Z',
        deleted_datetime: null,
        triggers: [],
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: { requires_confirmation: false, instructions: '' },
                deactivated_datetime: '2026-04-01T00:00:00.000Z',
            },
        ],
        ...overrides,
    }) as unknown as StoreConfiguration

describe('useEnableAction', () => {
    let mutateAsync: jest.Mock

    beforeEach(() => {
        mutateAsync = jest.fn().mockResolvedValue(undefined)
        mockUseUpsertStoreWorkflowsConfiguration.mockReturnValue({
            mutateAsync,
        } as unknown as ReturnType<typeof useUpsertStoreWorkflowsConfiguration>)
    })

    it('targets the action by internal_id (not the logical id)', async () => {
        const { result } = renderHook(() => useEnableAction())

        await result.current({
            storeName: 'ekster',
            storeType: 'shopify',
            configuration: buildConfiguration({
                internal_id: 'wf-internal-42',
                id: 'wf-logical-99',
            }),
        })

        expect(mutateAsync).toHaveBeenCalledTimes(1)
        const [pathParams] = mutateAsync.mock.calls[0][0]
        expect(pathParams).toEqual({
            store_type: 'shopify',
            store_name: 'ekster',
            internal_id: 'wf-internal-42',
        })
    })

    it("clears deactivated_datetime on every 'llm-conversation' entrypoint", async () => {
        const { result } = renderHook(() => useEnableAction())

        await result.current({
            storeName: 'ekster',
            storeType: 'shopify',
            configuration: buildConfiguration({
                entrypoints: [
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            requires_confirmation: false,
                            instructions: '',
                        },
                        deactivated_datetime: '2026-04-01T00:00:00.000Z',
                    },
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            requires_confirmation: false,
                            instructions: '',
                        },
                        deactivated_datetime: '2026-05-01T00:00:00.000Z',
                    },
                ] as unknown as StoreConfiguration['entrypoints'],
            }),
        })

        const [, body] = mutateAsync.mock.calls[0][0]
        expect(body.entrypoints).toHaveLength(2)
        for (const entrypoint of body.entrypoints) {
            expect(entrypoint.deactivated_datetime).toBeNull()
        }
    })

    it("leaves non-'llm-conversation' entrypoints untouched", async () => {
        const { result } = renderHook(() => useEnableAction())

        const reusableEntrypoint = {
            kind: 'reusable-llm-prompt-call-step',
            trigger: 'reusable-llm-prompt',
            settings: { requires_confirmation: false },
            deactivated_datetime: '2026-04-01T00:00:00.000Z',
        }

        await result.current({
            storeName: 'ekster',
            storeType: 'shopify',
            configuration: buildConfiguration({
                entrypoints: [
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            requires_confirmation: false,
                            instructions: '',
                        },
                        deactivated_datetime: '2026-04-01T00:00:00.000Z',
                    },
                    reusableEntrypoint,
                ] as unknown as StoreConfiguration['entrypoints'],
            }),
        })

        const [, body] = mutateAsync.mock.calls[0][0]
        const [llmConversation, reusable] = body.entrypoints
        expect(llmConversation.deactivated_datetime).toBeNull()
        expect(reusable).toEqual(reusableEntrypoint)
    })

    it('forwards the existing configuration fields in the request body', async () => {
        const { result } = renderHook(() => useEnableAction())

        const configuration = buildConfiguration({
            id: 'wf-logical-1',
            name: 'Refund',
        })

        await result.current({
            storeName: 'ekster',
            storeType: 'shopify',
            configuration,
        })

        const [, body] = mutateAsync.mock.calls[0][0]
        expect(body).toMatchObject({
            id: 'wf-logical-1',
            name: 'Refund',
            is_draft: false,
        })
    })

    it('propagates upsert failures to the caller', async () => {
        mutateAsync.mockRejectedValueOnce(new Error('boom'))
        const { result } = renderHook(() => useEnableAction())

        await expect(
            result.current({
                storeName: 'ekster',
                storeType: 'shopify',
                configuration: buildConfiguration(),
            }),
        ).rejects.toThrow('boom')
    })
})
