import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { ulid } from 'ulidx'

import { IntegrationType } from 'models/integration/constants'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useApps from '../useApps'
import useEnabledActionStepsByApp from '../useEnabledActionStepsByApp'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('models/workflows/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseFlags = jest.mocked(useFlags)

const queryClient = mockQueryClient()
const mockUseApps = jest.mocked(useApps)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const b1 = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: '',
    initialStep: {
        id: ulid(),
        kind: 'http-request',
        settings: {
            url: '',
            method: 'GET',
            headers: {},
            name: '',
            variables: [],
        },
    },
    entrypoints: [
        {
            kind: 'reusable-llm-prompt-call-step',
            trigger: 'reusable-llm-prompt',
            settings: {
                requires_confirmation: false,
                conditions: null,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'reusable-llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
        },
    ],
    is_draft: false,
    available_languages: [],
    apps: [{ type: 'shopify' }],
})

const configuration1 = b1.build()

const b2 = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: '',
    initialStep: {
        id: ulid(),
        kind: 'http-request',
        settings: {
            url: '',
            method: 'GET',
            headers: {},
            name: '',
            variables: [],
        },
    },
    entrypoints: [
        {
            kind: 'reusable-llm-prompt-call-step',
            trigger: 'reusable-llm-prompt',
            settings: {
                requires_confirmation: false,
                conditions: null,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'reusable-llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
        },
    ],
    is_draft: false,
    available_languages: [],
    apps: [{ type: 'recharge' }],
})

const configuration2 = b2.build()

const b3 = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: '',
    initialStep: {
        id: ulid(),
        kind: 'http-request',
        settings: {
            url: '',
            method: 'GET',
            headers: {},
            name: '',
            variables: [],
        },
    },
    entrypoints: [
        {
            kind: 'reusable-llm-prompt-call-step',
            trigger: 'reusable-llm-prompt',
            settings: {
                requires_confirmation: false,
                conditions: null,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'reusable-llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
        },
    ],
    is_draft: false,
    available_languages: [],
    apps: [{ type: 'app', app_id: 'someid' }],
})

const configuration3 = b3.build()

describe('useEnabledActionStepsByApp()', () => {
    beforeEach(() => {
        mockUseApps.mockReturnValue({
            apps: [
                {
                    icon: '/assets/img/integrations/someid.png',
                    id: 'someid',
                    name: 'Some App',
                    type: IntegrationType.App,
                },
                {
                    icon: '/assets/img/integrations/recharge.png',
                    id: 'recharge',
                    name: 'Recharge',
                    type: IntegrationType.Recharge,
                },
                {
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: IntegrationType.Shopify,
                },
                {
                    icon: '/assets/img/integrations/sandbox.png',
                    id: 'sandbox',
                    name: 'Sandbox',
                    type: IntegrationType.App,
                },
            ],
            isLoading: false,
            actionsApps: [],
        })
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [configuration1, configuration2, configuration3],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
    })

    it('should return all steps', () => {
        mockUseFlags.mockReturnValue({ [FeatureFlagKey.ActionSteps]: {} })

        const { result } = renderHook(() => useEnabledActionStepsByApp(true), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                stepsByUsefulness: {
                    used: [],
                    unused: [
                        ['recharge', [configuration2]],
                        ['shopify', [configuration1]],
                        ['someid', [configuration3]],
                    ],
                },
            }),
        )
    })

    it("shouldn't return any steps", () => {
        mockUseFlags.mockReturnValue({ [FeatureFlagKey.ActionSteps]: [] })

        const { result } = renderHook(() => useEnabledActionStepsByApp(true), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                stepsByUsefulness: {
                    used: [],
                    unused: [],
                },
            }),
        )
    })

    it('should return some steps', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ActionSteps]: [
                configuration1.internal_id,
                configuration3.internal_id,
            ],
        })

        const { result } = renderHook(() => useEnabledActionStepsByApp(true), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                stepsByUsefulness: {
                    used: [],
                    unused: [
                        ['shopify', [configuration1]],
                        ['someid', [configuration3]],
                    ],
                },
            }),
        )
    })

    it('should return not return recharge step without integration', () => {
        mockUseFlags.mockReturnValue({ [FeatureFlagKey.ActionSteps]: {} })

        const { result } = renderHook(() => useEnabledActionStepsByApp(false), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                stepsByUsefulness: {
                    used: [['shopify', [configuration1]]],
                    unused: [['someid', [configuration3]]],
                },
            }),
        )
    })
})
