import type { CancelToken as AxiosCancelToken } from 'axios'

type RuntimeCancelConstructor = new (...args: unknown[]) => Error

type RuntimeCancelToken = {
    source: () => {
        token: AxiosCancelToken
        cancel: (message?: string) => void
    }
}

const axiosRuntime = require('axios') as {
    Cancel: RuntimeCancelConstructor
    CancelToken: RuntimeCancelToken
}

export const Cancel = axiosRuntime.Cancel
export const CancelToken = axiosRuntime.CancelToken
