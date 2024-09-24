import {renderHook, act} from '@testing-library/react-hooks'
import {useKnockClient} from '@knocklabs/react'
import {waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {useFlag} from 'common/flags'
import {submitSetting} from 'state/currentUser/actions'
import {FeatureFlagKey} from 'config/featureFlags'
import {RootState, StoreDispatch} from 'state/types'
import {getLDClient} from 'utils/launchDarkly'
import {ticketMessageCreatedEvents} from 'common/notifications/data'

import useSettings from '../useSettings'

jest.mock('@knocklabs/react', () => ({
    useKnockClient: jest.fn(),
}))
const mockUseKnockClient = useKnockClient as jest.Mock

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/currentUser/actions')
const useAppDispatchMock = useAppDispatch as jest.Mock
const submitSettingMock = submitSetting as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

const notificationPreferences = {
    data: {
        notification_sound: {
            enabled: true,
            volume: 7,
            sound: 'custom-sound',
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
            'ticket-message.created': {
                sound: 'custom-sound',
            },
        },
    },
}

const mockGetKnockPreferences = jest.fn()
const mockSetKnockPreferences = jest.fn()

const mockFlagSet = {
    [FeatureFlagKey.NotificationsTicketMessageCreated]: true,
}

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

describe('useSettings', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(
            (featureFlag: keyof typeof mockFlagSet) => {
                return mockFlagSet[featureFlag]
            }
        )
        variationMock.mockImplementation(() => true)
        mockUseKnockClient.mockReturnValue({
            user: {identify: jest.fn()},
            preferences: {
                get: mockGetKnockPreferences,
                set: mockSetKnockPreferences,
            },
        })
        mockGetKnockPreferences.mockReturnValue({
            workflows: {},
        })
        useAppSelectorMock.mockReturnValue(notificationPreferences)
        useAppDispatchMock.mockReturnValue(jest.fn())
    })

    it('should return expected properties', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        expect(result.current).toHaveProperty('save')
        expect(result.current).toHaveProperty('settings')
        expect(result.current).toHaveProperty('onChangeChannel')
        expect(result.current).toHaveProperty('onChangeSound')
        expect(result.current).toHaveProperty('onChangeVolume')
    })

    it.each(ticketMessageCreatedEvents.map((event) => [event.type]))(
        'should include %s event if the FF is enabled',
        async (eventType) => {
            mockUseFlag.mockReturnValue(true)
            const {result, waitForNextUpdate} = renderHook(() => useSettings())
            await act(async () => await waitForNextUpdate())

            expect(result.current.settings.events[eventType]).toBeDefined()
        }
    )

    it('should use the old notification format for the ticket-message.created event', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        expect(
            result.current.settings.events['ticket-message.created'].sound
        ).toBe('custom-sound')
        expect(
            result.current.settings.events['ticket-message.created'].channels
                .in_app_feed
        ).toBe(true)
    })

    it('should not return a sound if old user notification setting is disabled', async () => {
        useAppSelectorMock.mockReturnValue({
            data: {
                notification_sound: {
                    enabled: false,
                    volume: 7,
                    sound: 'custom-sound',
                },
            },
        })

        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        expect(
            result.current.settings.events['ticket-message.created'].sound
        ).toBe('')
    })

    it('should use the default sound for the ticket-message.created event if old user settings are not available', async () => {
        useAppSelectorMock.mockReturnValue({
            data: {
                events: {},
            },
        })

        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        expect(
            result.current.settings.events['ticket-message.created'].sound
        ).toBe('default')
    })

    it('should update settings according to knock-returned workflow preferences', async () => {
        mockGetKnockPreferences.mockResolvedValue({
            workflows: {
                'user.mentioned': {
                    in_app_feed: true,
                },
            },
        })

        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())
        expect(
            result.current.settings.events['user.mentioned'].channels
        ).toEqual({
            in_app_feed: true,
        })
    })

    it('should update settings when handleChangeChannel is called', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        act(() => {
            result.current.onChangeChannel(
                'user.mentioned',
                'in_app_feed',
                false
            )
        })

        expect(
            result.current.settings.events['user.mentioned'].channels[
                'in_app_feed'
            ]
        ).toBe(false)
    })

    it('should update settings when handleChangeSound is called', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        act(() => {
            result.current.onChangeSound('user.mentioned', 'definite')
        })

        expect(result.current.settings.events['user.mentioned'].sound).toBe(
            'definite'
        )
    })

    it('should update settings when handleChangeVolume is called', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        act(() => {
            result.current.onChangeVolume(10)
        })

        expect(result.current.settings.volume).toBe(10)
    })

    it('should save settings when save is called', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useSettings())

        await act(async () => await waitForNextUpdate())

        await act(async () => {
            await result.current.save()
        })

        await waitFor(() => {
            expect(mockSetKnockPreferences).toHaveBeenCalled()
            expect(useAppDispatchMock).toHaveBeenCalled()
        })
    })

    it('should filter out ticket-message.created events on save if the feature flag is disabled', async () => {
        mockFlagSet[FeatureFlagKey.NotificationsTicketMessageCreated] = false
        const {result, waitForNextUpdate} = renderHook(() => useSettings(), {
            wrapper: ({children}) => (
                <Provider store={mockStore()}>{children}</Provider>
            ),
        })
        await act(async () => await waitForNextUpdate())
        await act(async () => {
            await result.current.save()
        })

        await waitFor(() => {
            expect(
                // eslint-disable-next-line
                submitSettingMock.mock.calls[0][0]['data']['events'][
                    'ticket-message.created'
                ]
            ).not.toBeDefined()
            expect(
                // eslint-disable-next-line
                mockSetKnockPreferences.mock.calls[0][0]['workflows']
            ).not.toHaveProperty('ticket-message-created')
        })
    })
})
