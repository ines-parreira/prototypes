import React from 'react'
import {act} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'

import * as utils from 'common/utils'

import {useFileUpload} from '../useFileUpload'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'

const renderOptions = {
    wrapper: ({children}: {children: React.ReactNode}) => (
        <CurrentHelpCenterContext.Provider
            value={getSingleHelpCenterResponseFixture}
        >
            {children}
        </CurrentHelpCenterContext.Provider>
    ),
}

describe('useFileUpload()', () => {
    const dummyFile = new File(['foo'], 'foo.txt', {
        type: 'text/plain',
    })

    it('is not touched in default state', () => {
        const {result} = renderHook(useFileUpload, renderOptions)

        expect(result.current.isTouched).toBeFalsy()
    })

    it('becomes touched if the file is changed', () => {
        const {result} = renderHook(useFileUpload, renderOptions)

        act(() => {
            result.current.changeFile(dummyFile)
        })

        expect(result.current.isTouched).toBeTruthy()
        expect(result.current.payload).toEqual(dummyFile)
    })

    it('reverts to default state when changes are discarded', () => {
        const {result} = renderHook(useFileUpload, renderOptions)

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

        const {result} = renderHook(useFileUpload, renderOptions)

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

    it('returns the file upload URL', () => {
        const uploadFilesSpy = jest
            .spyOn(utils, 'uploadFiles')
            .mockResolvedValueOnce([
                {
                    content_type: 'text/plain',
                    name: 'foo.txt',
                    size: 100,
                    url: 'http://example.com/foo.text',
                    type: 'txt',
                },
            ])

        const {result} = renderHook(useFileUpload, renderOptions)

        void act(async () => {
            result.current.changeFile(dummyFile)
            const url = await result.current.getFileUploadURL()
            expect(uploadFilesSpy).toHaveBeenCalled()
            expect(url).toEqual('http://example.com/foo.text')
        })
    })
})
