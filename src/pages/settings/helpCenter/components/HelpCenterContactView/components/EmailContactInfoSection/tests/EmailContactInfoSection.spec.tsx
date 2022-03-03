import React from 'react'

import {render} from '@testing-library/react'

import EmailContactInfoSection from '../EmailContactInfoSection'

describe('<EmailContactInfoSection />', () => {
    it('should render the component', () => {
        const {container} = render(<EmailContactInfoSection />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
