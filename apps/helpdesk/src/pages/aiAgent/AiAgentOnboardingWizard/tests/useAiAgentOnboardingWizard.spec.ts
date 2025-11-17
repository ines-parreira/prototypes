import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import { assumeMock, renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import { account } from 'fixtures/account'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import useAppSelector from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import {
    AiAgentOnboardingWizardStep,
    AiAgentOnboardingWizardType,
} from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { useStoreConfigurationMutation } from 'pages/aiAgent/hooks/useStoreConfigurationMutation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreState } from 'state/types'

import { WIZARD_BUTTON_ACTIONS } from '../../constants'
import { getStoreConfigurationFixture } from '../../fixtures/storeConfiguration.fixtures'
import { useAiAgentOnboardingWizard } from '../hooks/useAiAgentOnboardingWizard'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
        replace: jest.fn(),
    },
}))
jest.mock('state/notifications/actions')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)

jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
const mockUseNavigateWizardSteps = assumeMock(useNavigateWizardSteps)

jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
    () => ({
        useFetchChatIntegrationsStatusData: jest.fn().mockReturnValue({
            data: [],
            isLoading: false,
            isFetched: true,
        }),
    }),
)

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter')
const mockUseGetOrCreateSnippetHelpCenter = assumeMock(
    useGetOrCreateSnippetHelpCenter,
)

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
const mockUseSelfServiceChatChannels = assumeMock(useSelfServiceChatChannels)

jest.mock('pages/aiAgent/hooks/useStoreConfigurationMutation')
const mockUseStoreConfigurationMutation = assumeMock(
    useStoreConfigurationMutation,
)

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOnboardingWizardHelpCenterConnected:
            'ai-agent-onboarding-wizard-help-center-connected',
    },
}))

jest.mock('hooks/useSearchParam')
const mockUseSearchParam = assumeMock(useSearchParam)

const mockedStoreConfiguration = getStoreConfigurationFixture()

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

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

jest.mock('pages/aiAgent/hooks/useStoresDomainIngestionLogs', () => ({
    useStoresDomainIngestionLogs: () => ({
        isLoading: false,
        data: undefined,
    }),
}))

