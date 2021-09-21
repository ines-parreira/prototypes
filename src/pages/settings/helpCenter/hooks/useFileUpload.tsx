import {useState} from 'react'

import {uploadFiles} from '../../../../utils'
import {Attachment} from '../../../../types'

type useFileUploadApi = {
    isTouched: boolean
    payload: File | undefined
    uploadFile: () => Promise<Attachment[]>
    changeFile: (payload: File | undefined) => void
    discardFile: () => void
}

export function useFileUpload(): useFileUploadApi {
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
            return uploadFiles([localFile]).then((response) => {
                setIsTouched(false)
                return response
            })
        }
        return Promise.resolve([])
    }

    return {
        isTouched,
        payload: localFile,
        uploadFile,
        changeFile: handleOnChangeFile,
        discardFile: handleOnDiscard,
    }
}
