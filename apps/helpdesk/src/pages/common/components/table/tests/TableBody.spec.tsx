import React from 'react'

import { render } from '@repo/testing'

import { DefaultExportTableBody as TableBody } from '../TableBody'

describe('<TableBody/>', () => {
    it('should render', () => {
        const { container } = render(<TableBody className="foo">Foo</TableBody>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
