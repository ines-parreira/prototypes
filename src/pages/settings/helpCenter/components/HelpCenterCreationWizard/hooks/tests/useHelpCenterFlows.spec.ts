import {renderHook} from '@testing-library/react-hooks'
import Promise from 'promise-polyfill'
import {IntegrationType} from 'models/integration/constants'
import {ChannelLanguage} from 'pages/automate/common/types'
import useWorkflowConfigurations from 'pages/automate/common/hooks/useWorkflowConfigurations'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import {Components} from 'rest_api/help_center_api/client.generated'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {WorkflowConfigurationShallow} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {useHelpCenterFlows} from '../useHelpCenterFlows'

jest.mock('pages/automate/common/hooks/useWorkflowConfigurations', () =>
    jest.fn()
)
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

const mockedUseWorkflowConfigurations = jest.mocked(useWorkflowConfigurations)
const mockedUseHelpCentersAutomationSettings = jest.mocked(
    useHelpCentersAutomationSettings
)
const mockedUseSelfServiceConfiguration = jest.mocked(
    useSelfServiceConfiguration
)

const createWorkflowConfiguration = (
    id: string,
    props?: Partial<WorkflowConfigurationShallow>
): WorkflowConfigurationShallow => ({
    id,
    account_id: 1,
    available_languages: ['en-US'],
    internal_id: '0',
    is_draft: false,
    name: 'wf 1',
    initial_step_id: '0',
    steps: [],
    created_datetime: '',
    updated_datetime: '',
    deleted_datetime: '',
    ...props,
})

describe('useHelpCenterFlows', () => {
    beforeEach(() => {
        mockedUseWorkflowConfigurations.mockReturnValue({
            isFetchPending: false,
            workflowConfigurations: [],
        })
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
            createWorkflowConfiguration('1', {
                available_languages: ['en-US', 'sv-SE'],
            }),
            createWorkflowConfiguration('2', {
                available_languages: ['sv-SE'],
            }),
        ]
        mockedUseWorkflowConfigurations.mockReturnValue({
            isFetchPending: false,
            workflowConfigurations,
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
    })

    it('should return not draft workflow configs', () => {
        const workflowConfigurations: WorkflowConfigurationShallow[] = [
            createWorkflowConfiguration('1', {
                available_languages: ['en-US'],
                is_draft: true,
            }),
            createWorkflowConfiguration('2', {
                available_languages: ['en-US'],
                is_draft: false,
            }),
        ]
        mockedUseWorkflowConfigurations.mockReturnValue({
            isFetchPending: false,
            workflowConfigurations,
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
        expect(result.current.workflowConfigurations[0]).toEqual(
            expect.objectContaining({
                id: '2',
            })
        )
    })
})
