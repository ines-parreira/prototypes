import {render, screen} from '@testing-library/react'
import React from 'react'

import {CardHeaderIcon} from '../CardHeaderIcon'

describe('<CardHeaderIcon/>', () => {
    const props = {
        alt: 'Foo',
        src: 'foo.png',
    }

    it('should set container class', () => {
        render(<CardHeaderIcon {...props} />)

        expect(screen.getByAltText(props.alt)).toHaveClass('container')
    })

    it('should render an image with correct src and alt attributes', () => {
        render(<CardHeaderIcon {...props} />)

        expect(screen.getByAltText(props.alt).getAttribute('src')).toBe(
            props.src
        )
    })

    it('should render with background color matching color prop', () => {
        const color = 'rgb(1, 1, 1)'
        render(<CardHeaderIcon {...props} color={color} />)

        expect(screen.getByAltText(props.alt).style.backgroundColor).toBe(color)
    })
})
