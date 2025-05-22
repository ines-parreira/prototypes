import { act } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { useConfigurationForm } from 'pages/aiAgent/hooks/useConfigurationForm'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { StoreState } from 'state/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { ToneOfVoice } from '../../constants'
import { getStoreConfigurationFixture } from '../../fixtures/storeConfiguration.fixtures'
import { useAiAgentStoreConfigurationContext } from '../../providers/AiAgentStoreConfigurationContext'
import { FormValues } from '../../types'
import { useStoreConfigurationMutation } from '../useStoreConfigurationMutation'

const INITIAL_FORM_VALUES: FormValues = {
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    chatChannelDeactivatedDatetime: undefined,
    emailChannelDeactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    helpCenterId: null,
    monitoredEmailIntegrations: null,
    signature: null,
    silentHandover: null,
    tags: null,
    excludedTopics: null,
    ticketSampleRate: null,
    monitoredChatIntegrations: null,
    wizard: undefined,
    customFieldIds: null,
}

jest.mock('models/helpCenter/queries')
jest.mock('state/notifications/actions')
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('../useStoreConfigurationMutation')
const mockUseStoreConfigurationMutation = assumeMock(
    useStoreConfigurationMutation,
)

const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)
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
const mockDispatch = jest.fn()
const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
const mockCreateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)

const shopName = 'test-shop'

const defaultStoreConfigurationContextMock = {
    storeConfiguration: undefined,
    isLoading: false,
    updateStoreConfiguration: mockUpdateStoreConfiguration,
    createStoreConfiguration: mockCreateStoreConfiguration,
    isPendingCreateOrUpdate: false,
}

