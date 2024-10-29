import {renderHook, act} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import {account} from 'fixtures/account'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {StoreState} from 'state/types'

import {FeatureFlagKey} from '../../../../../config/featureFlags'
import {axiosSuccessResponse} from '../../../../../fixtures/axiosResponse'
import useAppSelector from '../../../../../hooks/useAppSelector'
import {StoreConfiguration} from '../../../../../models/aiAgent/types'
import {useGetHelpCenterList} from '../../../../../models/helpCenter/queries'
import {notify} from '../../../../../state/notifications/actions'
import {assumeMock} from '../../../../../utils/testing'
import {ToneOfVoice} from '../../constants'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import {FormValues} from '../../types'
import {useStoreConfigurationMutation} from '../useStoreConfigurationMutation'

const INITIAL_FORM_VALUES: FormValues = {
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    chatChannelDeactivatedDatetime: undefined,
    emailChannelDeactivatedDatetime: undefined,
    deactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    excludedTopics: null,
    helpCenterId: null,
    monitoredEmailIntegrations: null,
    signature: null,
    silentHandover: null,
    tags: null,
    ticketSampleRate: null,
    monitoredChatIntegrations: null,
    wizard: undefined,
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
    useStoreConfigurationMutation
)

const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext
)
const mockHelpCenterListData = {
    data: axiosSuccessResponse({
        data: [
            {id: 1, name: 'help center 1', type: 'faq', shop_name: 'test-shop'},
            {id: 2, name: 'help center 2', type: 'faq'},
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
            defaultStoreConfigurationContextMock
        )

        mockUseAppSelector.mockImplementation((selector) =>
            selector({
                currentAccount: fromJS(account),
            } as unknown as StoreState)
        )

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
        // Act
        const {result} = renderHook(() =>
            useConfigurationForm({initValues: defaultValues, shopName})
        )
        // Assert
        expect(result.current.formValues).toEqual(expectedValues)
    })

    it('should mark form is dirty when values changed', () => {
        const {result} = renderHook(() =>
            useConfigurationForm({initValues: INITIAL_FORM_VALUES, shopName})
        )

        act(() => {
            result.current.updateValue('signature', 'new signature')
        })

        // Assert
        expect(result.current.isFormDirty).toBe(true)
        expect(result.current.isFieldDirty('signature')).toBe(true)
    })

    it('should return empty array if monitoredChatIntegrations is null', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({initValues: INITIAL_FORM_VALUES, shopName})
        )
        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'tests',
            })
        })

        expect(result.current.formValues.monitoredChatIntegrations).toEqual(
            null
        )
    })

    it('should reset form values when resetForm is called', () => {
        const defaultValues = {
            toneOfVoice: ToneOfVoice.Friendly,
            signature: 'test signature',
        }
        const {result} = renderHook(() =>
            useConfigurationForm({initValues: defaultValues, shopName})
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
            [FeatureFlagKey.AiAgentMultiChannelEnablement]: false,
        })
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [],
                    deactivatedDatetime: null,
                    signature: 'valid signature',
                },
                shopName,
            })
        )
        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'test shop',
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'At least one channel must be selected.',
                status: 'error',
            })
        )
    })

    it('should call onSuccess callback when provided and execution was without error', async () => {
        const mockOnSuccess = jest.fn()
        const {result} = renderHook(() =>
            useConfigurationForm({
                shopName,
                initValues: {
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [],
                    deactivatedDatetime: '',
                    emailChannelDeactivatedDatetime: '',
                    chatChannelDeactivatedDatetime: '',
                    signature: 'valid signature',
                    helpCenterId: 1,
                },
            })
        )

        await act(async () => {
            await result.current.handleOnSave({
                onSuccess: mockOnSuccess,
                shopName: 'test-shop',
            })
        })

        expect(mockOnSuccess).toHaveBeenCalled()
    })
})
