import React from 'react'

import { history } from '@repo/routing'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import * as H from 'history'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import useUnsavedChangesPrompt from '../useUnsavedChangesPrompt'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

const mockLocation = {
    pathname: '/test',
    state: { some: 'state' },
    search: '',
    hash: '',
    key: '',
} as unknown as H.Location

const renderHookWithRouter = ({
    when = false,
}: {
    when?: boolean
} = {}) => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <Router history={history}>
            <Route path="/:shopName?">{children}</Route>
        </Router>
    )

    return {
        ...renderHook(() => useUnsavedChangesPrompt({ when }), {
            wrapper,
        }),
        history,
    }
}

describe('useUnsavedChangesPrompt', () => {
    const mockPush = jest.fn()
    const mockListen = jest.fn()
    const mockUnlisten = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()

        history.push = mockPush
        history.listen = mockListen.mockImplementation((arg) => {
            arg()
            return mockUnlisten
        })
    })

    it('should initialize with default values', () => {
        const { result } = renderHookWithRouter({ when: false })

        expect(result.current.isOpen).toBe(false)
        expect(typeof result.current.onClose).toBe('function')
        expect(typeof result.current.redirectToOriginalLocation).toBe(
            'function',
        )
        expect(typeof result.current.onNavigateAway).toBe('function')
        expect(typeof result.current.onLeaveContext).toBe('function')
    })

    it('should stop listening to history when unmounted', () => {
        const { unmount } = renderHookWithRouter({ when: false })

        expect(mockListen).toHaveBeenCalled()

        unmount()

        expect(mockUnlisten).toHaveBeenCalled()
    })

    it('should open modal when navigation away is triggered and unsaved changes is true', () => {
        const unsavedChanges = true
        const { result } = renderHookWithRouter({ when: unsavedChanges })

        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.onNavigateAway(mockLocation, 'PUSH')
        })

        expect(result.current.isOpen).toBe(true)
    })

    it('should open modal when onLeaveContext is called and unsaved changes is true', () => {
        const unsavedChanges = true
        const { result } = renderHookWithRouter({ when: unsavedChanges })

        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.onLeaveContext()
        })

        expect(result.current.isOpen).toBe(true)
    })

    it('should handle open modal when leave context is called', () => {
        const { result } = renderHookWithRouter({ when: true })

        let canLeave
        act(() => {
            canLeave = result.current.onLeaveContext()
        })

        expect(canLeave).toBe(false)
        expect(result.current.isOpen).toBe(true)
    })

    it('should close modal when onClose is called', () => {
        const { result } = renderHookWithRouter({ when: true })

        act(() => {
            // First open the modal
            result.current.onNavigateAway(mockLocation, 'PUSH')
        })

        expect(result.current.isOpen).toBe(true)

        act(() => {
            // Then close it
            result.current.onClose()
        })

        expect(result.current.isOpen).toBe(false)
    })
})
