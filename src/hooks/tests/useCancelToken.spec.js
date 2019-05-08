import {renderHook} from 'react-hooks-testing-library'

import useCancelToken from '../useCancelToken'

jest.mock('axios', () => ({
    CancelToken: {
        source: () => ({
            cancel: jest.fn(),
            token: 'foo'
        })
    }
}))

describe('useCancelToken', () => {
    it('should supply cancelTokenSource to the request function', () => {
        const makeRequest = jest.fn(async () => {})
        renderHook(() => {
            useCancelToken(makeRequest)
        })
        const cancelTokenSource = makeRequest.mock.calls[0][0]
        expect(cancelTokenSource.token).toBe('foo')
    })

    it('should not throw if cancelled', () => {
        expect(() => {
            const makeRequest = jest.fn(async (cancelToken) => cancelToken.cancel())
            renderHook(() => {
                useCancelToken(makeRequest)
            })
        }).not.toThrow()
    })

    it('should cancel on unmount', async () => {
        let cancelTokenSource
        const makeRequest = jest.fn(async (token) => {
            cancelTokenSource = token
        })
        const {unmount} = renderHook(() => useCancelToken(makeRequest))
        unmount()
        expect(cancelTokenSource.cancel).toBeCalledTimes(1)
    })
})
