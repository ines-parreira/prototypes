import React from 'react'
import {render} from '@testing-library/react'

import HomePageLink from '../HomePageLink'

describe('<HomePageLink />', () => {
    it('should render the link', () => {
        const {baseElement, queryByTestId} = render(<HomePageLink />)

        expect(queryByTestId('home-page-link')).not.toBe(null)
        expect(baseElement).toMatchSnapshot()
    })
})
