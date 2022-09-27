import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {integrationsState} from '../../../../../fixtures/integrations'
import DiscountCodeCreateModal from '../DiscountCodeCreateModal'

const minProps = {
    integration: fromJS(integrationsState.integration),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<DiscountCodeCreateModal />', () => {
    const store = mockStore({})

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = render(
            <Provider store={store}>
                <DiscountCodeCreateModal {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
