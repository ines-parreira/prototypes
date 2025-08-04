import { useEffectOnce } from '@repo/hooks'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { useSearch } from 'hooks/useSearch'
import { IntegrationType } from 'models/integration/constants'
import {
    useGetWorkflowConfiguration,
    useUpsertWorkflowConfiguration,
} from 'models/workflows/queries'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useSelfServiceConfigurationUpdate } from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import { useSelfServiceStoreIntegrationContext } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import * as serverValidationErrors from 'pages/automate/workflows/utils/serverValidationErrors'
import { NotificationStatus } from 'state/notifications/types'

import { useStoreWorkflowsApi } from '../../hooks/useStoreWorkflowsApi'
import useWorkflowChannelSupport from '../../hooks/useWorkflowChannelSupport'
import { useWorkflowEditorContext } from '../../hooks/useWorkflowEditor'
import {
    useWorkflowsIdsEnabledInChat,
    useWorkflowsIdsEnabledInContactForm,
    useWorkflowsIdsEnabledInHelpCenter,
} from '../../hooks/useWorkflowEnabledInChannels'
import WorkflowEditorView from '../WorkflowEditorView'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useEffectOnce: jest.fn(),
}))
jest.mock('hooks/useSearch')
jest.mock('hooks/useGetDateAndTimeFormat')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('pages/automate/common/hooks/useSelfServiceConfigurationUpdate')
jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration', () => ({
    useSelfServiceStoreIntegrationContext: jest.fn(),
    withSelfServiceStoreIntegrationContext: (Component: any) => Component,
}))
jest.mock('../../hooks/useStoreWorkflowsApi')
jest.mock('../../hooks/useWorkflowChannelSupport')
jest.mock('../../hooks/useWorkflowEditor', () => ({
    useWorkflowEditorContext: jest.fn(),
    withWorkflowEditorContext: (Component: any) => Component,
}))
jest.mock('../../hooks/useWorkflowEnabledInChannels')
jest.mock('../visualBuilder/WorkflowVisualBuilder')
// jest.mock('../WorkflowEditorActionButtons') // Need actual buttons for tests
// jest.mock('pages/common/components/PageHeader') // Need header for buttons
jest.mock('pages/common/components/ToggleButton')
jest.mock('pages/common/components/UnsavedChangesPrompt')
jest.mock('pages/common/forms/input/TextInput')
jest.mock('../../components/DraftBadge')
jest.mock('../../components/WorkflowLanguageSelect')
jest.mock('models/workflows/queries')
jest.mock('pages/automate/workflows/utils/serverValidationErrors')

const mockUseAppSelector = jest.mocked(useAppSelector)
const mockUseEffectOnce = jest.mocked(useEffectOnce)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)
const mockUseSearch = jest.mocked(useSearch)
const mockUseSelfServiceChatChannels = jest.mocked(useSelfServiceChatChannels)
const mockUseSelfServiceConfigurationUpdate = jest.mocked(
    useSelfServiceConfigurationUpdate,
)
const mockUseSelfServiceStoreIntegrationContext = jest.mocked(
    useSelfServiceStoreIntegrationContext,
)
const mockUseStoreWorkflowsApi = jest.mocked(useStoreWorkflowsApi)
const mockUseWorkflowChannelSupport = jest.mocked(useWorkflowChannelSupport)
const mockUseWorkflowEditorContext = jest.mocked(useWorkflowEditorContext)
const mockUseWorkflowsIdsEnabledInChat = jest.mocked(
    useWorkflowsIdsEnabledInChat,
)
const mockUseWorkflowsIdsEnabledInContactForm = jest.mocked(
    useWorkflowsIdsEnabledInContactForm,
)
const mockUseWorkflowsIdsEnabledInHelpCenter = jest.mocked(
    useWorkflowsIdsEnabledInHelpCenter,
)
const mockUseGetWorkflowConfiguration = jest.mocked(useGetWorkflowConfiguration)
const mockUseUpsertWorkflowConfiguration = jest.mocked(
    useUpsertWorkflowConfiguration,
)
const mockServerValidationErrors = jest.mocked(serverValidationErrors)

