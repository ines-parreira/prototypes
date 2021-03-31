import {renderHook} from 'react-hooks-testing-library'
import {useLocation} from 'react-router-dom'

import useSearch from '../useSearch'

jest.mock('react-router')
;(useLocation as jest.MockedFunction<typeof useLocation>).mockReturnValue({
    pathname: '',
    search: '?foo=1&bar=baz',
    state: '',
    hash: '',
})

describe('useSearch hook', () => {
    it('should provide the parsed query', () => {
        const {result} = renderHook(() => useSearch())

        expect(result.current).toEqual({foo: '1', bar: 'baz'})
    })

    it('should provide the updated parsed query when url changed', () => {
        const {result, rerender} = renderHook(() => useSearch())
        ;(useLocation as jest.MockedFunction<
            typeof useLocation
        >).mockReturnValueOnce({
            pathname: '',
            search: '?baz=2',
            state: '',
            hash: '',
        })
        rerender()

        expect(result.current).toEqual({baz: '2'})
    })
})
