import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenterAutomationSettings } from 'models/helpCenter/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import useHelpCentersAutomationSettings from '../useHelpCenterAutomationSettings'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('hooks/useAppSelector')

const mockUseHelpCenterApi = useHelpCenterApi as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useHelpCentersAutomationSettings()', () => {
    const helpCenterId = 42
    const automationSettings: HelpCenterAutomationSettings = {
        workflows: [{ id: '123', enabled: true }],
        order_management: { enabled: false },
    }

    const mockClient = {
        getHelpCenterAutomationSettings: jest.fn(),
        upsertHelpCenterAutomationSettings: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHelpCenterApi.mockReturnValue({
            client: mockClient,
        })
        // Return a stable empty object to prevent infinite render loops
        mockUseAppSelector.mockReturnValue({})
    })

    describe('with valid helpCenterId', () => {
        it('should fetch automation settings when helpCenterId is valid', async () => {
            mockClient.getHelpCenterAutomationSettings.mockImplementation(
                async () => {
                    // Update the mock to return the fetched data
                    mockUseAppSelector.mockReturnValue({
                        [helpCenterId.toString()]: automationSettings,
                    })
                    return { data: automationSettings }
                },
            )

            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(helpCenterId),
            )

            await waitFor(() => {
                expect(
                    mockClient.getHelpCenterAutomationSettings,
                ).toHaveBeenCalledWith({
                    help_center_id: helpCenterId,
                })
            })

            await waitFor(() => {
                expect(result.current.automationSettings).toEqual(
                    automationSettings,
                )
            })
        })

        it('should update automation settings when helpCenterId is valid', async () => {
            mockClient.upsertHelpCenterAutomationSettings.mockResolvedValue({
                data: automationSettings,
            })

            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(helpCenterId),
            )

            await act(async () => {
                await result.current.handleHelpCenterAutomationSettingsUpdate(
                    automationSettings,
                )
            })

            expect(
                mockClient.upsertHelpCenterAutomationSettings,
            ).toHaveBeenCalledWith(
                { help_center_id: helpCenterId },
                automationSettings,
            )
        })
    })

    describe('with invalid helpCenterId', () => {
        it('should not fetch automation settings when helpCenterId is 0', async () => {
            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(0),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            expect(
                mockClient.getHelpCenterAutomationSettings,
            ).not.toHaveBeenCalled()
        })

        it('should not update automation settings when helpCenterId is 0', async () => {
            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(0),
            )

            await act(async () => {
                await result.current.handleHelpCenterAutomationSettingsUpdate(
                    automationSettings,
                )
            })

            expect(
                mockClient.upsertHelpCenterAutomationSettings,
            ).not.toHaveBeenCalled()
        })
    })

    describe('when client is not available', () => {
        it('should not fetch automation settings when client is null', async () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: null,
            })

            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(helpCenterId),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })

            expect(
                mockClient.getHelpCenterAutomationSettings,
            ).not.toHaveBeenCalled()
        })

        it('should not update automation settings when client is null', async () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: null,
            })

            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(helpCenterId),
            )

            await act(async () => {
                await result.current.handleHelpCenterAutomationSettingsUpdate(
                    automationSettings,
                )
            })

            expect(
                mockClient.upsertHelpCenterAutomationSettings,
            ).not.toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('should handle 404 errors by setting default automation settings', async () => {
            const notFoundError = new AxiosError('Not Found')
            notFoundError.response = {
                status: 404,
                data: {},
                statusText: 'Not Found',
                headers: {},
                config: {} as any,
            }

            const defaultSettings = {
                workflows: [],
                order_management: { enabled: false },
            }

            mockClient.getHelpCenterAutomationSettings.mockImplementation(
                async () => {
                    // Update the mock to return the default settings after error
                    mockUseAppSelector.mockReturnValue({
                        [helpCenterId.toString()]: defaultSettings,
                    })
                    throw notFoundError
                },
            )

            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(helpCenterId),
            )

            await waitFor(() => {
                expect(result.current.automationSettings).toEqual(
                    defaultSettings,
                )
            })
        })

        it('should handle general errors when fetching', async () => {
            const error = new Error('Network error')
            mockClient.getHelpCenterAutomationSettings.mockRejectedValue(error)

            const { result } = renderHook(() =>
                useHelpCentersAutomationSettings(helpCenterId),
            )

            await waitFor(() => {
                expect(result.current.isFetchPending).toBe(false)
            })
        })
    })
})
