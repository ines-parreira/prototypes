import {act, render} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import useCallbackRef from '../useCallbackRef'

describe('useCallbackRef', () => {
    it('should set the reference to an element', () => {
        const {result} = renderHook(() => useCallbackRef())
        act(() => {
            render(<div ref={result.current[1]}>I need a ref</div>)
            expect(result.current[0]).toHaveTextContent(/I need a ref/)
        })
    })
})
