import { act, renderHook } from '@testing-library/react-hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import { useGetChatsApplicationAutomationSettings } from 'models/automation/queries'
import { upsertChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/resources'
import { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'
import { chatApplicationAutomationSettingsUpdated } from 'state/entities/chatsApplicationAutomationSettings/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useApplicationsAutomationSettings from '../useApplicationsAutomationSettings'

// Mock necessary hooks and modules
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')

jest.mock('models/chatApplicationAutomationSettings/resources')
jest.mock('state/entities/chatsApplicationAutomationSettings/selectors')
jest.mock('models/automation/queries')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAsyncFn', () => {
    return jest
        .fn()
        .mockImplementation(
            (fn, deps: any, initialState: any = { loading: false }) => {
                return [
                    initialState,
                    (...args: any[]) => {
                        return new Promise((resolve, reject) => {
                            try {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                const result = fn(...args)
                                resolve(result)
                            } catch (error) {
                                reject(error)
                            }
                        })
                    },
                ] as never
            },
        )
})
describe('useApplicationsAutomationSettings', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
        ;(useAppSelector as jest.Mock).mockReturnValue({})
        ;(
            useGetChatsApplicationAutomationSettings as jest.Mock
        ).mockReturnValue({ isLoading: false })
    })

    it('handles fetch error correctly', () => {
        const mockError = new Error('Fetch error')

        ;(
            useGetChatsApplicationAutomationSettings as jest.Mock
        ).mockImplementation((_, { onError }) => {
            if (onError) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                onError(mockError)
            }
            return { isLoading: false, data: null, error: mockError }
        })

        renderHook(() => useApplicationsAutomationSettings(['1']))

        expect(dispatch).toHaveBeenCalledWith(
            notify({
                message: 'Failed to fetch',
                status: NotificationStatus.Error,
            }),
        )
    })

    it('updates automation settings successfully', async () => {
        const mockSettings = {
            applicationId: '1',
            articleRecommendation: {},
            orderManagement: {},
            workflows: {},
        } as unknown as ChatApplicationAutomationSettings

        ;(
            upsertChatApplicationAutomationSettings as jest.Mock
        ).mockResolvedValue(mockSettings)

        const { result } = renderHook(() =>
            useApplicationsAutomationSettings(['1']),
        )

        await act(async () => {
            await result.current.handleChatApplicationAutomationSettingsUpdate(
                mockSettings,
            )
        })

        expect(upsertChatApplicationAutomationSettings).toHaveBeenCalledWith(
            '1',
            {
                articleRecommendation: mockSettings.articleRecommendation,
                orderManagement: mockSettings.orderManagement,
                workflows: mockSettings.workflows,
            },
        )
        expect(dispatch).toHaveBeenCalledWith(
            chatApplicationAutomationSettingsUpdated(mockSettings),
        )
        expect(dispatch).toHaveBeenCalledWith(
            notify({
                message: 'Successfully updated',
                status: NotificationStatus.Success,
            }),
        )
    })

    it('returns correct loading states', () => {
        ;(
            useGetChatsApplicationAutomationSettings as jest.Mock
        ).mockReturnValue({ isLoading: true })
        ;(useAsyncFn as jest.Mock).mockReturnValue([
            { loading: true },
            jest.fn(),
        ])

        const { result } = renderHook(() =>
            useApplicationsAutomationSettings(['1']),
        )

        expect(result.current.isFetchPending).toBe(true)
        expect(result.current.isUpdatePending).toBe(true)
    })
})
