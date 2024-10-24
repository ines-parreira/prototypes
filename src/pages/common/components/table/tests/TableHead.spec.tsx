import {render} from '@testing-library/react'
import React from 'react'

import TableHead from '../TableHead'

describe('<TableHead/>', () => {
    it('should render', () => {
        const {container} = render(<TableHead className="foo">Foo</TableHead>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
