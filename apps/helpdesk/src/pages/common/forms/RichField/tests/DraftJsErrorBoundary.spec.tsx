import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { DraftJsErrorBoundary } from '../DraftJsErrorBoundary'

describe('DraftJsErrorBoundary', () => {
    const ThrowError = ({ error }: { error: Error }) => {
        throw error
    }

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.restoreAllMocks()
        jest.useRealTimers()
    })

    it('should render children when there is no error', () => {
        render(
            <DraftJsErrorBoundary>
                <div>Test Content</div>
            </DraftJsErrorBoundary>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should catch removeChild error and show loading indicator', () => {
        const removeChildError = new Error(
            "Failed to execute 'removeChild' on 'Node'",
        )

        render(
            <DraftJsErrorBoundary>
                <ThrowError error={removeChildError} />
            </DraftJsErrorBoundary>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should catch "not a child" error and show loading indicator', () => {
        const notAChildError = new Error('Node is not a child of this parent')

        render(
            <DraftJsErrorBoundary>
                <ThrowError error={notAChildError} />
            </DraftJsErrorBoundary>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should auto-recover after 50ms', async () => {
        const removeChildError = new Error(
            "Failed to execute 'removeChild' on 'Node'",
        )

        const { rerender } = render(
            <DraftJsErrorBoundary>
                <ThrowError error={removeChildError} />
            </DraftJsErrorBoundary>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()

        jest.advanceTimersByTime(50)

        rerender(
            <DraftJsErrorBoundary>
                <div>Recovered Content</div>
            </DraftJsErrorBoundary>,
        )

        await waitFor(() => {
            expect(screen.getByText('Recovered Content')).toBeInTheDocument()
        })
    })

    it('should call onError callback when error is caught', () => {
        const onError = jest.fn()
        const removeChildError = new Error(
            "Failed to execute 'removeChild' on 'Node'",
        )

        render(
            <DraftJsErrorBoundary onError={onError}>
                <ThrowError error={removeChildError} />
            </DraftJsErrorBoundary>,
        )

        expect(onError).toHaveBeenCalledWith(removeChildError)
    })

    it('should re-throw errors that are not removeChild or "not a child" errors', () => {
        const otherError = new Error('Some other error')

        expect(() => {
            render(
                <DraftJsErrorBoundary>
                    <ThrowError error={otherError} />
                </DraftJsErrorBoundary>,
            )
        }).toThrow('Some other error')
    })

    it('should not call onError when no error occurs', () => {
        const onError = jest.fn()

        render(
            <DraftJsErrorBoundary onError={onError}>
                <div>Normal Content</div>
            </DraftJsErrorBoundary>,
        )

        expect(onError).not.toHaveBeenCalled()
    })
})
