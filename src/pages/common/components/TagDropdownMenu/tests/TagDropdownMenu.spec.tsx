import React from 'react'

import { render } from '@testing-library/react'

import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'

describe('TagDropdownMenu', () => {
    it('should overwrite width style', () => {
        const customStyle = {
            width: '500px',
            backgroundColor: 'rgb(18, 52, 86)',
        }

        render(<TagDropdownMenu style={customStyle} />)
        const menu = document.querySelector('.dropdown-menu')

        expect(menu).not.toBeNull()
        expect(menu).not.toHaveStyle({ width: customStyle.width })
        if (menu !== null) {
            expect(window.getComputedStyle(menu)).not.toMatchObject({
                width: customStyle.width,
            })
            expect(window.getComputedStyle(menu)).toMatchObject({
                backgroundColor: customStyle.backgroundColor,
            })
        }
    })

    it('should pass props', () => {
        const { container } = render(<TagDropdownMenu foo="bar" />)

        expect(container.firstChild).toHaveAttribute('foo', 'bar')
    })
})
