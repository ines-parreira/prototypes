import { useKnockClient } from '@knocklabs/react'
import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { submitSetting } from 'state/currentUser/actions'

import { categories, notifications } from '../../data'
import useSettings from '../useSettings'

jest.mock('@knocklabs/react', () => ({
    useKnockClient: jest.fn(),
}))
const mockUseKnockClient = useKnockClient as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))
const variationMock = require('@repo/feature-flags').getLDClient()
    .variation as jest.Mock

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/currentUser/actions')
const useAppDispatchMock = useAppDispatch as jest.Mock
const submitSettingMock = submitSetting as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('../../data', () => ({
    ...jest.requireActual<typeof import('../../data')>('../../data'),
    categories: [
        {
            type: 'ticket-updates',
            label: 'Ticket updates',
            description: 'Get notified when one of these events happen:',
            typeLabel: 'Event',
            notifications: ['user.mentioned'],
        },
        {
            type: 'empty-category',
            label: 'Empty category',
            description: 'Category to test a category with no notifications',
            typeLabel: 'Event',
        },
    ],
    notifications: {
        'user.mentioned': {
            type: 'user.mentioned',
            component: () => null,
            workflow: 'user-mentioned',
            settings: {
                type: 'ticket-updates',
                label: 'Mentioned in an internal note',
            },
        },
    },
}))

const notificationPreferences = {
    data: {
        notification_sound: {
            enabled: false,
            volume: 7,
            sound: 'default',
        },
        events: {
            'user.mentioned': {
                sound: 'definite',
            },
            'ticket.snooze-expired': {
                sound: 'definite',
            },
            'ticket.assigned': {
                sound: 'definite',
            },
        },
    },
}

const mockGetKnockPreferences = jest.fn()
const mockSetKnockPreferences = jest.fn()

const notificationsWithSettings = categories
    .reduce((acc, c) => [...acc, ...(c.notifications || [])], [] as string[])
    .map((n) => notifications[n])

describe('useSettings', () => {
    beforeEach(() => {
        variationMock.mockImplementation(() => true)
        mockUseKnockClient.mockReturnValue({
            user: {
                identify: jest.fn(),
                getPreferences: mockGetKnockPreferences,
                setPreferences: mockSetKnockPreferences,
            },
        })
        mockGetKnockPreferences.mockReturnValue({
            workflows: {},
        })
        useAppSelectorMock.mockReturnValue(notificationPreferences)
        useAppDispatchMock.mockReturnValue(jest.fn())
    })

    it('should return expected properties', async () => {
        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            expect(result.current).toHaveProperty('save')
            expect(result.current).toHaveProperty('settings')
            expect(result.current).toHaveProperty('onChangeChannel')
            expect(result.current).toHaveProperty('onChangeSound')
            expect(result.current).toHaveProperty('onChangeVolume')
        })
    })

    it.each(notificationsWithSettings.map((config) => [config.type]))(
        'should include %s event',
        async (notificationType) => {
            const { result } = renderHook(() => useSettings())

            await waitFor(() => {
                expect(
                    result.current.settings.events[notificationType],
                ).toBeDefined()
            })
        },
    )

    it('should update settings according to knock-returned workflow preferences', async () => {
        mockGetKnockPreferences.mockResolvedValue({
            workflows: {
                'user-mentioned': {
                    channel_types: { in_app_feed: true },
                },
            },
        })

        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            expect(
                result.current.settings.events['user.mentioned'].channels,
            ).toEqual({
                in_app_feed: true,
            })
        })
    })

    it('should default to true if workflow preferences are conditional', async () => {
        mockGetKnockPreferences.mockResolvedValue({
            workflows: {
                'user-mentioned': {
                    conditions: [
                        {
                            argument: 'arg',
                            variable: 'var',
                            operator: 'eq',
                        },
                    ],
                },
            },
        })

        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            expect(
                result.current.settings.events['user.mentioned'].channels,
            ).toEqual({
                in_app_feed: true,
            })
        })
    })

    it('should update settings when handleChangeChannel is called', async () => {
        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            expect(result.current.settings).toBeDefined()
        })

        act(() => {
            result.current.onChangeChannel(
                'user.mentioned',
                'in_app_feed',
                false,
            )
        })

        await waitFor(() => {
            expect(
                result.current.settings.events['user.mentioned'].channels[
                    'in_app_feed'
                ],
            ).toBe(false)
        })
    })

    it('should update settings when handleChangeSound is called', async () => {
        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            result.current.onChangeSound('user.mentioned', 'definite')
        })

        await waitFor(() => {
            expect(result.current.settings.events['user.mentioned'].sound).toBe(
                'definite',
            )
        })
    })

    it('should update settings when handleChangeVolume is called', async () => {
        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            expect(result.current.settings).toBeDefined()
        })

        act(() => {
            result.current.onChangeVolume(10)
        })

        await waitFor(() => {
            expect(result.current.settings.volume).toBe(10)
        })
    })

    it('should save settings when save is called', async () => {
        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            result.current.onChangeSound('user.mentioned', 'definite')
        })

        await waitFor(() => {
            result.current.save()
        })

        await waitFor(() => {
            expect(mockSetKnockPreferences).toHaveBeenCalled()
            expect(submitSettingMock).toHaveBeenCalledWith(
                {
                    data: {
                        events: { 'user.mentioned': { sound: 'definite' } },
                        notification_sound: {
                            enabled: false,
                            sound: 'default',
                            volume: 7,
                        },
                    },
                    id: undefined,
                    type: 'notification-preferences',
                },
                true,
            )
        })
    })

    it('should preserve other workflow channels when saving', async () => {
        mockGetKnockPreferences.mockResolvedValue({
            workflows: {
                'user-mentioned': {
                    channel_types: { push: true },
                },
            },
        })

        const { result } = renderHook(() => useSettings())

        await waitFor(() => {
            expect(
                Object.keys(result.current.settings.events).length,
            ).toBeGreaterThan(0)
        })

        act(() => {
            result.current.onChangeChannel(
                'user.mentioned',
                'in_app_feed',
                true,
            )
        })

        await act(async () => {
            await result.current.save()
        })

        await waitFor(() => {
            expect(mockSetKnockPreferences).toHaveBeenCalledWith({
                categories: {},
                channel_types: {},
                workflows: {
                    'user-mentioned': {
                        channel_types: {
                            in_app_feed: true,
                            push: true,
                        },
                    },
                },
            })
        })
    })
})
