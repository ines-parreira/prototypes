import {render} from '@testing-library/react'
import React from 'react'

import TableBody from '../TableBody'

describe('<TableBody/>', () => {
    it('should render', () => {
        const {container} = render(<TableBody className="foo">Foo</TableBody>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