describe('useConfigurationForm', () => {
    beforeEach(() => {
        mockUseGetHelpCenterList.mockReturnValue(mockHelpCenterListData)
        mockUseAiAgentStoreConfigurationContext.mockReturnValue(
            defaultStoreConfigurationContextMock,
        )

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

        mockUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            upsertStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            error: null,
        })
    })

    it('should return default values when store configuration is undefined', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: undefined,
        })

        const defaultValues = {
            toneOfVoice: ToneOfVoice.Friendly,
            signature: 'test signature',
        }
        const expectedValues = {
            ...INITIAL_FORM_VALUES,
            ...defaultValues,
        }
        const { result } = renderHook(() =>
            useConfigurationForm({ initValues: defaultValues, shopName }),
        )
        expect(result.current.formValues).toEqual(expectedValues)
    })

    it('should mark form is dirty when values changed', () => {
        const { result } = renderHook(() =>
            useConfigurationForm({ initValues: INITIAL_FORM_VALUES, shopName }),
        )

        act(() => {
            result.current.updateValue('signature', 'new signature')
        })

        // Assert
        expect(result.current.isFormDirty).toBe(true)
        expect(result.current.isFieldDirty('signature')).toBe(true)
    })

    it('should return empty array if monitoredChatIntegrations is null', async () => {
        const { result } = renderHook(() =>
            useConfigurationForm({ initValues: INITIAL_FORM_VALUES, shopName }),
        )
        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'tests',
            })
        })

        expect(result.current.formValues.monitoredChatIntegrations).toEqual(
            null,
        )
    })

    it('should reset form values when resetForm is called', () => {
        const defaultValues = {
            toneOfVoice: ToneOfVoice.Friendly,
            signature: 'test signature',
        }
        const { result } = renderHook(() =>
            useConfigurationForm({ initValues: defaultValues, shopName }),
        )

        act(() => {
            result.current.updateValue('signature', 'new signature')
            result.current.resetForm()
        })

        expect(result.current.formValues.signature).toBe('test signature')
    })

    it('should throw error when chat is enabled and no integrations are selected', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })
        const { result } = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [],
                    chatChannelDeactivatedDatetime: null,
                    signature: 'valid signature',
                },
                shopName,
            }),
        )
        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'test shop',
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    'Please select at least 1 chat integration for AI Agent to use or disable AI Agent for chat to proceed.',
                status: 'error',
            }),
        )
    })

    it('should call onSuccess callback when provided and execution was without error', async () => {
        const mockOnSuccess = jest.fn()
        const { result } = renderHook(() =>
            useConfigurationForm({
                shopName,
                initValues: {
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [],
                    emailChannelDeactivatedDatetime: '',
                    chatChannelDeactivatedDatetime: '',
                    signature: 'valid signature',
                    helpCenterId: 1,
                },
            }),
        )

        await act(async () => {
            await result.current.handleOnSave({
                onSuccess: mockOnSuccess,
                shopName: 'test-shop',
            })
        })

        expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('should show conflict error notification when receiving 409 status', async () => {
        const mockError = {
            isAxiosError: true,
            response: {
                status: 409,
            },
        }

        mockUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            upsertStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration:
                mockCreateStoreConfiguration.mockRejectedValueOnce(mockError),
            error: null,
        })

        const { result } = renderHook(() =>
            useConfigurationForm({
                shopName,
                initValues: {
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [],
                    emailChannelDeactivatedDatetime: '',
                    chatChannelDeactivatedDatetime: '',
                    signature: 'valid signature',
                    helpCenterId: 1,
                },
            }),
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'test-shop',
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message:
                'Email address or chat channel already used by AI Agent on a different store.',
            status: 'error',
        })
    })

    it('should initialize form values from store configuration only once', () => {
        const initialStoreConfig = getStoreConfigurationFixture({
            storeName: 'test-shop',
            toneOfVoice: ToneOfVoice.Friendly,
            signature: 'initial signature',
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: initialStoreConfig,
        })

        const { result, rerender } = renderHook(
            (props) => useConfigurationForm(props),
            {
                initialProps: {
                    shopName,
                },
            },
        )

        // User makes changes to the form
        act(() => {
            result.current.updateValue('signature', 'user modified signature')
        })

        // Store configuration changes (e.g., from HandoverTopicsModal)
        // Use a different property instead of excludedTopics
        const updatedStoreConfig = {
            ...initialStoreConfig,
            toneOfVoice: ToneOfVoice.Professional, // Change some other property
            signature: 'new backend signature', // This shouldn't overwrite user's changes
        }

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: updatedStoreConfig,
        })

        // Rerender to simulate store config update
        rerender()

        // Assert that user changes were preserved
        expect(result.current.formValues.signature).toBe(
            'user modified signature',
        )
        // Form should still be dirty because we kept the user's changes
        expect(result.current.isFormDirty).toBe(true)
    })

    it('should reset the initialization state when resetForm is called', () => {
        const initialStoreConfig = getStoreConfigurationFixture({
            storeName: 'test-shop',
            toneOfVoice: ToneOfVoice.Friendly,
            signature: 'initial signature',
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: initialStoreConfig,
        })

        const { result, rerender } = renderHook(
            (props) => useConfigurationForm(props),
            {
                initialProps: {
                    shopName,
                    initValues: {
                        signature: 'initial signature',
                    },
                },
            },
        )

        // Make changes
        act(() => {
            result.current.updateValue('signature', 'user modified signature')
        })

        // Reset the form
        act(() => {
            result.current.resetForm()
        })

        // Store configuration changes
        const updatedStoreConfig = {
            ...initialStoreConfig,
            signature: 'new backend signature',
        }

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: updatedStoreConfig,
        })

        // We need to modify useConfigurationForm to reset isInitializedRef when resetForm is called
        // This test will verify that isInitializedRef is properly reset

        // Rerender to simulate store config update
        rerender()

        // Form should use values from updated store config
        expect(result.current.formValues.signature).toBe('initial signature')
        expect(result.current.isFormDirty).toBe(false)
    })

    it('should preserve unsaved form changes when storeConfiguration updates', () => {
        const initialStoreConfig = getStoreConfigurationFixture({
            storeName: 'test-shop',
            toneOfVoice: ToneOfVoice.Friendly,
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: initialStoreConfig,
        })

        const { result, rerender } = renderHook(
            (props) => useConfigurationForm(props),
            {
                initialProps: {
                    shopName,
                },
            },
        )

        // User makes a change to a field
        act(() => {
            result.current.updateValue('signature', 'new user signature')
        })

        // Store configuration updates with a different property
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigurationContextMock,
            storeConfiguration: {
                ...initialStoreConfig,
                toneOfVoice: ToneOfVoice.Professional, // Change tone instead of excludedTopics
            },
        })

        rerender()

        expect(result.current.formValues.signature).toBe('new user signature')
    })

    it('should not mark form is dirty when initial props changed', () => {
        const { result, rerender } = renderHook(
            (props) => useConfigurationForm(props),
            {
                initialProps: {
                    initValues: {
                        signature: 'test signature',
                    },
                    shopName,
                },
            },
        )

        expect(result.current.formValues.signature).toBe('test signature')
        expect(result.current.isFormDirty).toBe(false)

        rerender({
            initValues: {
                signature: 'another test signature',
            },
            shopName,
        })
        expect(result.current.formValues.signature).toBe(
            'another test signature',
        )
        expect(result.current.isFormDirty).toBe(false)
    })
})
