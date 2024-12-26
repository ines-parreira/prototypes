import {renderHook} from '@testing-library/react-hooks'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'

import {TemplateConfiguration} from '../../types'
import useEnabledActionTemplates from '../useEnabledActionTemplates'

jest.mock('launchdarkly-react-client-sdk')

const mockUseFlags = jest.mocked(useFlags)

const b1 = new WorkflowConfigurationBuilder({
    id: 'id1',
    name: 'test template',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
})

const template1 = b1.build<TemplateConfiguration>()

const b2 = new WorkflowConfigurationBuilder({
    id: 'id2',
    name: 'test template',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
})

const template2 = b2.build<TemplateConfiguration>()

describe('useEnabledActionTemplates()', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return all templates', () => {
        mockUseFlags.mockReturnValue({[FeatureFlagKey.ActionTemplates]: {}})

        const {result} = renderHook(() =>
            useEnabledActionTemplates([template1, template2])
        )

        expect(result.current).toEqual([template1, template2])
    })

    it('should return no templates', () => {
        mockUseFlags.mockReturnValue({[FeatureFlagKey.ActionTemplates]: []})

        const {result} = renderHook(() =>
            useEnabledActionTemplates([template1, template2])
        )

        expect(result.current).toEqual([])
    })

    it('should return only selected templates', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ActionTemplates]: [template1.internal_id],
        })

        const {result} = renderHook(() =>
            useEnabledActionTemplates([template1, template2])
        )

        expect(result.current).toEqual([template1])
    })
})
