import { renderHook } from '@testing-library/react-hooks'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { ulid } from 'ulidx'

import { FeatureFlagKey } from 'config/featureFlags'
import { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'

import useEnabledActionStepsByApp from '../useEnabledActionStepsByApp'

jest.mock('launchdarkly-react-client-sdk')

const mockUseFlags = jest.mocked(useFlags)

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
    it('should return all steps', () => {
        mockUseFlags.mockReturnValue({ [FeatureFlagKey.ActionSteps]: {} })

        const { result } = renderHook(() =>
            useEnabledActionStepsByApp([
                configuration1,
                configuration2,
                configuration3,
            ] as ActionTemplate[]),
        )

        expect(result.current).toEqual({
            shopify: [configuration1],
            recharge: [configuration2],
            someid: [configuration3],
        })
    })

    it("shouldn't return any steps", () => {
        mockUseFlags.mockReturnValue({ [FeatureFlagKey.ActionSteps]: [] })

        const { result } = renderHook(() =>
            useEnabledActionStepsByApp([
                configuration1,
                configuration2,
                configuration3,
            ] as ActionTemplate[]),
        )

        expect(result.current).toEqual({})
    })

    it('should return some steps', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ActionSteps]: [
                configuration1.internal_id,
                configuration3.internal_id,
            ],
        })

        const { result } = renderHook(() =>
            useEnabledActionStepsByApp([
                configuration1,
                configuration2,
                configuration3,
            ] as ActionTemplate[]),
        )

        expect(result.current).toEqual({
            shopify: [configuration1],
            someid: [configuration3],
        })
    })
})
