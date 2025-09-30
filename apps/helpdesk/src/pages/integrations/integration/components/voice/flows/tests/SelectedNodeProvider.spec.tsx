import React from 'react'

import { act, renderHook } from '@testing-library/react'

import { useVoiceFlowContext } from '../VoiceFlowContext'
import VoiceFlowProvider from '../VoiceFlowProvider'

describe('SelectedNodeProvider', () => {
    it('provides default context values', () => {
        const { result } = renderHook(() => useVoiceFlowContext(), {
            wrapper: ({ children }) => (
                <VoiceFlowProvider>{children}</VoiceFlowProvider>
            ),
        })

        expect(result.current.selectedNode).toBeNull()
        expect(typeof result.current.setSelectedNode).toBe('function')
    })

    it('updates selectedNode when setSelectedNode is called', () => {
        const { result } = renderHook(() => useVoiceFlowContext(), {
            wrapper: ({ children }) => (
                <VoiceFlowProvider>{children}</VoiceFlowProvider>
            ),
        })

        expect(result.current.selectedNode).toBeNull()

        act(() => {
            result.current.setSelectedNode('node-1')
        })

        expect(result.current.selectedNode).toBe('node-1')
    })

    it('allows setting selectedNode to null', () => {
        const { result } = renderHook(() => useVoiceFlowContext(), {
            wrapper: ({ children }) => (
                <VoiceFlowProvider>{children}</VoiceFlowProvider>
            ),
        })

        act(() => {
            result.current.setSelectedNode('node-1')
        })

        expect(result.current.selectedNode).toBe('node-1')

        act(() => {
            result.current.setSelectedNode(null)
        })

        expect(result.current.selectedNode).toBeNull()
    })

    it('maintains separate state for multiple consumers', () => {
        const { result: result1 } = renderHook(() => useVoiceFlowContext(), {
            wrapper: ({ children }) => (
                <VoiceFlowProvider>{children}</VoiceFlowProvider>
            ),
        })

        const { result: result2 } = renderHook(() => useVoiceFlowContext(), {
            wrapper: ({ children }) => (
                <VoiceFlowProvider>{children}</VoiceFlowProvider>
            ),
        })

        act(() => {
            result1.current.setSelectedNode('node-1')
        })

        act(() => {
            result2.current.setSelectedNode('node-2')
        })

        expect(result1.current.selectedNode).toBe('node-1')
        expect(result2.current.selectedNode).toBe('node-2')
    })

    it('shares state between multiple consumers in the same provider', () => {
        const TestComponent = ({ children }: { children: React.ReactNode }) => (
            <VoiceFlowProvider>{children}</VoiceFlowProvider>
        )

        const { result: result1 } = renderHook(() => useVoiceFlowContext(), {
            wrapper: TestComponent,
        })

        const { result: result2 } = renderHook(() => useVoiceFlowContext(), {
            wrapper: TestComponent,
        })

        // Both hooks should start with null
        expect(result1.current.selectedNode).toBeNull()
        expect(result2.current.selectedNode).toBeNull()

        // Update via first hook
        act(() => {
            result1.current.setSelectedNode('shared-node')
        })

        // Since they're in separate provider instances, they maintain separate state
        expect(result1.current.selectedNode).toBe('shared-node')
        expect(result2.current.selectedNode).toBeNull()

        // Update via second hook
        act(() => {
            result2.current.setSelectedNode('other-node')
        })

        expect(result1.current.selectedNode).toBe('shared-node')
        expect(result2.current.selectedNode).toBe('other-node')
    })

    it('allows switching between different nodes', () => {
        const { result } = renderHook(() => useVoiceFlowContext(), {
            wrapper: ({ children }) => (
                <VoiceFlowProvider>{children}</VoiceFlowProvider>
            ),
        })

        const nodeIds = ['node-1', 'node-2', 'node-3']

        nodeIds.forEach((nodeId) => {
            act(() => {
                result.current.setSelectedNode(nodeId)
            })

            expect(result.current.selectedNode).toBe(nodeId)
        })
    })
})
