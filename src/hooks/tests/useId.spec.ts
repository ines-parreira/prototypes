import {renderHook} from 'react-hooks-testing-library'
import useId from 'hooks/useId'

describe('useId', () => {
    it('should generate the unique ids for two different components', () => {
        const {result: result1} = renderHook(() => useId())
        const {result: result2} = renderHook(() => useId())
        expect(result1.current).not.toBe(result2.current)
    })

    it('should generate the same id for the two renders of the same component', () => {
        const {result, rerender} = renderHook(() => useId())
        const id = result.current
        rerender()
        expect(id).toBe(result.current)
    })
})
