import React from 'react'
import {render, screen} from '@testing-library/react'

import {renderWithRouter} from 'utils/testing'
import {Category as CategoryType} from 'models/integration/types/app'

import Category from '../Category'

describe('<Category />', () => {
    it('should render correctly', () => {
        const {container} = render(<Category category={CategoryType.QUALITY} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a "view all" arrow link', () => {
        renderWithRouter(
            <Category category={CategoryType.QUALITY} showCategoryLink />
        )
        expect(
            screen.getByText(/View All/).getAttribute('to')
        ).toMatchInlineSnapshot(`"?category=Quality%20Assurance"`)
    })
})
