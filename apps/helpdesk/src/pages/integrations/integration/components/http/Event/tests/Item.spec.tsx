import React from 'react'

import { render } from '@testing-library/react'

import Item from '../Item'

describe('Item', () => {
    it('should render its name with an empty label because it has no value and children', () => {
        const { container } = render(<Item name="foo" />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render its name with an empty label because its value equals `null`', () => {
        const { container } = render(<Item name="foo" value={null} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render its name with an empty label because its value equals `null` (even with a children)', () => {
        const { container } = render(
            <Item name="foo" value={null}>
                <span>bar</span>
            </Item>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render its name with its children', () => {
        const { container } = render(
            <Item name="foo">
                <span>bar</span>
            </Item>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render its name with its children instead of displaying its value', () => {
        const { container } = render(
            <Item name="foo" value="bar">
                <span>bar</span>
            </Item>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
