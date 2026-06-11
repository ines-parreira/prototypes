import React from 'react'

import { render } from '@repo/testing'

import { DefaultExportDropdownBody as DropdownBody } from '../DropdownBody'

describe('<DropdownBody />', () => {
    it('should render', () => {
        const { container } = render(<DropdownBody>Bar</DropdownBody>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when loading', () => {
        const { container } = render(<DropdownBody isLoading>Bar</DropdownBody>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
