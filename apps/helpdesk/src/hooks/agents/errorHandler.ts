import { isAxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

export function handleError(
    error: unknown,
    defaultMsg: string,
    title?: string,
) {
    if (isAxiosError(error)) {
        const msg = (
            error?.response?.data as { error: { msg: string } } | undefined
        )?.error?.msg
        if (msg) {
            toast.error(msg)
            return undefined
        }
    }
    if (title) {
        toast.error(title, { caption: defaultMsg })
    } else {
        toast.error(defaultMsg)
    }
}
