import {renderHook} from '@testing-library/react-hooks'
import useOnLoaded from '../useOnLoaded'

describe('useOnLoaded', () => {
    it('should call callback when the value becomes defined, only once', () => {
        const callback = jest.fn()
        const {rerender} = renderHook(
            ({value}) => useOnLoaded(value, callback),
            {
                initialProps: {
                    value: null as any,
                },
            }
        )
        expect(callback).not.toBeCalled()
        rerender({value: 'some'})
        expect(callback).toBeCalledTimes(1)
        rerender({value: 'other'})
        expect(callback).toBeCalledTimes(1)
    })
})
