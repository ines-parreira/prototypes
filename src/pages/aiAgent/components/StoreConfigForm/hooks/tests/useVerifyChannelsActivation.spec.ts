import { waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { notify } from 'state/notifications/actions'
import { renderHook } from 'utils/testing/renderHook'

import { useVerifyChannelsActivation } from '../useVerifyChannelsActivation'

jest.mock('state/notifications/actions')

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const systemTime = '2024-03-20T00:00:00.000Z'

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

            it('should dispatch notification', async () => {
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
                        updateStoreConfiguration: jest.fn(),
                        updateValue: jest.fn(),
                    }),
                )

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalled()
                    expect(notify).toHaveBeenCalledWith({
                        message:
                            'AI Agent for chat has been disabled, because no integration was available.',
                        status: 'warning',
                    })
                })
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

            it('should dispatch notification', async () => {
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
                        updateStoreConfiguration: jest.fn(),
                        updateValue: jest.fn(),
                    }),
                )

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalled()
                    expect(notify).toHaveBeenCalledWith({
                        message:
                            'AI Agent for email has been disabled, because no integration was available.',
                        status: 'warning',
                    })
                })
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

            it('should dispatch notification', async () => {
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
                        updateStoreConfiguration: jest.fn(),
                        updateValue: jest.fn(),
                    }),
                )

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalled()
                    expect(notify).toHaveBeenCalledWith({
                        message:
                            'AI Agent for email and chat has been disabled, because no integration was available.',
                        status: 'warning',
                    })
                })
            })
        })
    })
})
