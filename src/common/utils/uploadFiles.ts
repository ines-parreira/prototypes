import { GenericAttachment } from 'common/types'
import client from 'models/api/resources'

/**
 * Upload file action meant to be used by another action
 */
export default function uploadFiles(
    files: FileList | Array<GenericAttachment> | File[],
    params: Maybe<Record<string, unknown>> = null,
): Promise<GenericAttachment[]> {
    const formData = new window.FormData()

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        formData.append(file.name, file as any)
    }

    return client
        .post<GenericAttachment[]>('/api/upload/', formData, {
            params: params || {},
        })
        .then((json) => json?.data)
}
