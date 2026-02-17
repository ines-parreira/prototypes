import type React from 'react'

import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { uploadAttachments } from 'rest_api/help_center_api/uploadAttachments'

import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { useFileUpload } from '../useFileUpload'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    getBase64: jest.fn().mockResolvedValue('base64String'),
}))

jest.mock('rest_api/help_center_api/uploadAttachments', () => ({
    uploadAttachments: jest.fn(),
}))

const renderOptions = {
    wrapper: ({ children }: { children?: React.ReactNode }) => (
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
        const { result } = renderHook(useFileUpload, renderOptions)
        expect(result.current.isTouched).toBeFalsy()
    })

    it('becomes touched if the file is changed', () => {
        const { result } = renderHook(useFileUpload, renderOptions)

        act(() => {
            result.current.changeFile(dummyFile)
        })

        expect(result.current.isTouched).toBeTruthy()
        expect(result.current.payload).toEqual(dummyFile)
    })

    it('reverts to default state when changes are discarded', () => {
        const { result } = renderHook(useFileUpload, renderOptions)

        act(() => {
            result.current.changeFile(dummyFile)
            result.current.discardFile()
        })

        expect(result.current.isTouched).toBeFalsy()
        expect(result.current.payload).toEqual(undefined)
    })

    it('calls `uploadFile` only if we have new changes', async () => {
        const uploadAttachmentsSpy = uploadAttachments as jest.Mock
        uploadAttachmentsSpy.mockResolvedValue([])

        const { result } = renderHook(useFileUpload, renderOptions)

        await act(async () => {
            await result.current.uploadFile()
        })

        expect(uploadAttachmentsSpy).not.toHaveBeenCalled()

        act(() => {
            result.current.changeFile(dummyFile)
        })

        await waitFor(() => {
            expect(result.current.serializedFile).toEqual('base64String')
        })

        await act(async () => {
            await result.current.uploadFile()
        })

        expect(uploadAttachmentsSpy).toHaveBeenCalled()
    })

    it('returns the file upload URL', async () => {
        const uploadAttachmentsSpy = uploadAttachments as jest.Mock
        uploadAttachmentsSpy.mockResolvedValueOnce([
            {
                content_type: 'text/plain',
                name: 'foo.txt',
                size: 100,
                url: 'http://example.com/foo.text',
                type: 'txt',
            },
        ])

        const { result } = renderHook(useFileUpload, renderOptions)

        act(() => {
            result.current.changeFile(dummyFile)
        })

        await waitFor(() => {
            expect(result.current.serializedFile).toEqual('base64String')
        })

        await act(async () => {
            const url = await result.current.getFileUploadURL()
            expect(uploadAttachmentsSpy).toHaveBeenCalled()
            expect(url).toEqual('http://example.com/foo.text')
        })
    })

    it('serializes file and sets serialized file when file is provided', async () => {
        const { result } = renderHook(useFileUpload, renderOptions)

        act(() => {
            expect(result.current.serializedFile).toEqual('')
            result.current.changeFile(dummyFile)
        })

        await waitFor(() => {
            expect(result.current.serializedFile).toEqual('base64String')
        })
    })

    it('sets serialized file to empty string when no file is provided', async () => {
        const { result } = renderHook(useFileUpload, renderOptions)

        act(() => {
            expect(result.current.serializedFile).toEqual('')
            result.current.changeFile(undefined)
        })

        await waitFor(() => {
            expect(result.current.serializedFile).toEqual('')
        })
    })
})
