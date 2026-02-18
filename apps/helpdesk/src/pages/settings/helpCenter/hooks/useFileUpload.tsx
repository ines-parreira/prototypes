import { useState } from 'react'

import type { GenericAttachment } from 'common/types'
import { uploadAttachments } from 'rest_api/help_center_api/uploadAttachments'
import { getBase64 } from 'utils/file'

import useCurrentHelpCenter from './useCurrentHelpCenter'

export type FileUpload = {
    isTouched: boolean
    payload: File | undefined
    serializedFile: string
    uploadFile: () => Promise<GenericAttachment | null>
    changeFile: (payload: File | undefined) => void
    discardFile: () => void
    getFileUploadURL: () => Promise<string | null | undefined>
}

export function useFileUpload(): FileUpload {
    // needed to specify the channel type of the attachment
    const helpCenter = useCurrentHelpCenter()

    const [isTouched, setIsTouched] = useState(false)
    const [localFile, setLocalFile] = useState<File>()
    const [serializedFile, setSerializedFile] = useState<string>('')

    const handleOnChangeFile = (payload: File | undefined) => {
        setLocalFile(payload)
        setIsTouched(true)
        void serializeFile(payload)
    }

    const handleOnDiscard = () => {
        setLocalFile(undefined)
        setIsTouched(false)
    }

    const uploadFile = async () => {
        if (isTouched && localFile) {
            return uploadAttachments([localFile], {
                id: helpCenter.id,
                type: 'HC',
            }).then((response) => response[0])
        }

        return null
    }

    const getFileUploadURL = async () => {
        if (localFile) {
            const uploadedFile = await uploadFile()
            return uploadedFile?.url
        }
        return isTouched ? null : undefined
    }

    const serializeFile = (payload: File | undefined) => {
        if (!payload) {
            setSerializedFile('')
            return
        }
        return getBase64(payload).then((serializedFile) =>
            setSerializedFile(serializedFile),
        )
    }

    return {
        isTouched,
        payload: localFile,
        uploadFile,
        changeFile: handleOnChangeFile,
        discardFile: handleOnDiscard,
        getFileUploadURL,
        serializedFile,
    }
}
