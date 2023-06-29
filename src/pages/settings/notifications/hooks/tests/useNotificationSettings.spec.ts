import {renderHook} from '@testing-library/react-hooks'

import useNotificationSettings from '../useNotificationSettings'

describe('useNotificationSettings', () => {
    it('should return a save function', () => {
        const {result} = renderHook(() => useNotificationSettings())

        expect(result.current).toEqual({
            save: expect.any(Function),
        })
    })
})
