import {act} from '@testing-library/react'
import {renderHook} from 'react-hooks-testing-library'

import * as utils from '../../../../../utils'

import {useFileUpload} from '../useFileUpload'

describe('useFileUpload()', () => {
    const dummyFile = new File(['foo'], 'foo.txt', {
        type: 'text/plain',
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('is not touched in default state', () => {
        const {result} = renderHook(useFileUpload)

        expect(result.current.isTouched).toBeFalsy()
    })

    it('becomes touched if the file is changed', () => {
        const {result} = renderHook(useFileUpload)

        act(() => {
            result.current.changeFile(dummyFile)
        })

        expect(result.current.isTouched).toBeTruthy()
        expect(result.current.payload).toEqual(dummyFile)
    })

    it('reverts to default state when changes are discarded', () => {
        const {result} = renderHook(useFileUpload)

        act(() => {
            result.current.changeFile(dummyFile)
            result.current.discardFile()
        })

        expect(result.current.isTouched).toBeFalsy()
        expect(result.current.payload).toEqual(undefined)
    })

    it('calls `uploadFiles` only if we have new changes', () => {
        const uploadFilesSpy = jest
            .spyOn(utils, 'uploadFiles')
            .mockResolvedValue([])

        const {result} = renderHook(useFileUpload)

        void act(async () => {
            await result.current.uploadFile()
        })

        expect(uploadFilesSpy).not.toHaveBeenCalled()

        void act(async () => {
            result.current.changeFile(dummyFile)
            await result.current.uploadFile()
            expect(uploadFilesSpy).toHaveBeenCalled()
        })
    })
})
