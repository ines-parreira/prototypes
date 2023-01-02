import React from 'react'

import {renderWithRouter} from 'utils/testing'
import {Category} from 'models/integration/types/app'

import CategoryFilter from '../CategoryFilter'
import {CATEGORY_DATA, CATEGORY_URL_PARAM} from '../constants'

describe('<CategoryFilter />', () => {
    it('should render correctly', () => {
        const {container} = renderWithRouter(<CategoryFilter />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should highlight the current category', () => {
        const {getByText} = renderWithRouter(<CategoryFilter />, {
            route: `?${CATEGORY_URL_PARAM}=${Category.FEATURED}`,
        })
        expect(getByText(CATEGORY_DATA[Category.FEATURED].title)).toHaveClass(
            'active'
        )
    })
})
