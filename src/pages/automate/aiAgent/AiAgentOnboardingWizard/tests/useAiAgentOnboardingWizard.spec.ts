import {renderHook, act} from '@testing-library/react-hooks'
import {useParams} from 'react-router-dom'
import {IntegrationType} from '@gorgias/api-queries'
import {waitFor} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {fromJS} from 'immutable'
import {notify} from 'state/notifications/actions'
import history from 'pages/history'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {assumeMock} from 'utils/testing'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {NotificationStatus} from 'state/notifications/types'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {account} from 'fixtures/account'
import {StoreState} from 'state/types'
import {validateConfigurationFormValues} from '../../hooks/useConfigurationForm'
import {useAiAgentOnboardingWizard} from '../hooks/useAiAgentOnboardingWizard'
import {INITIAL_FORM_VALUES} from '../../components/StoreConfigForm/StoreConfigForm'
import {ValidFormValues} from '../../types'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'
import {WIZARD_BUTTON_ACTIONS} from '../../constants'
import {useGetOrCreateSnippetHelpCenter} from '../../hooks/useGetOrCreateSnippetHelpCenter'
import {useStoreConfigurationMutation} from '../../hooks/useStoreConfigurationMutation'

jest.mock('pages/history')
jest.mock('state/notifications/actions')

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)

jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
const mockUseNavigateWizardSteps = assumeMock(useNavigateWizardSteps)

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('../../hooks/useGetOrCreateSnippetHelpCenter')
const mockUseGetOrCreateSnippetHelpCenter = assumeMock(
    useGetOrCreateSnippetHelpCenter
)

jest.mock('../../hooks/useConfigurationForm')
const mockValidateConfigurationFormValues = assumeMock(
    validateConfigurationFormValues
)

jest.mock('../../hooks/useStoreConfigurationMutation')
const mockUseStoreConfigurationMutation = assumeMock(
    useStoreConfigurationMutation
)

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const mockedHelpCenterListData = {
    data: axiosSuccessResponse({
        data: [
            {id: 1, name: 'help center 1', type: 'faq', shop_name: 'test-shop'},
            {id: 2, name: 'help center 2', type: 'faq'},
        ],
    }),
    isLoading: false,
} as unknown as ReturnType<typeof useGetHelpCenterList>

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const MOCK_EMAIL_INTEGRATION = {
    id: 1,
    type: IntegrationType.Email,
    name: 'My email integration',
    meta: {
        address: MOCK_EMAIL_ADDRESS,
    },
}

const MOCK_WIZARD_VALUES = {
    wizard: {
        id: 1,
        stepName: AiAgentOnboardingWizardStep.Education,
        completedDatetime: null,
        stepData: {
            hasEducationStepEnabled: true,
            enabledChannels: [],
            isAutoresponderTurnedOff: null,
            onCompletePathway: null,
        },
    },
}

const mockedStoreConfiguration =
    getStoreConfigurationFixture(MOCK_WIZARD_VALUES)

const validFormValues: ValidFormValues = {
    ...INITIAL_FORM_VALUES,
    monitoredEmailIntegrations: [
        {
            email: MOCK_EMAIL_ADDRESS,
            id: MOCK_EMAIL_INTEGRATION.id,
        },
    ],
    monitoredChatIntegrations: [],
    helpCenterId: 1,
    wizard: {
        completedDatetime: null,
        hasEducationStepEnabled: false,
        isAutoresponderTurnedOff: false,
        enabledChannels: null,
        onCompletePathway: null,
        stepName: AiAgentOnboardingWizardStep.Education,
    },
    ticketSampleRate: 0,
}

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockResolvedValue(mockedStoreConfiguration)
const mockCreateStoreConfiguration = jest
    .fn()
    .mockResolvedValue(mockedStoreConfiguration)
const mockNavigateWizardSteps = {
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
}

