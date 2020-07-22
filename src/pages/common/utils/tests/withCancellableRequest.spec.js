//@flow
import axios, {type CancelToken} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {mount} from 'enzyme'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import withCancellableRequest from '../withCancellableRequest'

type MockComponentProps = {
    mockFetch: () => void,
    cancelMockFetch: () => void,
}

const mockStore = configureMockStore([thunk])
const mockApi = new MockAdapter(axios)
const mockCall = jest.fn((cancelToken?: CancelToken) => (dispatch) => {
    return axios.get('/foo', {cancelToken}).then((res) =>
        dispatch({
            type: 'foo',
            data: res.data,
        })
    )
})
const MockComponent: any = ({
    mockFetch,
    cancelMockFetch,
}: MockComponentProps) => (
    <div>
        <input id="fetch" onClick={() => mockFetch()} type="button" />
        <input id="cancel" onClick={cancelMockFetch} type="button" />
    </div>
)
const WrappedComponent = withCancellableRequest<MockComponentProps>(
    'mockFetch',
    mockCall
)(MockComponent)

describe('withCancellableRequest', () => {
    let store

    beforeEach(() => {
        mockApi.reset()
        jest.clearAllMocks()
        store = mockStore({})
        mockApi.onAny().reply(200, 'success')
    })

    it('should make a request when request called', (done) => {
        const component = mount(<WrappedComponent store={store} />)

        component.find('#fetch').simulate('click')
        setImmediate(() => {
            expect(store.getActions()).toMatchSnapshot()
            done()
        })
    })

    it('should cancel the request when cancel called', (done) => {
        const component = mount(<WrappedComponent store={store} />)

        component.find('#fetch').simulate('click')
        component.find('#cancel').simulate('click')
        setImmediate(() => {
            expect(store.getActions()).toMatchSnapshot()
            done()
        })
    })

    it('should cancel the previous call when called a second time', (done) => {
        const component = mount(<WrappedComponent store={store} />)

        component.find('#fetch').simulate('click')
        component.find('#fetch').simulate('click')
        setImmediate(() => {
            expect(store.getActions()).toMatchSnapshot()
            done()
        })
    })

    it('should cancel the request when unmounting', (done) => {
        const component = mount(<WrappedComponent store={store} />)

        component.find('#fetch').simulate('click')
        component.unmount()
        setImmediate(() => {
            expect(store.getActions()).toMatchSnapshot()
            done()
        })
    })
})
