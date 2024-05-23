import React from 'react'
import {render} from '@testing-library/react'

import Button from '../Button'

describe('<Button />', () => {
    it('should render button label', () => {
        const buttonLabel = 'button label'
        const {getByText} = render(<Button>{buttonLabel}</Button>)

        expect(getByText(buttonLabel)).toBeInTheDocument()
    })

    it('should render a spinner when loading', () => {
        const {getByRole} = render(<Button isLoading />)

        expect(getByRole('status')).toBeInTheDocument()
    })

    it('should not wrap the children in span when child is a component', () => {
        const innerText = 'foo'
        const {getByText, container} = render(
            <Button>
                <i>{innerText}</i>
            </Button>
        )

        const innerTextWrapper = getByText(innerText)

        expect(innerTextWrapper.parentElement).toBe(container.firstChild)
    })

    it('should wrap the children in span when child is a text', () => {
        const innerText = 'foo'
        const {getByText, container} = render(<Button>{innerText}</Button>)

        const innerTextWrapper = getByText(innerText)

        expect(innerTextWrapper).toBe(container.firstChild?.firstChild)
        expect(innerTextWrapper.nodeName.toLowerCase()).toBe('span')
    })
})
