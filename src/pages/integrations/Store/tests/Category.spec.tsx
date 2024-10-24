import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {Category as CategoryType} from 'models/integration/types/app'
import {renderWithRouter} from 'utils/testing'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

import Category from '../Category'

describe('<Category />', () => {
    it('should render correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <Category category={CategoryType.QUALITY} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a "view all" arrow link', () => {
        renderWithRouter(
            <Provider store={store}>
                <Category category={CategoryType.QUALITY} showCategoryLink />
            </Provider>
        )
        expect(
            screen.getByText(/View All/).getAttribute('to')
        ).toMatchInlineSnapshot(`"?category=Quality%20Assurance"`)
    })
})