const mockHelpCenterListData = {
    data: axiosSuccessResponse({
        data: [
            {
                id: 1,
                name: 'help center 1',
                type: 'faq',
                shop_name: 'test-shop',
            },
            { id: 2, name: 'help center 2', type: 'faq' },
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

const storeConfigurationContextMock = {
    storeConfiguration: getStoreConfigurationFixture(),
    isLoading: false,
    updateStoreConfiguration: mockUpdateStoreConfiguration,
    createStoreConfiguration: mockCreateStoreConfiguration,
    isPendingCreateOrUpdate: false,
}

describe('useAiAgentOnboardingWizard', () => {
    const mockSetSearchParam = jest.fn()
    beforeEach(() => {
        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            shopName: 'test-shop',
        })
        mockSetSearchParam.mockClear()
        mockUseSearchParam.mockImplementation(() => [null, mockSetSearchParam])
        mockUseGetHelpCenterList.mockReturnValue(mockHelpCenterListData)
        mockUseAiAgentStoreConfigurationContext.mockReturnValue(
            storeConfigurationContextMock,
        )
        mockUseNavigateWizardSteps.mockReturnValue(mockNavigateWizardSteps)
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return {
                    generation: 6,
                }
            }

            return selector({
                currentAccount: fromJS(account),
            } as unknown as StoreState)
        })
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            helpCenter: null,
            isLoading: false,
        })

        mockUseStoreConfigurationMutation.mockReturnValue(
            defaultStoreConfigurationMutation,
        )

        mockUseSelfServiceChatChannels.mockReturnValue([])
    })

    it('should initialize store configuration with default value', () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        expect(result.current.storeFormValues).toBeDefined()
        expect(result.current.faqHelpCenters).toEqual([
            {
                id: 1,
                name: 'help center 1',
                type: 'faq',
                shop_name: 'test-shop',
            },
        ])
        expect(result.current.snippetHelpCenter).toBe(null)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle form updates correctly', () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        act(() => {
            result.current.handleFormUpdate({ helpCenterId: 2 })
        })

        expect(result.current.storeFormValues.helpCenterId).toBe(2)
    })

    it('should handle action and navigate to previous or next step', () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.NEXT_STEP)
        })
        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
        expect(mockNavigateWizardSteps.goToNextStep).toHaveBeenCalled()

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP)
        })
        expect(mockNavigateWizardSteps.goToPreviousStep).toHaveBeenCalled()
    })

    it('should handle action and navigate to the welcome page', () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.CANCEL)
        })

        expect(history.replace).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop',
        )
    })

    it('should not navigate if there is no shopType', () => {
        mockUseParams.mockReturnValue({
            shopName: 'test-shop',
        })
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.CANCEL)
        })
        expect(history.replace).not.toHaveBeenCalled()

        act(() => {
            result.current.handleAction(
                WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            )
        })
        expect(history.replace).not.toHaveBeenCalled()

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST)
        })
        expect(history.replace).not.toHaveBeenCalled()

        act(() => {
            result.current.handleAction(
                WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE,
            )
        })
        expect(history.replace).not.toHaveBeenCalled()
    })

    it('should perform nothing if handlAction is called with an unknown action', () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        act(() => {
            result.current.handleAction('unknown' as WIZARD_BUTTON_ACTIONS)
        })

        expect(history.replace).not.toHaveBeenCalled()
        expect(mockNavigateWizardSteps.goToNextStep).not.toHaveBeenCalled()
        expect(mockNavigateWizardSteps.goToPreviousStep).not.toHaveBeenCalled()
    })

    it('should handle save and navigate to the test tab', async () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Knowledge,
            }),
        )

        act(() => {
            result.current.handleSave({
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST,
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: '/app/ai-agent/shopify/test-shop/test',
                search: 'with_wizard_completed=test',
            })
        })
    })

    it('should handle save and navigate to the guidance tab', async () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Knowledge,
            }),
        )

        act(() => {
            result.current.handleSave({
                redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE,
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: '/app/ai-agent/shopify/test-shop/knowledge/guidance',
                search: 'with_wizard_completed=guidance',
            })
        })
    })

    it('should call create store configuration on save when creating', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...storeConfigurationContextMock,
            storeConfiguration: undefined,
        })

        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
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
                Promise.resolve(mockedStoreConfiguration),
            )
        })
    })

    it('should handle error if create store configuration fails', async () => {
        const mockErrorCreateStoreConfiguration = jest
            .fn()
            .mockRejectedValue(
                new Error('Failed to create AI Agent Configuration'),
            )
        mockUseStoreConfigurationMutation.mockReturnValue({
            ...defaultStoreConfigurationMutation,
            createStoreConfiguration: mockErrorCreateStoreConfiguration,
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...storeConfigurationContextMock,
            storeConfiguration: undefined,
        })

        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
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
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
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
                Promise.resolve(mockedStoreConfiguration),
            )
        })
    })

    it('should not call update store configuration if store configuration does not exist', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...storeConfigurationContextMock,
            storeConfiguration: undefined,
        })

        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
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
                new Error('Failed to save AI Agent configuration'),
            )
        mockUseStoreConfigurationMutation.mockReturnValue({
            ...defaultStoreConfigurationMutation,
            upsertStoreConfiguration: mockErrorUpdateStoreConfiguration,
        })

        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
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
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Knowledge,
            }),
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
                {
                    step: AiAgentOnboardingWizardStep.Knowledge,
                    version: AiAgentOnboardingWizardType.TwoSteps,
                    helpCenterId: 1,
                },
            )
        })
    })

    it('should not log connected help center event', async () => {
        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
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
                {
                    step: AiAgentOnboardingWizardStep.Knowledge,
                    version: AiAgentOnboardingWizardType.TwoSteps,
                    helpCenterId: 1,
                },
            )
        })
    })

    it('should navigate to next step with search params when is on wizard update', () => {
        const mockedWizardValue = {
            wizard: {
                id: 1,
                stepName: AiAgentOnboardingWizardStep.Knowledge,
                completedDatetime: null,
                stepData: {
                    enabledChannels: [],
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
            },
        }

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...storeConfigurationContextMock,
            storeConfiguration: getStoreConfigurationFixture(mockedWizardValue),
        })

        const { result } = renderHook(() =>
            useAiAgentOnboardingWizard({
                step: AiAgentOnboardingWizardStep.Personalize,
            }),
        )

        act(() => {
            result.current.handleAction(WIZARD_BUTTON_ACTIONS.NEXT_STEP)
        })
        expect(mockSetSearchParam).toHaveBeenCalledWith('true')
        expect(mockNavigateWizardSteps.goToNextStep).toHaveBeenCalled()
    })
})
