import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {shallow} from 'enzyme'

const middlewares = [thunk]


/**
 * Mock a Redux store
 *
 * @param {object} store - The initial state of the store
 * @returns {object} - A redux store with the given initial state
 */
export const mockStore = (store) => configureMockStore(middlewares)(store)

/**
 * Render a React node with Redux store
 *
 * @param {JSX} component - The React node to render
 * @param {object} store - The Redux store to inject inside the context of the given component
 * @returns {ShallowWrapper} - The wrapper instance around the rendered output.
 */
export const shallowWithStore = (component, store) => shallow(component, {context: {store}})
