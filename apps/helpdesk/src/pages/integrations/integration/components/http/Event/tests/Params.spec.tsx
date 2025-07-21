import React from 'react'

import { render } from '@testing-library/react'

import Params from '../Params'

describe('Params', () => {
    it('should not render the component because it has no params', () => {
        const { container } = render(<Params />)
        expect(container.firstChild).toBeNull()
    })

    it('should render the given params', () => {
        const { container } = render(
            <Params
                params={{
                    params1: 'value1',
                    params2: 'value2',
                }}
            />,
        )
        expect(container).toMatchSnapshot()
    })
})
