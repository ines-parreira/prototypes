import type { ReactNode } from 'react'

import { render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NotificationStatus } from '../context'
import { AgentStatusLegacyBridgeProvider } from '../provider'
import { useAgentStatusLegacyBridge } from '../useAgentStatusLegacyBridge'

describe('LegacyBridge', () => {
    describe('AgentStatusLegacyBridgeProvider', () => {
        it('should render children', () => {
            const mockDispatchNotification = vi.fn()

            render(
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    <div>Test Content</div>
                </AgentStatusLegacyBridgeProvider>,
            )

            expect(screen.getByText('Test Content')).toBeInTheDocument()
        })

        it('should provide context value to children', () => {
            const mockDispatchNotification = vi.fn()

            function TestComponent() {
                const context = useAgentStatusLegacyBridge()
                return <div>{context ? 'Context Available' : 'No Context'}</div>
            }

            render(
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    <TestComponent />
                </AgentStatusLegacyBridgeProvider>,
            )

            expect(screen.getByText('Context Available')).toBeInTheDocument()
        })

        it('should pass dispatchNotification function through context', () => {
            const mockDispatchNotification = vi.fn()

            function TestComponent() {
                const { dispatchNotification } = useAgentStatusLegacyBridge()
                dispatchNotification({
                    status: NotificationStatus.Success,
                    message: 'Test notification',
                })
                return <div>Test</div>
            }

            render(
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    <TestComponent />
                </AgentStatusLegacyBridgeProvider>,
            )

            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Test notification',
            })
        })

        it('should handle all notification status types', () => {
            const mockDispatchNotification = vi.fn()

            function TestComponent() {
                const { dispatchNotification } = useAgentStatusLegacyBridge()

                dispatchNotification({
                    status: NotificationStatus.Success,
                    message: 'Success',
                })
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Error',
                })
                dispatchNotification({
                    status: NotificationStatus.Warning,
                    message: 'Warning',
                })
                dispatchNotification({
                    status: NotificationStatus.Info,
                    message: 'Info',
                })

                return <div>Test</div>
            }

            render(
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    <TestComponent />
                </AgentStatusLegacyBridgeProvider>,
            )

            expect(mockDispatchNotification).toHaveBeenCalledTimes(4)
            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Success',
            })
            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Error',
            })
            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Warning,
                message: 'Warning',
            })
            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Info,
                message: 'Info',
            })
        })

        it('should handle notification with optional parameters', () => {
            const mockDispatchNotification = vi.fn()

            function TestComponent() {
                const { dispatchNotification } = useAgentStatusLegacyBridge()
                dispatchNotification({
                    id: 'test-id',
                    status: NotificationStatus.Success,
                    message: 'Test notification',
                    dismissAfter: 5000,
                })
                return <div>Test</div>
            }

            render(
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    <TestComponent />
                </AgentStatusLegacyBridgeProvider>,
            )

            expect(mockDispatchNotification).toHaveBeenCalledWith({
                id: 'test-id',
                status: NotificationStatus.Success,
                message: 'Test notification',
                dismissAfter: 5000,
            })
        })
    })

    describe('useAgentStatusLegacyBridge', () => {
        it('should return context value when used inside provider', () => {
            const mockDispatchNotification = vi.fn()

            const wrapper = ({ children }: { children: ReactNode }) => (
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    {children}
                </AgentStatusLegacyBridgeProvider>
            )

            const { result } = renderHook(() => useAgentStatusLegacyBridge(), {
                wrapper,
            })

            expect(result.current).toEqual({
                dispatchNotification: mockDispatchNotification,
            })
        })

        it('should allow calling dispatchNotification from hook result', () => {
            const mockDispatchNotification = vi.fn()

            const wrapper = ({ children }: { children: ReactNode }) => (
                <AgentStatusLegacyBridgeProvider
                    dispatchNotification={mockDispatchNotification}
                >
                    {children}
                </AgentStatusLegacyBridgeProvider>
            )

            const { result } = renderHook(() => useAgentStatusLegacyBridge(), {
                wrapper,
            })

            result.current.dispatchNotification({
                status: NotificationStatus.Success,
                message: 'Test',
            })

            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Test',
            })
        })
    })

    describe('NotificationStatus enum', () => {
        it('should have correct string values', () => {
            expect(NotificationStatus.Success).toBe('success')
            expect(NotificationStatus.Error).toBe('error')
            expect(NotificationStatus.Warning).toBe('warning')
            expect(NotificationStatus.Info).toBe('info')
        })
    })
})
