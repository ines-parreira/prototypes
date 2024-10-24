import {renderHook} from '@testing-library/react-hooks'
import Promise from 'promise-polyfill'

import {createWorkflowConfigurationShallow} from 'fixtures/workflows'
import {IntegrationType} from 'models/integration/constants'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {ChannelLanguage} from 'pages/automate/common/types'
import {WorkflowConfigurationShallow} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {Components} from 'rest_api/help_center_api/client.generated'

import {useHelpCenterFlows} from '../useHelpCenterFlows'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useHelpCenterAutomationSettings', () =>
    jest.fn()
)
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () =>
    jest.fn()
)

const shopType = IntegrationType.Shopify
const shopName = 'test-shop'
const supportedLocales: ChannelLanguage[] = ['en-US']
const automationSettings: Components.Schemas.AutomationSettingsDto = {
    workflows: [],
    order_management: {enabled: false},
}

const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations
)
const mockedUseHelpCentersAutomationSettings = jest.mocked(
    useHelpCentersAutomationSettings
)
const mockedUseSelfServiceConfiguration = jest.mocked(
    useSelfServiceConfiguration
)

describe('useHelpCenterFlows', () => {
    beforeEach(() => {
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
        mockedUseHelpCentersAutomationSettings.mockReturnValue({
            automationSettings,
            handleHelpCenterAutomationSettingsFetch: () =>
                Promise.resolve(undefined),
            handleHelpCenterAutomationSettingsUpdate: () =>
                Promise.resolve(undefined),
            isFetchPending: false,
            isUpdatePending: false,
        })
        mockedUseSelfServiceConfiguration.mockReturnValue({
            handleSelfServiceConfigurationUpdate: () =>
                Promise.resolve(undefined),
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: undefined,
            storeIntegration: undefined,
        })
    })

    it('should return workflows entrypoints', () => {
        const {result} = renderHook(() =>
            useHelpCenterFlows({
                shopName,
                supportedLocales,
                shopType,
                flows: [],
            })
        )

        expect(result.current).toEqual({
            entrypoints: [],
            isLoading: false,
            workflowConfigurations: [],
            workflowsEntrypoints: [],
            storeIntegration: undefined,
            enabledFlows: [],
            selfServiceConfiguration: undefined,
        })
    })

    it('should return filtered workflow configs by support languages', () => {
        const workflowConfigurations: WorkflowConfigurationShallow[] = [
            createWorkflowConfigurationShallow('1', {
                available_languages: ['en-US', 'sv-SE'],
            }),
            createWorkflowConfigurationShallow('2', {
                available_languages: ['sv-SE'],
            }),
        ]
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: workflowConfigurations,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const {result} = renderHook(() =>
            useHelpCenterFlows({
                shopName,
                supportedLocales: ['en-US'],
                shopType,
                flows: [],
            })
        )

        expect(result.current.workflowConfigurations).toHaveLength(1)
    })

    it('should return not draft workflow configs and entrypoints', () => {
        const workflowConfigurations: WorkflowConfigurationShallow[] = [
            createWorkflowConfigurationShallow('1', {
                available_languages: ['en-US'],
                is_draft: true,
            }),
            createWorkflowConfigurationShallow('2', {
                available_languages: ['en-US'],
                is_draft: false,
            }),
        ]
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: workflowConfigurations,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        mockedUseSelfServiceConfiguration.mockReturnValue({
            handleSelfServiceConfigurationUpdate: () =>
                Promise.resolve(undefined),
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                workflowsEntrypoints: workflowConfigurations.map((config) => ({
                    workflow_id: config.id,
                })),
            } as unknown as SelfServiceConfiguration,
            storeIntegration: undefined,
        })

        const {result} = renderHook(() =>
            useHelpCenterFlows({
                shopName,
                supportedLocales: ['en-US'],
                shopType,
                flows: [],
            })
        )

        expect(result.current.workflowConfigurations).toHaveLength(1)
        expect(result.current.entrypoints).toHaveLength(1)
        expect(result.current.workflowConfigurations?.[0]).toEqual(
            expect.objectContaining({
                id: '2',
            })
        )
    })
})
