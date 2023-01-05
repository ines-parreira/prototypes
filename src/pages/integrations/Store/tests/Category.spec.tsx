import React from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import {Category as CategoryType} from 'models/integration/types/app'

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
