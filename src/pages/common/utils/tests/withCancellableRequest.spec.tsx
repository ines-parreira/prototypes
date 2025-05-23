import React from 'react'

import { render, waitFor } from '@testing-library/react'
import { CancelToken } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { userEvent } from 'utils/testing/userEvent'

import client from '../../../../models/api/resources'
import { StoreDispatch } from '../../../../state/types'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../withCancellableRequest'

const mockStore = configureMockStore([thunk])
const mockApi = new MockAdapter(client)
const request = (cancelToken?: CancelToken) => (dispatch: StoreDispatch) => {
    return client.get('/foo', { cancelToken }).then((res) =>
        dispatch({
            type: 'foo',
            data: res.data,
        }),
    )
}
const mockCall = jest.fn(request)

const MockComponent = ({
    mockFetch,
    cancelMockFetch,
}: CancellableRequestInjectedProps<
    'mockFetch',
    'cancelMockFetch',
    typeof request
>) => (
    <div>
        <input
            data-testid="fetch"
            onClick={() => void (mockFetch as () => void)()}
            type="button"
        />
        <input data-testid="cancel" onClick={cancelMockFetch} type="button" />
    </div>
)
const WrappedComponent = withCancellableRequest(
    'mockFetch',
    mockCall,
)(MockComponent)

describe('withCancellableRequest', () => {
    let store = mockStore({})

    beforeEach(() => {
        mockApi.reset()
        store = mockStore({})
        mockApi.onAny().reply(200, 'success')
    })

    it('should make a request when request called', async () => {
        const { getByTestId } = render(
            <Provider store={store}>
                <WrappedComponent />
            </Provider>,
        )

        userEvent.click(getByTestId('fetch'))
        await waitFor(() => expect(mockCall).toHaveBeenCalled())
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should cancel the request when cancel called', async () => {
        const { getByTestId } = render(
            <Provider store={store}>
                <WrappedComponent />
            </Provider>,
        )

        userEvent.click(getByTestId('fetch'))
        userEvent.click(getByTestId('cancel'))
        await waitFor(() => expect(mockCall).toHaveBeenCalled())
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should cancel the previous call when called a second time', async () => {
        const { getByTestId } = render(
            <Provider store={store}>
                <WrappedComponent />
            </Provider>,
        )

        userEvent.click(getByTestId('fetch'))
        userEvent.click(getByTestId('fetch'))
        await waitFor(() => expect(mockCall).toHaveBeenCalled())
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should cancel the request when unmounting', () => {
        const { getByTestId, unmount } = render(
            <Provider store={store}>
                <WrappedComponent />
            </Provider>,
        )

        userEvent.click(getByTestId('fetch'))
        unmount()
        expect(store.getActions()).toMatchSnapshot()
    })
})
