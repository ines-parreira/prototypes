import { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'

import { GorgiasApiError } from 'models/api/types'

export const exampleGorgiasApiError: GorgiasApiError = {
    name: 'AxiosError',
    message: 'Request failed with status code 400',
    code: 'ERR_BAD_REQUEST',
    response: {
        status: 400,
        statusText: 'Bad Request',
        headers: {
            'content-type': 'application/json',
        },
        data: {
            error: {
                msg: 'Invalid request parameters',
                data: {
                    field: 'email',
                    message: 'Email is required',
                },
            },
        },
        config: {
            url: 'https://api.gorgias.com/endpoint',
            method: 'get',
            headers: {
                Accept: 'application/json, text/plain, */*',
            } as AxiosRequestHeaders,
            transformRequest: [],
            transformResponse: [],
            timeout: 0,
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            maxContentLength: -1,
            maxBodyLength: -1,
        } as AxiosRequestConfig,
    } as AxiosResponse,
    isAxiosError: true,
    toJSON: () => ({}),
}
