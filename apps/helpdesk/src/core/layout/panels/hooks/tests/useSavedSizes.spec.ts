import { renderHook } from '@repo/testing'

import useSavedSizes from '../useSavedSizes'

describe('useSavedSizes', () => {
    let getItem: jest.SpyInstance
    let setItem: jest.SpyInstance

    beforeEach(() => {
        getItem = jest.spyOn(Storage.prototype, 'getItem')
        setItem = jest.spyOn(Storage.prototype, 'setItem')
    })

    it('should return an empty object if there are no saved saves', () => {
        getItem.mockReturnValue(null)
        const { result } = renderHook(() => useSavedSizes())
        expect(result.current[0].current).toEqual({})
    })

    it('should return an object if the value in localstorage is not an object', () => {
        getItem.mockReturnValue('some-string')
        const { result } = renderHook(() => useSavedSizes())
        expect(result.current[0].current).toEqual({})
    })

    it('should return sizes from localstorage', () => {
        getItem.mockReturnValue('{"panel1":100,"panel2":100,"panel3":100}')
        const { result } = renderHook(() => useSavedSizes())
        expect(result.current[0].current).toEqual({
            panel1: 100,
            panel2: 100,
            panel3: 100,
        })
    })

    it('should filter out non-number values', () => {
        getItem.mockReturnValue('{"panel1":"yup","panel2":100,"panel3":100}')
        const { result } = renderHook(() => useSavedSizes())
        expect(result.current[0].current).toEqual({
            panel2: 100,
            panel3: 100,
        })
    })

    it('should return an empty object if an error occurs', () => {
        const err = new Error('Oh no!')
        getItem.mockImplementation(() => {
            throw err
        })
        const { result } = renderHook(() => useSavedSizes())
        expect(result.current[0].current).toEqual({})
    })

    it('should override existing sizes', () => {
        getItem.mockReturnValue('{"panel1":100}')
        const { result } = renderHook(() => useSavedSizes())
        result.current[1]({ panel1: 200 })
        expect(setItem).toHaveBeenCalledWith('panel-sizes', '{"panel1":200}')
    })

    it('should augment existing sizes', () => {
        getItem.mockReturnValue('{"panel1":100}')
        const { result } = renderHook(() => useSavedSizes())
        result.current[1]({ panel2: 200 })
        expect(setItem).toHaveBeenCalledWith(
            'panel-sizes',
            '{"panel1":100,"panel2":200}',
        )
    })
})