const defaultProps = {
    shopType: 'shopify',
    shopName: 'test-shop',
    workflowId: 'workflow-123',
    isNewWorkflow: false,
    onDiscard: jest.fn(),
    onSave: jest.fn(),
    onNewWorkflowCreated: jest.fn(),
    onPublish: jest.fn(),
    notifyMerchant: jest.fn(),
    goToWorkflowAnalyticsPage: jest.fn(),
    logActionOnFlowBuilder: jest.fn(),
}

const mockWorkflowEditorContext = {
    isDirty: false,
    configuration: {
        id: 'workflow-123',
        internal_id: 'internal-123',
        name: 'Test Workflow',
        initial_step_id: 'step-1',
        is_draft: false,
        steps: [],
        transitions: [],
        available_languages: ['en-US'],
    } as any,
    isFetchPending: false,
    isSavePending: false,
    isPublishPending: false,
    isTesting: false,
    zoom: 1,
    configurationSizeToLimitRate: 0,
    translationSizeToLimitRate: 0,
    visualBuilderGraph: {
        id: 'graph-123',
        internal_id: 'internal-123',
        name: 'Test Workflow',
        is_draft: false,
        errors: null,
        available_languages: ['en-US'],
        nodes: [],
        edges: [],
        triggers: [],
        trigger_id: null,
    } as any,
    currentLanguage: 'en-US' as any,
    handleDiscard: jest.fn(),
    handleValidate: jest.fn().mockReturnValue(true),
    handleValidateSize: jest.fn().mockReturnValue(null),
    handleSave: jest.fn(),
    handlePublish: jest.fn(),
    setIsTesting: jest.fn(),
    setFlowPublishingInChannels: jest.fn(),
    isFlowPublishingInChannels: false,
    setZoom: jest.fn(),
    translateKey: jest.fn(),
    translateGraph: jest.fn(),
    dispatch: jest.fn(),
    switchLanguage: jest.fn(),
    deleteTranslation: jest.fn(),
}

beforeEach(() => {
    jest.clearAllMocks()

    mockUseAppSelector.mockReturnValue(DEFAULT_TIMEZONE)
    mockUseEffectOnce.mockImplementation((fn) => fn())
    mockUseGetDateAndTimeFormat.mockReturnValue('MM/dd/yyyy, h:mm a')
    mockUseSearch.mockReturnValue({ template: undefined, from: undefined })
    mockUseSelfServiceChatChannels.mockReturnValue([])
    mockUseSelfServiceConfigurationUpdate.mockReturnValue({
        isUpdatePending: false,
        handleSelfServiceConfigurationUpdate: jest.fn(),
    })
    mockUseSelfServiceStoreIntegrationContext.mockReturnValue({
        id: 123,
        type: IntegrationType.Shopify,
        name: 'test-shop',
        description: null,
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-01T00:00:00Z',
        deleted_datetime: null,
        deactivated_datetime: null,
        decoration: null,
        meta: {
            oauth: {
                status: 'success',
                error: '',
                scope: '',
            },
            shop_name: 'test-shop',
            webhooks: [],
        },
    } as any)
    mockUseStoreWorkflowsApi.mockReturnValue({
        duplicateWorkflow: jest.fn(),
        removeWorkflowFromStore: jest.fn(),
        appendWorkflowInStore: jest.fn(),
        workflowConfigurationById: {},
        isFetchPending: false,
        isUpdatePending: false,
    })
    mockUseWorkflowChannelSupport.mockReturnValue({
        isStepUnsupportedInAllChannels: jest.fn(),
        getUnsupportedConnectedChannels: jest.fn(),
        getSupportedChannels: jest.fn(),
        getUnsupportedChannels: jest.fn(),
        getUnsupportedNodeTypes: jest.fn(),
    })
    mockUseWorkflowEditorContext.mockReturnValue(mockWorkflowEditorContext)
    mockUseWorkflowsIdsEnabledInChat.mockReturnValue(new Set())
    mockUseWorkflowsIdsEnabledInContactForm.mockReturnValue(new Set())
    mockUseWorkflowsIdsEnabledInHelpCenter.mockReturnValue(new Set())
    mockUseGetWorkflowConfiguration.mockReturnValue({
        data: mockWorkflowEditorContext.configuration,
        isInitialLoading: false,
        error: null,
        isError: false,
    } as any)
    mockUseUpsertWorkflowConfiguration.mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue('workflow-123'),
    } as any)

    // Default mock - can be overridden in individual tests
    mockServerValidationErrors.mapServerErrorsToGraph = jest
        .fn()
        .mockReturnValue(null)
})

