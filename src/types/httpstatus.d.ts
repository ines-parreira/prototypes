declare module 'httpstatus' {
    class HTTPStatus {
        constructor(code: number)
        code: number
        description: string
        is: (code: number) => boolean
        isInformational: boolean
        isRedirection: boolean
        isClientError: boolean
        isServerError: boolean
        isError: boolean
        isSuccess: boolean
    }

    export = HTTPStatus
}
