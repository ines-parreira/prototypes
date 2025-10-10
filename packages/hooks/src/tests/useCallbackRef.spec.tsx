import { renderHook } from '@repo/testing/vitest'
import { act, render, waitFor } from '@testing-library/react'

import { useCallbackRef } from '../useCallbackRef'

describe('useCallbackRef', () => {
    it('should set the reference to an element', async () => {
        const { result } = renderHook(() => useCallbackRef())
        act(() => {
            render(<div ref={result.current[1]}>I need a ref</div>)
            waitFor(() => {
                expect(result.current[0]).toHaveTextContent(/I need a ref/)
            })
        })
    })
})
