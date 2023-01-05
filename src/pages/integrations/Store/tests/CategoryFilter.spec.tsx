import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import {Category} from 'models/integration/types/app'

import CategoryFilter from '../CategoryFilter'
import {CATEGORY_DATA, CATEGORY_URL_PARAM} from '../constants'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<CategoryFilter />', () => {
    it('should render correctly', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <CategoryFilter />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should highlight the current category', () => {
        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <CategoryFilter />
            </Provider>,
            {
                route: `?${CATEGORY_URL_PARAM}=${Category.FEATURED}`,
            }
        )
        expect(getByText(CATEGORY_DATA[Category.FEATURED].title)).toHaveClass(
            'active'
        )
    })
})