describe('useAiAgentOnboardingWizard', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            shopName: 'test-shop',
        })
        mockUseGetHelpCenterList.mockReturnValue(mockedHelpCenterListData)
        mockValidateConfigurationFormValues.mockReturnValue(validFormValues)
        mockUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            upsertStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            error: null,
        })
        mockUseNavigateWizardSteps.mockReturnValue(mockNavigateWizardSteps)
        mockUseAppSelector.mockImplementation((selector) =>
            selector({
                currentAccount: fromJS(account),
            } as unknown as StoreState)
        )
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            helpCenter: null,
            isLoading: false,
        })
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: true,
        })
    })

    it('should initialize store configuration with default value', () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        expect(result.current.storeFormValues).toBeDefined()
        expect(result.current.faqHelpCenters).toEqual([
            {id: 1, name: 'help center 1', type: 'faq', shop_name: 'test-shop'},
        ])
        expect(result.current.snippetHelpCenter).toBe(null)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle form updates correctly', () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleFormUpdate({helpCenterId: 2})
        })

        expect(result.current.storeFormValues.helpCenterId).toBe(2)
    })

    it('should handle action and navigate to previous or next step', () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.NEXT_STEP)
        })
        expect(mockNavigateWizardSteps.goToNextStep).toHaveBeenCalled()

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP)
        })
        expect(mockNavigateWizardSteps.goToPreviousStep).toHaveBeenCalled()
    })

    it('should handle action and navigate to the welcome page', () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleAction(
                WIZARD_BUTTON_ACTIONS.BACK_TO_WELCOME_PAGE
            )
        })

        expect(history.replace).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/ai-agent'
        )
    })

    it('should not navigate if there is no shopType', () => {
        mockUseParams.mockReturnValue({
            shopName: 'test-shop',
        })
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleAction(
                WIZARD_BUTTON_ACTIONS.BACK_TO_WELCOME_PAGE
            )
        })
        expect(history.replace).not.toHaveBeenCalled()

        act(() => {
            result.current.handleAction(
                WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE
            )
        })
        expect(history.replace).not.toHaveBeenCalled()

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST)
        })
        expect(history.replace).not.toHaveBeenCalled()

        act(() => {
            result.current.handleAction(
                WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE
            )
        })
        expect(history.replace).not.toHaveBeenCalled()
    })

    it('should perform nothing if handlAction is called with an unknown action', () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleAction('unknown' as WIZARD_BUTTON_ACTIONS)
        })

        expect(history.replace).not.toHaveBeenCalled()
        expect(mockNavigateWizardSteps.goToNextStep).not.toHaveBeenCalled()
        expect(mockNavigateWizardSteps.goToPreviousStep).not.toHaveBeenCalled()
    })

    it('should handle save and navigate to the test tab', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Knowledge,
            })
        )

        act(() => {
            result.current.handleSave({
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST,
                successModalParams: 'test',
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: '/app/automation/shopify/test-shop/ai-agent/test',
                search: 'test',
            })
        })
    })

    it('should handle save and navigate to the guidance tab', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Knowledge,
            })
        )

        act(() => {
            result.current.handleSave({
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE,
                successModalParams: 'guidance',
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: '/app/automation/shopify/test-shop/ai-agent/guidance',
                search: 'guidance',
            })
        })
    })

    it('should call create store configuration on save when creating', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            })
        })

        await waitFor(() => {
            expect(mockCreateStoreConfiguration).toHaveBeenCalled()
            expect(mockCreateStoreConfiguration).toHaveReturnedWith(
                Promise.resolve(mockedStoreConfiguration)
            )
        })
    })

    it('should handle error if create store configuration fails', async () => {
        const mockErrorCreateStoreConfiguration = jest
            .fn()
            .mockRejectedValue(
                new Error('Failed to create AI Agent Configuration')
            )
        mockUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            upsertStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockErrorCreateStoreConfiguration,
            error: null,
        })

        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            })
        })

        await waitFor(() => {
            expect(mockErrorCreateStoreConfiguration).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                message: 'Failed to create AI Agent Configuration',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should call update store configuration on save when updating', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: mockedStoreConfiguration,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            })
        })

        await waitFor(() => {
            expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            expect(mockUpdateStoreConfiguration).toHaveReturnedWith(
                Promise.resolve(mockedStoreConfiguration)
            )
        })
    })

    it('should not call update store configuration if store configuration does not exist', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: undefined,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            })
        })

        await waitFor(() => {
            expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        })
    })

    it('should handle error if update store configuration fails', async () => {
        const mockErrorUpdateStoreConfiguration = jest
            .fn()
            .mockRejectedValue(
                new Error('Failed to update AI Agent Configuration')
            )
        mockUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            upsertStoreConfiguration: mockErrorUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            error: null,
        })
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration: mockedStoreConfiguration,
                step: AiAgentOnboardingWizardStep.Education,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            })
        })

        await waitFor(() => {
            expect(mockErrorUpdateStoreConfiguration).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                message: 'Failed to update AI Agent Configuration',
                status: NotificationStatus.Error,
            })
        })
    })
})
