import {fromJS, List} from 'immutable'
import moment from 'moment'
import {renderHook} from '@testing-library/react-hooks'

import useLastMessageDatetimeAfterMount from '../useLastMessageDatetimeAfterMount'

describe('useLastMessageDatetimeAfterMount', () => {
    it('should return null by default', () => {
        const {result} = renderHook(() =>
            useLastMessageDatetimeAfterMount(List([]))
        )
        expect(result.current).toBe(null)
    })

    it('should return a `moment` for the last given element', () => {
        const element = fromJS({created_datetime: '2023-02-20T18:36:00'})
        const {result} = renderHook(() =>
            useLastMessageDatetimeAfterMount(List([element]))
        )
        expect(moment.isMoment(result.current)).toBe(true)
        expect(result.current?.format()).toBe('2023-02-20T18:36:00Z')
    })
})
