import React from 'react'

import { render } from '@testing-library/react'

import Errors from '../Errors'

describe('Errors', () => {
    it('render children', () => {
        const { container } = render(<Errors>text</Errors>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
