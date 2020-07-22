//@flow
import axios, {type CancelToken} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {renderHook} from 'react-hooks-testing-library'

import useCancellableRequest from '../useCancellableRequest'

describe('useCancellableRequest', () => {
    const mockApi = new MockAdapter(axios)
    const mockCall = jest.fn((cancelToken: CancelToken) => () =>
        axios.get('/foo', {cancelToken})
    )

    beforeEach(() => {
        mockApi.reset()
        jest.clearAllMocks()
        mockApi.onAny().reply(200, 'success')
    })

    it('should make a request when request called', () => {
        const {result} = renderHook(() => useCancellableRequest(mockCall))

        return result.current[0]().then((res) => {
            expect(res.data).toBe('success')
        })
    })

    it('should cancel the request when cancel called', async () => {
        const {result} = renderHook(() => useCancellableRequest(mockCall))
        const res = await (() => {
            const promise = result.current[0]()
            result.current[1]()
            return promise
        })()

        expect(res).toBe()
    })

    it('should cancel the previous call when called a second time', () => {
        const {result} = renderHook(() => useCancellableRequest(mockCall))

        return Promise.all([result.current[0](), result.current[0]()]).then(
            (values) => {
                expect(values.map((value) => value && value.data)).toEqual([
                    undefined,
                    'success',
                ])
            }
        )
    })

    it('should cancel the request when unmounting', async () => {
        const {result, unmount} = renderHook(() =>
            useCancellableRequest(mockCall)
        )
        const res = await (() => {
            const promise = result.current[0]()
            unmount()
            return promise
        })()

        expect(res).toBe()
    })
})