const renderWorkflowEditorView = (props = {}) => {
    const history = createMemoryHistory()
    return render(
        <Router history={history}>
            <WorkflowEditorView {...defaultProps} {...props} />
        </Router>,
    )
}

describe('<WorkflowEditorView />', () => {
    it('should handle server validation errors during save', async () => {
        const serverError = {
            response: {
                status: 400,
                data: {
                    error: {
                        details: {
                            workflow_configuration: {
                                steps: {
                                    'step-id': {
                                        settings: {
                                            url: ['Invalid URL format'],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }

        const mockHandleSave = jest.fn().mockRejectedValue(serverError)
        const mockNotifyMerchant = jest.fn()

        mockUseWorkflowEditorContext.mockReturnValue({
            ...mockWorkflowEditorContext,
            handleSave: mockHandleSave,
            isDirty: true,
            configuration: {
                ...mockWorkflowEditorContext.configuration,
                is_draft: true,
            },
        })

        // Mock server validation error detection to return truthy value (indicating server validation errors found)
        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockReturnValue({
                nodes: [],
                edges: [],
                errors: { serverValidation: true },
            })

        renderWorkflowEditorView({
            notifyMerchant: mockNotifyMerchant,
        })

        const saveButton = screen.getByRole('button', { name: /save/i })

        act(() => {
            fireEvent.click(saveButton)
        })

        await waitFor(() => {
            expect(mockHandleSave).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockNotifyMerchant).toHaveBeenCalledWith({
                message: 'Please fix the validation errors below and try again',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should handle generic server errors during save', async () => {
        const genericError = new Error('Network error')

        const mockHandleSave = jest.fn().mockRejectedValue(genericError)
        const mockNotifyMerchant = jest.fn()

        mockUseWorkflowEditorContext.mockReturnValue({
            ...mockWorkflowEditorContext,
            handleSave: mockHandleSave,
            isDirty: true,
            configuration: {
                ...mockWorkflowEditorContext.configuration,
                is_draft: true,
            },
        })

        renderWorkflowEditorView({
            notifyMerchant: mockNotifyMerchant,
        })

        const saveButton = screen.getByRole('button', { name: /save/i })

        act(() => {
            fireEvent.click(saveButton)
        })

        await waitFor(() => {
            expect(mockHandleSave).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockNotifyMerchant).toHaveBeenCalledWith({
                message:
                    'An error happened trying to save the flow, please try again or contact support',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should handle server validation errors during publish', async () => {
        const serverError = {
            response: {
                status: 400,
                data: {
                    error: {
                        details: {
                            workflow_configuration: {
                                steps: {
                                    'step-id': {
                                        settings: {
                                            url: ['Invalid URL format'],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }

        const mockHandlePublish = jest.fn().mockRejectedValue(serverError)
        const mockNotifyMerchant = jest.fn()

        mockUseWorkflowEditorContext.mockReturnValue({
            ...mockWorkflowEditorContext,
            handlePublish: mockHandlePublish,
            isDirty: true,
            configuration: {
                ...mockWorkflowEditorContext.configuration,
                is_draft: true,
            },
        })

        // Mock server validation error detection to return truthy value (indicating server validation errors found)
        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockReturnValue({
                nodes: [],
                edges: [],
                errors: { serverValidation: true },
            })

        renderWorkflowEditorView({
            notifyMerchant: mockNotifyMerchant,
        })

        const publishButton = screen.getByRole('button', { name: /publish/i })

        act(() => {
            fireEvent.click(publishButton)
        })

        await waitFor(() => {
            expect(mockHandlePublish).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockNotifyMerchant).toHaveBeenCalledWith({
                message: 'Please fix the validation errors below and try again',
                status: NotificationStatus.Error,
            })
        })
    })
})
