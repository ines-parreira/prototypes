import React from 'react'

import { render } from '@testing-library/react'

import { Drawer } from '../Drawer'

describe('<Drawer/>', () => {
    const props = {
        open: true,
        name: 'test',
        fullscreen: false,
        isLoading: false,
        onBackdropClick: jest.fn(),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const { container } = render(<Drawer {...props}>Modal content</Drawer>)
        expect(container).toMatchSnapshot()
    })

    it('should display the component in fullscreen mode correctly', () => {
        const { container } = render(
            <Drawer {...props} fullscreen={true}>
                Modal content
            </Drawer>,
        )
        expect(container).toMatchSnapshot()
        const drawer = container.querySelector('.drawer')
        expect(drawer).not.toHaveClass('withoutFooter')
    })

    it('should apply custom backdrop styles when provided', () => {
        const backdropClassName = 'filter: blur(2px)'

        const { container } = render(
            <Drawer {...props} backdropClassName={backdropClassName}>
                Modal content
            </Drawer>,
        )

        const backdrop = container.querySelector('.backdrop')
        expect(backdrop).toHaveClass(backdropClassName)
    })

    it('should render without footer when withFooter is false', () => {
        const { container } = render(
            <Drawer {...props} withFooter={false}>
                Modal content
            </Drawer>,
        )

        const drawer = container.querySelector('.drawer')
        expect(drawer).toHaveClass('withoutFooter')
    })
})
