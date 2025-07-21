import { act, waitFor } from '@testing-library/react'

import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import {
    getAvailableChats,
    getFirstAvailableChat,
} from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatSettingsComponent.utils'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { renderHook } from 'utils/testing/renderHook'

import {
    HandoverCustomizationFormType,
    useHandoverCustomizationChatSettings,
} from '../useHandoverCustomizationChatSettings'

// Mock the useSelfServiceChatChannels hook
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatSettingsComponent.utils',
)

jest.mock('pages/aiAgent/providers/AiAgentFormChangesContext')

describe('useHandoverCustomizationChatSettings', () => {
    const mockChatChannels = [
        {
            value: { id: 1, name: 'Chat 1' },
        },
        {
            value: { id: 2, name: 'Chat 2' },
        },
        {
            value: { id: 3, name: 'Chat 3' },
        },
        {
            value: { id: 4, name: 'Chat 4' },
        },
        {
            value: { id: 5, name: 'Chat 5' },
        },
    ] as SelfServiceChatChannel[]

    const mockedMonitoredChatIntegrationIds = [1, 2, 3]

    const defaultProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrationIds: mockedMonitoredChatIntegrationIds,
    }

    const mockedHookContext = {
        isFormDirty: false,
        setIsFormDirty: jest.fn(),
        setActionCallback: jest.fn(),
        dirtySections: [],
        onModalSave: jest.fn(),
        onModalDiscard: jest.fn(),
        onLeaveContext: jest.fn(),
    }
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )
        ;(getAvailableChats as jest.Mock).mockReturnValue(mockChatChannels)
        ;(getFirstAvailableChat as jest.Mock).mockReturnValue(
            mockChatChannels[0],
        )
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue(
            mockedHookContext,
        )
    })

    describe('chat selection', () => {
        it('should initialize with no chat selected when there is no available chats', () => {
            ;(getAvailableChats as jest.Mock).mockReturnValue([])
            ;(getFirstAvailableChat as jest.Mock).mockReturnValue(undefined)

            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            expect(result.current.availableChats).toEqual([])
            expect(result.current.selectedChat).toBeUndefined()
        })

        it('should initialize with the first available chat selected', () => {
            ;(getAvailableChats as jest.Mock).mockReturnValue(mockChatChannels)
            ;(getFirstAvailableChat as jest.Mock).mockReturnValue(
                mockChatChannels[0],
            )

            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            expect(result.current.availableChats).toEqual(mockChatChannels)
            expect(result.current.selectedChat).toEqual(mockChatChannels[0])
        })

        it('should handle chat selection change correctly when the chat is changed with none handover section dirty', () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            act(() => {
                result.current.onSelectedChatChange(2)
            })

            expect(result.current.availableChats).toEqual(mockChatChannels)
            expect(result.current.selectedChat).toEqual(mockChatChannels[1])
        })
    })

    describe('settings section management', () => {
        it('should initialize disabled when there is no available chats', () => {
            ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([])
            ;(getAvailableChats as jest.Mock).mockReturnValue([])
            ;(getFirstAvailableChat as jest.Mock).mockReturnValue(undefined)

            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            expect(result.current.isHandoverSectionDisabled).toBeTruthy()
        })

        it('should initialize disabled when there is no monitored chat integrations', () => {
            ;(getFirstAvailableChat as jest.Mock).mockReturnValue(undefined)

            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings({
                    ...defaultProps,
                    monitoredChatIntegrationIds: [],
                }),
            )

            expect(result.current.isHandoverSectionDisabled).toBeTruthy()
            expect(result.current.isSelectedChatAvailabilityOffline).toBeFalsy()
        })
        it('should initialize with all settings sections closed but not disabled', () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            expect(result.current.activeSettingsSection).toBeNull()
            expect(result.current.isHandoverSectionDisabled).toBeFalsy()
        })

        test.each([
            HandoverCustomizationFormType.OFFLINE_SETTINGS,
            HandoverCustomizationFormType.ONLINE_SETTINGS,
            HandoverCustomizationFormType.FALLBACK_SETTINGS,
        ])('should handle settings section change to %s', (section) => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            act(() => {
                result.current.onActiveSettingsSectionChange(section)
            })

            expect(result.current.activeSettingsSection).toBe(section)
        })
        it('should disable settings and remove active section when the list of monitored chat integrations changes to empty', async () => {
            const props = { ...defaultProps }

            const { result, rerender } = renderHook(() =>
                useHandoverCustomizationChatSettings(props),
            )

            act(() => {
                result.current.onActiveSettingsSectionChange(
                    HandoverCustomizationFormType.OFFLINE_SETTINGS,
                )
            })

            expect(result.current.activeSettingsSection).toBe(
                HandoverCustomizationFormType.OFFLINE_SETTINGS,
            )

            expect(result.current.isHandoverSectionDisabled).toBeFalsy()

            // change the list of available chats to empty return empty array
            ;(getAvailableChats as jest.Mock).mockReturnValue([])

            props.monitoredChatIntegrationIds = []

            rerender()

            await waitFor(() => {
                expect(result.current.activeSettingsSection).toBeNull()
                expect(result.current.isHandoverSectionDisabled).toBeTruthy()
            })
        })

        test.each([
            StoreConfigFormSection.handoverCustomizationOfflineSettings,
            StoreConfigFormSection.handoverCustomizationOnlineSettings,
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
        ])(
            'should trigger onLeaveContext when the chat is changed with a %s section dirty',
            (section) => {
                let callbackObject = {
                    onDiscard: jest.fn(),
                }

                const mockLeaveContext = jest
                    .fn()
                    .mockImplementation((args) => {
                        callbackObject = args
                    })

                ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
                    ...mockedHookContext,
                    dirtySections: [section],
                    isFormDirty: true,
                    onLeaveContext: mockLeaveContext,
                })

                const { result } = renderHook(() =>
                    useHandoverCustomizationChatSettings(defaultProps),
                )

                act(() => {
                    result.current.onSelectedChatChange(2)
                })

                expect(mockLeaveContext).toHaveBeenCalled()

                // nothing should change until the modal is resolved
                expect(result.current.availableChats).toEqual(mockChatChannels)
                expect(result.current.selectedChat).toEqual(mockChatChannels[0])

                act(() => {
                    // trigger the onDiscard callback
                    callbackObject.onDiscard()
                })

                expect(result.current.availableChats).toEqual(mockChatChannels)
                expect(result.current.selectedChat).toEqual(mockChatChannels[1])
            },
        )
    })
    describe('chat list updates', () => {
        it('should update to first available chat when available chats change and remove the previous selected chat from the list', () => {
            const props = { ...defaultProps }
            const { result, rerender } = renderHook(() =>
                useHandoverCustomizationChatSettings(props),
            )

            // Initial state check
            expect(result.current.selectedChat).toBe(mockChatChannels[0])

            // Update monitored chats to exclude current selection
            props.monitoredChatIntegrationIds = [2, 3]
            ;(getAvailableChats as jest.Mock).mockReturnValue([
                mockChatChannels[1],
                mockChatChannels[2],
                mockChatChannels[3],
                mockChatChannels[4],
            ])
            ;(getFirstAvailableChat as jest.Mock).mockReturnValue(
                mockChatChannels[1],
            )

            rerender()

            // Should select the first available chat from new list
            expect(result.current.selectedChat).toBe(mockChatChannels[1])
        })

        it('should keep the selected chat when the list changes but contains the previous selected chat', () => {
            const props = { ...defaultProps }
            const { result, rerender } = renderHook(() =>
                useHandoverCustomizationChatSettings(props),
            )

            // Initial state check
            expect(result.current.selectedChat).toBe(mockChatChannels[0])

            // Update monitored chats to exclude current selection
            props.monitoredChatIntegrationIds = [2, 3]
            ;(getAvailableChats as jest.Mock).mockReturnValue([
                mockChatChannels[0],
                mockChatChannels[2],
                mockChatChannels[3],
                mockChatChannels[4],
            ])

            // change the first available chat forced to validate the test
            ;(getFirstAvailableChat as jest.Mock).mockReturnValue(
                mockChatChannels[1],
            )

            rerender()

            // Should select the first available chat from new list
            expect(result.current.selectedChat).toBe(mockChatChannels[0])
        })
    })
    describe('offline chat', () => {
        it('should return isSelectedChatAvailabilityOffline true when the chat is previously set as offline', () => {
            const offlineChat = {
                ...mockChatChannels[0],
                value: {
                    ...mockChatChannels[0].value,
                    meta: {
                        ...mockChatChannels[0].value.meta,
                        preferences: {
                            live_chat_availability:
                                GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
                        },
                    },
                },
            }
            ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([
                offlineChat,
            ])

            const { result } = renderHook(() =>
                useHandoverCustomizationChatSettings(defaultProps),
            )

            expect(
                result.current.isSelectedChatAvailabilityOffline,
            ).toBeTruthy()
        })

        test.each([
            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        ])(
            'should return isSelectedChatAvailabilityOffline false when the chat is previously set as %s',
            (availability) => {
                const chat = {
                    ...mockChatChannels[0],
                    value: {
                        ...mockChatChannels[0].value,
                        meta: {
                            ...mockChatChannels[0].value.meta,
                            preferences: {
                                live_chat_availability: availability,
                            },
                        },
                    },
                }
                ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([
                    chat,
                ])

                const { result } = renderHook(() =>
                    useHandoverCustomizationChatSettings(defaultProps),
                )

                expect(
                    result.current.isSelectedChatAvailabilityOffline,
                ).toBeFalsy()
            },
        )
    })
})
