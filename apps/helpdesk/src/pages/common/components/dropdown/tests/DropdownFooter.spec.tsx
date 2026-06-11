import React from 'react'

import { render } from '@repo/testing'

import { DefaultExportDropdownFooter as DropdownFooter } from '../DropdownFooter'

describe('<DropdownFooter />', () => {
    it('should render', () => {
        const { container } = render(<DropdownFooter>Foo</DropdownFooter>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
