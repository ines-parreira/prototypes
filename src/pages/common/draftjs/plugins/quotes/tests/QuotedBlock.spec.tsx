import React from 'react'
import {render} from '@testing-library/react'

import QuotedBlock from '../QuotedBlock'

describe('<QuotedBlock />', () => {
    it('should render the quoted block', () => {
        const {container} = render(<QuotedBlock depth={3}>Foo</QuotedBlock>)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an empty div if no valid element would be produced', () => {
        const {container} = render(<QuotedBlock depth={-1}>Foo</QuotedBlock>)
        expect(container.firstChild).toMatchSnapshot()
    })
})
