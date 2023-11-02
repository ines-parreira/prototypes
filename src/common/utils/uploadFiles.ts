import {Attachment} from 'common/types'
import client from 'models/api/resources'

/**
 * Upload file action meant to be used by another action
 */
export default function uploadFiles(
    files: FileList | Array<Attachment> | File[],
    params: Maybe<Record<string, unknown>> = null
): Promise<Attachment[]> {
    const formData = new window.FormData()

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        formData.append(file.name, file as any)
    }

    return client
        .post<Attachment[]>('/api/upload/', formData, {params: params || {}})
        .then((json) => json?.data)
}
