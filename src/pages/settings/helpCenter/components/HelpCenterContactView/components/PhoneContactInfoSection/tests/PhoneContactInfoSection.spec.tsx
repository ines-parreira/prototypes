import React from 'react'
import {render} from '@testing-library/react'
import PhoneContactInfoSection from '../PhoneContactInfoSection'

describe('<PhoneContactInfoSection />', () => {
    it('should render the component', () => {
        const {container} = render(<PhoneContactInfoSection />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
