import React from 'react'
import {render} from '@testing-library/react'

import Button from '../Button'

describe('<Button />', () => {
    it('should render a button', () => {
        const {container} = render(<Button />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when loading', () => {
        const {container} = render(<Button isLoading />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
