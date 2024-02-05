import {useState} from 'react'

import {Attachment} from 'common/types'
import {uploadAttachments} from 'rest_api/help_center_api/uploadAttachments'
import useCurrentHelpCenter from './useCurrentHelpCenter'

export type FileUpload = {
    isTouched: boolean
    payload: File | undefined
    uploadFile: () => Promise<Attachment | null>
    changeFile: (payload: File | undefined) => void
    discardFile: () => void
    getFileUploadURL: () => Promise<string | null | undefined>
}

export function useFileUpload(): FileUpload {
    // needed to specify the channel type of the attachment
    const helpCenter = useCurrentHelpCenter()

    const [isTouched, setIsTouched] = useState(false)
    const [localFile, setLocalFile] = useState<File>()

    const handleOnChangeFile = (payload: File | undefined) => {
        setLocalFile(payload)
        setIsTouched(true)
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

    return {
        isTouched,
        payload: localFile,
        uploadFile,
        changeFile: handleOnChangeFile,
        discardFile: handleOnDiscard,
        getFileUploadURL,
    }
}
