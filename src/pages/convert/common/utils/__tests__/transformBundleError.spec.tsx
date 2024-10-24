import {AxiosError} from 'axios'

import {transformBundleError} from '../transformBundleError'

const integrationId = 1
const operationError = 'Bundle install problem'

const permissionError = {
    config: {},
    request: {},
    response: {
        data: {
            error: {
                msg: 'Please update your app permissions',
            },
        },
        status: 400,
    },
} as AxiosError

const serverError = {
    response: {
        data: {
            error: {
                msg: 'Something went wrong',
            },
        },
        status: 500,
    },
} as AxiosError

describe('transformBundleError', () => {
    it('transform permission error', () => {
        expect(
            transformBundleError(permissionError, operationError, integrationId)
        ).toEqual({
            buttons: [
                {
                    name: 'Update permissions',
                    onClick: expect.anything(),
                    primary: false,
                },
            ],
            message: 'Please update your app permissions',
            status: 'error',
            style: 'alert',
            noAutoDismiss: true,
            closeOnNext: true,
        })
    })
    it('transform server error', () => {
        expect(
            transformBundleError(serverError, operationError, integrationId)
        ).toEqual({
            buttons: [],
            message: 'Bundle install problem',
            status: 'error',
            style: 'alert',
            noAutoDismiss: true,
            closeOnNext: true,
        })
    })
})
