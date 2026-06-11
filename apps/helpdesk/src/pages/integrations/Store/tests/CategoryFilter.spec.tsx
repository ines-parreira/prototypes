import React from 'react'

import { render } from '@repo/testing'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Category } from 'models/integration/types/app'

import { CategoryFilter } from '../CategoryFilter'
import { CATEGORY_DATA, CATEGORY_URL_PARAM } from '../constants'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
describe('<CategoryFilter />', () => {
    it('should render correctly', () => {
        const { container } = render(<CategoryFilter />, {
            storeState: store.getState() as object,
        })
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should highlight the current category', () => {
        const { getByText } = render(<CategoryFilter />, {
            initialEntries: [`?${CATEGORY_URL_PARAM}=${Category.FEATURED}`],
            storeState: store.getState() as object,
        })
        expect(getByText(CATEGORY_DATA[Category.FEATURED].title)).toHaveClass(
            'active',
        )
    })
})
