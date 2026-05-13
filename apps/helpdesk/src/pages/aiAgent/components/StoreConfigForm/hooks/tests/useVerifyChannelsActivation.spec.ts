import { act, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'

import { useVerifyChannelsActivation } from '../useVerifyChannelsActivation'

const systemTime = '2024-03-20T00:00:00.000Z'

const expectToast = async (name: string) => {
    await act(async () => undefined)
    act(() => {
        jest.advanceTimersByTime(0)
    })

    expect(screen.getByRole('status', { name })).toBeInTheDocument()
}

describe('useVerifyChannelsActivation', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(systemTime))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('when channels are not activated', () => {
        it('should not try to deactivate ai agent', () => {
            const updateStoreConfigurationMock = jest.fn()
            const updateValueMock = jest.fn()

            renderHook(() =>
                useVerifyChannelsActivation({
                    chatChannels: [],
                    emailItems: [],
                    storeConfiguration: {
                        chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
                        emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
                    } as any,
                    updateStoreConfiguration: updateStoreConfigurationMock,
                    updateValue: updateValueMock,
                }),
            )

            expect(updateStoreConfigurationMock).not.toHaveBeenCalled()
            expect(updateValueMock).not.toHaveBeenCalled()
        })
    })

    describe('when channels are activated', () => {
        describe('and both integration are still available', () => {
            it('should not try to deactivate ai agent', () => {
                const updateStoreConfigurationMock = jest.fn()
                const updateValueMock = jest.fn()

                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [
                            {
                                type: TicketChannel.Chat,
                                value: { id: 1 } as any,
                            },
                        ],
                        emailItems: [
                            { id: 1, email: 'test@test.com' },
                            { id: 2, email: 'test2@test.com' },
                        ],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: updateStoreConfigurationMock,
                        updateValue: updateValueMock,
                    }),
                )

                expect(updateStoreConfigurationMock).not.toHaveBeenCalled()
                expect(updateValueMock).not.toHaveBeenCalled()
            })
        })

        describe('and chat integration is gone', () => {
            it('should update store configuration and form values', () => {
                const updateStoreConfigurationMock = jest.fn()
                const updateValueMock = jest.fn()

                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [],
                        emailItems: [
                            { id: 1, email: 'test@test.com' },
                            { id: 2, email: 'test2@test.com' },
                        ],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: updateStoreConfigurationMock,
                        updateValue: updateValueMock,
                    }),
                )

                expect(updateStoreConfigurationMock).toHaveBeenCalledWith({
                    chatChannelDeactivatedDatetime: '2024-03-20T00:00:00.000Z',
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [
                        {
                            email: 'test@test.com',
                            id: 1,
                        },
                    ],
                })
                expect(updateValueMock).toHaveBeenCalledTimes(2)
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    1,
                    'chatChannelDeactivatedDatetime',
                    '2024-03-20T00:00:00.000Z',
                )
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    2,
                    'monitoredChatIntegrations',
                    [],
                )
            })

            it('shows a notification', async () => {
                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [],
                        emailItems: [
                            { id: 1, email: 'test@test.com' },
                            { id: 2, email: 'test2@test.com' },
                        ],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: jest
                            .fn()
                            .mockResolvedValue(undefined),
                        updateValue: jest.fn(),
                    }),
                )

                await expectToast(
                    'AI Agent for chat has been disabled, because no integration was available.',
                )
            })
        })

        describe('and email integration is gone', () => {
            it('should update store configuration and form values', () => {
                const updateStoreConfigurationMock = jest.fn()
                const updateValueMock = jest.fn()

                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [
                            {
                                type: TicketChannel.Chat,
                                value: { id: 1 },
                            } as any,
                        ],
                        emailItems: [],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: updateStoreConfigurationMock,
                        updateValue: updateValueMock,
                    }),
                )

                expect(updateStoreConfigurationMock).toHaveBeenCalledWith({
                    emailChannelDeactivatedDatetime: '2024-03-20T00:00:00.000Z',
                    chatChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [],
                })
                expect(updateValueMock).toHaveBeenCalledTimes(2)
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    1,
                    'emailChannelDeactivatedDatetime',
                    '2024-03-20T00:00:00.000Z',
                )
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    2,
                    'monitoredEmailIntegrations',
                    [],
                )
            })

            it('shows a notification', async () => {
                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [
                            {
                                type: TicketChannel.Chat,
                                value: { id: 1 },
                            } as any,
                        ],
                        emailItems: [],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: jest
                            .fn()
                            .mockResolvedValue(undefined),
                        updateValue: jest.fn(),
                    }),
                )

                await expectToast(
                    'AI Agent for email has been disabled, because no integration was available.',
                )
            })
        })

        describe('and both integrations are gone', () => {
            it('should update store configuration and form values', () => {
                const updateStoreConfigurationMock = jest.fn()
                const updateValueMock = jest.fn()

                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [],
                        emailItems: [],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: updateStoreConfigurationMock,
                        updateValue: updateValueMock,
                    }),
                )

                expect(updateStoreConfigurationMock).toHaveBeenCalledWith({
                    emailChannelDeactivatedDatetime: '2024-03-20T00:00:00.000Z',
                    chatChannelDeactivatedDatetime: '2024-03-20T00:00:00.000Z',
                    monitoredChatIntegrations: [],
                    monitoredEmailIntegrations: [],
                })
                expect(updateValueMock).toHaveBeenCalledTimes(4)
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    1,
                    'chatChannelDeactivatedDatetime',
                    '2024-03-20T00:00:00.000Z',
                )
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    2,
                    'monitoredChatIntegrations',
                    [],
                )
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    3,
                    'emailChannelDeactivatedDatetime',
                    '2024-03-20T00:00:00.000Z',
                )
                expect(updateValueMock).toHaveBeenNthCalledWith(
                    4,
                    'monitoredEmailIntegrations',
                    [],
                )
            })

            it('shows a notification', async () => {
                renderHook(() =>
                    useVerifyChannelsActivation({
                        chatChannels: [],
                        emailItems: [],
                        storeConfiguration: {
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                            monitoredChatIntegrations: [1],
                            monitoredEmailIntegrations: [
                                {
                                    email: 'test@test.com',
                                    id: 1,
                                },
                            ],
                        } as any,
                        updateStoreConfiguration: jest
                            .fn()
                            .mockResolvedValue(undefined),
                        updateValue: jest.fn(),
                    }),
                )

                await expectToast(
                    'AI Agent for email and chat has been disabled, because no integration was available.',
                )
            })
        })
    })
})
