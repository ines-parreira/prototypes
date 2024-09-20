import {renderHook, act} from '@testing-library/react-hooks'
import {useParams} from 'react-router-dom'
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
import {logEvent, SegmentEvent} from 'common/segment'
import {useAiAgentOnboardingWizard} from '../hooks/useAiAgentOnboardingWizard'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
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

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext
)
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('../../hooks/useGetOrCreateSnippetHelpCenter')
const mockUseGetOrCreateSnippetHelpCenter = assumeMock(
    useGetOrCreateSnippetHelpCenter
)

jest.mock('../../hooks/useStoreConfigurationMutation')
const mockUseStoreConfigurationMutation = assumeMock(
    useStoreConfigurationMutation
)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOnboardingWizardHelpCenterConnected:
            'ai-agent-onboarding-wizard-help-center-connected',
    },
}))

const mockedStoreConfiguration = getStoreConfigurationFixture()

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

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

const mockHelpCenterListData = {
    data: axiosSuccessResponse({
        data: [
            {id: 1, name: 'help center 1', type: 'faq', shop_name: 'test-shop'},
            {id: 2, name: 'help center 2', type: 'faq'},
        ],
    }),
    isLoading: false,
} as unknown as ReturnType<typeof useGetHelpCenterList>

const defaultStoreConfigurationMutation = {
    isLoading: false,
    upsertStoreConfiguration: mockUpdateStoreConfiguration,
    createStoreConfiguration: mockCreateStoreConfiguration,
    error: null,
}

describe('useAiAgentOnboardingWizard', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            shopName: 'test-shop',
        })
        mockUseGetHelpCenterList.mockReturnValue(mockHelpCenterListData)
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
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

        mockUseStoreConfigurationMutation.mockReturnValue(
            defaultStoreConfigurationMutation
        )
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
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.CANCEL)
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
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.CANCEL)
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
            ...defaultStoreConfigurationMutation,
            createStoreConfiguration: mockErrorCreateStoreConfiguration,
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
                message: 'Failed to save AI Agent configuration',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should call update store configuration on save when updating', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration:
                    getStoreConfigurationFixture(MOCK_WIZARD_VALUES),
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
                new Error('Failed to save AI Agent configuration')
            )
        mockUseStoreConfigurationMutation.mockReturnValue({
            ...defaultStoreConfigurationMutation,
            upsertStoreConfiguration: mockErrorUpdateStoreConfiguration,
        })

        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration:
                    getStoreConfigurationFixture(MOCK_WIZARD_VALUES),
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
                message: 'Failed to save AI Agent configuration',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should log connected help center event', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration:
                    getStoreConfigurationFixture(MOCK_WIZARD_VALUES),
                step: AiAgentOnboardingWizardStep.Knowledge,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            })
        })

        await waitFor(() => {
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentOnboardingWizardHelpCenterConnected,
                {helpCenterId: 1}
            )
        })
    })

    it('should not log connected help center event', async () => {
        const {result} = renderHook(() =>
            useAiAgentOnboardingWizard({
                storeConfiguration:
                    getStoreConfigurationFixture(MOCK_WIZARD_VALUES),
                step: AiAgentOnboardingWizardStep.Personalize,
            })
        )

        act(() => {
            result.current.handleSave({
                publicUrls: [],
                redirectTo: WIZARD_BUTTON_ACTIONS.NEXT_STEP,
            })
        })

        await waitFor(() => {
            expect(logEvent).not.toHaveBeenCalledWith(
                SegmentEvent.AiAgentOnboardingWizardHelpCenterConnected,
                {helpCenterId: 1}
            )
        })
    })
})
