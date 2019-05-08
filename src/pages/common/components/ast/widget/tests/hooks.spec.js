import {renderHook} from 'react-hooks-testing-library'
import {fromJS} from 'immutable'

import {useOptions} from '../hooks'

const getOptionId = (option) => option.get('id')

describe('useOptions', () => {
    const options = fromJS([{
        id: 1,
        foo: 'bar'
    }])

    it('should return options if no selected option', () => {
        const {result} = renderHook(() => {
            return useOptions(null, options, getOptionId)
        })
        expect(result.current).toEqual(options)
    })

    it('should add selected option to options', () => {
        const selectedOption = fromJS({
            id: 2,
            baz: 'bac'
        })
        const {result} = renderHook(() => {
            return useOptions(selectedOption, options, getOptionId)
        })
        expect(result.current).toEqual(options.push(selectedOption))
    })

    it('should not add selected option to options if it is already there', () => {
        const selectedOption = fromJS({
            id: 1,
            baz: 'bac'
        })
        const {result} = renderHook(() => {
            return useOptions(selectedOption, options, getOptionId)
        })
        expect(result.current).toEqual(options)
    })
})
