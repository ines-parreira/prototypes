import {render} from '@testing-library/react'
import React from 'react'

import LinkButton from '../LinkButton'

describe('<LinkButton />', () => {
    it('should render a link button', () => {
        const {container} = render(<LinkButton>foo</LinkButton>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
