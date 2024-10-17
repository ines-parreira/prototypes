import {renderHook, act} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import {fromJS} from 'immutable'
import {account} from 'fixtures/account'
import {StoreState} from 'state/types'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {
    DEFAULT_WIZARD_FORM_VALUES,
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
} from '../../constants'
import {FormValues} from '../../types'
import {assumeMock} from '../../../../../utils/testing'
import {useGetHelpCenterList} from '../../../../../models/helpCenter/queries'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import {axiosSuccessResponse} from '../../../../../fixtures/axiosResponse'
import {StoreConfiguration} from '../../../../../models/aiAgent/types'
import {notify} from '../../../../../state/notifications/actions'
import {FeatureFlagKey} from '../../../../../config/featureFlags'
import useAppSelector from '../../../../../hooks/useAppSelector'
import {useStoreConfigurationMutation} from '../useStoreConfigurationMutation'

const INITIAL_FORM_VALUES: FormValues = {
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    chatChannelDeactivatedDatetime: undefined,
    emailChannelDeactivatedDatetime: undefined,
    deactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
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

    it('should throw error when signature is null', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {...INITIAL_FORM_VALUES, signature: null},
                shopName,
            })
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'tests',
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Signature can not be empty',
            status: 'error',
        })
    })

    it('should throw error when signature is null in wizard page', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    ...INITIAL_FORM_VALUES,
                    signature: null,
                    wizard: {
                        ...DEFAULT_WIZARD_FORM_VALUES,
                        completedDatetime: new Date().toISOString(),
                    },
                },
                shopName,
            })
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'tests',
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'One or more required fields not filled.',
            status: 'error',
        })
    })

    it('should throw error when signature is empty', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {...INITIAL_FORM_VALUES, signature: ''},
                shopName,
            })
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'tests',
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Signature can not be empty',
            status: 'error',
        })
    })

    it('should throw error when no help center and public links', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    ...INITIAL_FORM_VALUES,
                    monitoredEmailIntegrations: [],
                    monitoredChatIntegrations: [],
                    signature: 'signature',
                    helpCenterId: null,
                },
                shopName,
            })
        )
        await act(async () => {
            await result.current.handleOnSave({
                shopName: shopName,
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Select a Help Center or add at least one public URL',
            status: 'error',
        })
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

    it('should handle custom tone of voice validation', async () => {
        const customValues = {
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: '',
            signature: 'valid signature',
        }

        const {result} = renderHook(() =>
            useConfigurationForm({initValues: customValues, shopName})
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'test shop',
                payload: {
                    ...customValues,
                },
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Custom tone of voice cannot be empty',
                status: 'error',
            })
        )
    })

    it('should validate excluded topics length', async () => {
        const excludedTopics = new Array(MAX_EXCLUDED_TOPICS + 1).fill(
            'Test topic'
        )

        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    excludedTopics,
                    signature: 'valid signature',
                },
                shopName,
            })
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'test shop',
                payload: {
                    excludedTopics,
                },
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: `Excluded topics must be less than ${MAX_EXCLUDED_TOPICS}`,
                status: 'error',
            })
        )
    })

    it('should throw error when signature exceeds max length', async () => {
        const longSignature = 'a'.repeat(SIGNATURE_MAX_LENGTH + 1)
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    signature: longSignature,
                },
                shopName,
            })
        )

        await act(async () => {
            await result.current.handleOnSave({
                shopName: 'test shop',
                payload: {
                    signature: longSignature,
                },
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`,
                status: 'error',
            })
        )
    })

    it('should throw error when excluded topic is empty', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    excludedTopics: [''],
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
                message: 'Excluded topic cannot be empty',
                status: 'error',
            })
        )
    })

    it('should throw error when excluded topic exceeds max length', async () => {
        const longExcludedTopic = 'a'.repeat(EXCLUDED_TOPIC_MAX_LENGTH + 1)
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    excludedTopics: [longExcludedTopic],
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
                message: `Excluded topics must be less than ${EXCLUDED_TOPIC_MAX_LENGTH} characters`,
                status: 'error',
            })
        )
    })

    it('should throw error when tags are empty', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    tags: [{name: '', description: ''}],
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
                message: 'Tags must have a name and description',
                status: 'error',
            })
        )
    })

    it('should throw error when chat is enabled and no integrations are selected', async () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
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

    it('should throw error when there is no channel selected in wizard', async () => {
        const {result} = renderHook(() =>
            useConfigurationForm({
                initValues: {
                    ...INITIAL_FORM_VALUES,
                    toneOfVoice: ToneOfVoice.Friendly,
                    signature: 'Initial signature',
                    wizard: {
                        ...DEFAULT_WIZARD_FORM_VALUES,
                        enabledChannels: [],
                        completedDatetime: new Date().toISOString(),
                    },
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
})
