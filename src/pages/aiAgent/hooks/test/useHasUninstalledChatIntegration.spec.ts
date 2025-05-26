import { useFetchChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useHasUninstalledChatIntegration } from '../useHasUninstalledChatIntegration'

jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
)
const mockUseFetchChatIntegrationsStatusData = assumeMock(
    useFetchChatIntegrationsStatusData,
)

describe('useHasUninstalledChatIntegration', () => {
    it('should return false when no chat integrations are provided', () => {
        mockUseFetchChatIntegrationsStatusData.mockReturnValue({
            data: [
                { chatId: 1, installed: false },
                { chatId: 2, installed: false },
            ],
        } as any)

        const { result } = renderHook(() =>
            useHasUninstalledChatIntegration([]),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when no chat integration status are returned', () => {
        mockUseFetchChatIntegrationsStatusData.mockReturnValue({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            useHasUninstalledChatIntegration([1, 2]),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when all provided chat integrations are installed', () => {
        mockUseFetchChatIntegrationsStatusData.mockReturnValue({
            data: [
                { chatId: 1, installed: true },
                { chatId: 2, installed: true },
            ],
        } as any)

        const { result } = renderHook(() =>
            useHasUninstalledChatIntegration([1, 2]),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when provided chat integration is installed even if other integrations are not installed', () => {
        mockUseFetchChatIntegrationsStatusData.mockReturnValue({
            data: [
                { chatId: 1, installed: true },
                { chatId: 2, installed: false },
            ],
        } as any)

        const { result } = renderHook(() =>
            useHasUninstalledChatIntegration([1]),
        )

        expect(result.current).toBe(false)
    })

    it('should return true when provided chat integration is uninstalled even if other integrations are installed', () => {
        mockUseFetchChatIntegrationsStatusData.mockReturnValue({
            data: [
                { chatId: 1, installed: true },
                { chatId: 2, installed: false },
            ],
        } as any)

        const { result } = renderHook(() =>
            useHasUninstalledChatIntegration([2]),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when all provided chat integrations are uninstalled', () => {
        mockUseFetchChatIntegrationsStatusData.mockReturnValue({
            data: [
                { chatId: 1, installed: true },
                { chatId: 2, installed: false },
            ],
        } as any)

        const { result } = renderHook(() =>
            useHasUninstalledChatIntegration([1, 2]),
        )

        expect(result.current).toBe(true)
    })
})
