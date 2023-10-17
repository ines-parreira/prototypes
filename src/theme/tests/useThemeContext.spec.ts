import {renderHook} from '@testing-library/react-hooks'

import useThemeContext from '../useThemeContext'

describe('useThemeContext', () => {
    it('should return a tuple with the theme and a setter', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current).toEqual(['modern', expect.any(Function)])
    })
})
