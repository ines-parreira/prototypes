import { renderHook } from '@repo/testing'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import useGetIsActionStepEnabled from 'pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled'

import { useAppActionSteps } from '../useAppActionSteps'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

jest.mock('pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseGetIsActionStepEnabled = jest.mocked(useGetIsActionStepEnabled)

const APP_ID = 'klaviyo'

const mockTemplatesQueryResult = (data: unknown, isInitialLoading = false) => {
    mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
        data,
        isInitialLoading,
    } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
}

describe('useAppActionSteps', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseGetIsActionStepEnabled.mockReturnValue(() => true)
    })

    it('requests workflow configuration templates filtered to the reusable-llm-prompt trigger', () => {
        mockTemplatesQueryResult([])

        renderHook(() => useAppActionSteps(APP_ID))

        expect(mockUseGetWorkflowConfigurationTemplates).toHaveBeenCalledWith({
            triggers: ['reusable-llm-prompt'],
        })
    })

    it('returns an empty array when no templates are available', () => {
        mockTemplatesQueryResult([])

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toEqual([])
    })

    it('matches templates whose app entry has type "app" and matching app_id', () => {
        const template = {
            id: 'template-klaviyo',
            internal_id: 'template-internal-klaviyo',
            name: 'Send Klaviyo email',
            apps: [{ type: 'app', app_id: APP_ID }],
        }
        mockTemplatesQueryResult([template])

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toEqual([template])
    })

    it('matches templates whose app entry type equals the appId (e.g. shopify)', () => {
        const template = {
            id: 'template-shopify',
            internal_id: 'template-internal-shopify',
            name: 'Get Shopify order',
            apps: [{ type: 'shopify' }],
        }
        mockTemplatesQueryResult([template])

        const { result } = renderHook(() => useAppActionSteps('shopify'))

        expect(result.current.appActionSteps).toEqual([template])
    })

    it('excludes templates that do not reference the given appId', () => {
        const klaviyoTemplate = {
            id: 'template-klaviyo',
            internal_id: 'template-internal-klaviyo',
            name: 'Send Klaviyo email',
            apps: [{ type: 'app', app_id: APP_ID }],
        }
        const shopifyTemplate = {
            id: 'template-shopify',
            internal_id: 'template-internal-shopify',
            name: 'Get Shopify order',
            apps: [{ type: 'shopify' }],
        }
        mockTemplatesQueryResult([klaviyoTemplate, shopifyTemplate])

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toEqual([klaviyoTemplate])
    })

    it('filters out templates whose internal_id is not enabled by useGetIsActionStepEnabled', () => {
        const enabledTemplate = {
            id: 'template-enabled',
            internal_id: 'enabled-internal-id',
            name: 'Enabled action',
            apps: [{ type: 'app', app_id: APP_ID }],
        }
        const disabledTemplate = {
            id: 'template-disabled',
            internal_id: 'disabled-internal-id',
            name: 'Disabled action',
            apps: [{ type: 'app', app_id: APP_ID }],
        }
        mockTemplatesQueryResult([enabledTemplate, disabledTemplate])
        mockUseGetIsActionStepEnabled.mockReturnValue(
            (internalId: string) => internalId !== 'disabled-internal-id',
        )

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toEqual([enabledTemplate])
    })

    it('deduplicates templates that share the same id', () => {
        const template = {
            id: 'template-klaviyo',
            internal_id: 'template-internal-klaviyo',
            name: 'Send Klaviyo email',
            apps: [{ type: 'app', app_id: APP_ID }],
        }
        mockTemplatesQueryResult([template, { ...template }])

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toHaveLength(1)
        expect(result.current.appActionSteps[0]).toEqual(template)
    })

    it('matches when any entry in the apps array matches the appId', () => {
        const template = {
            id: 'template-multi',
            internal_id: 'template-internal-multi',
            name: 'Multi-app action',
            apps: [{ type: 'shopify' }, { type: 'app', app_id: APP_ID }],
        }
        mockTemplatesQueryResult([template])

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toEqual([template])
    })

    it('forwards isInitialLoading from the underlying query', () => {
        mockTemplatesQueryResult([], true)

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.isInitialLoading).toBe(true)
    })

    it('defaults templates to an empty list when the query returns undefined data', () => {
        mockTemplatesQueryResult(undefined)

        const { result } = renderHook(() => useAppActionSteps(APP_ID))

        expect(result.current.appActionSteps).toEqual([])
    })

    it('returns a stable result when inputs do not change between renders', () => {
        const template = {
            id: 'template-klaviyo',
            internal_id: 'template-internal-klaviyo',
            name: 'Send Klaviyo email',
            apps: [{ type: 'app', app_id: APP_ID }],
        }
        const isEnabled = () => true
        mockUseGetIsActionStepEnabled.mockReturnValue(isEnabled)
        mockTemplatesQueryResult([template])

        const { result, rerender } = renderHook(() => useAppActionSteps(APP_ID))
        const firstResult = result.current.appActionSteps

        rerender()

        expect(result.current.appActionSteps).toBe(firstResult)
    })
})
