import {renderHook} from '@testing-library/react-hooks'

import useCandu from '../useCandu'
import CanduProvider from '../CanduProvider'

describe('useCandu', () => {
    it('should return the context', () => {
        const {result} = renderHook(() => useCandu(), {wrapper: CanduProvider})

        expect(result.current).toBe(false)
    })
})
