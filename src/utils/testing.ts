import configureMockStore, {MockStore} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {shallow} from 'enzyme'
import {ReactElement} from 'react'

const middlewares = [thunk]

/**
 * Mock a Redux store
 */
export const mockStore = (store: MockStore) =>
    configureMockStore(middlewares)(store)

/**
 * Render a React node with Redux store
 */
export const shallowWithStore = (
    component: ReactElement<any>,
    store: MockStore
) => shallow(component, {context: {store}})
