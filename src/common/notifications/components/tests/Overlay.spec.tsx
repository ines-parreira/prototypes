import {render, screen} from '@testing-library/react'
import React from 'react'

import Overlay from '../Overlay'
import css from '../Overlay.less'

jest.mock('../Feed', () => () => <div>Feed</div>)

describe('Overlay', () => {
    let onClose: jest.Mock

    beforeEach(() => {
        onClose = jest.fn()
    })

    it('should render nothing if the overlay is not visible', () => {
        const {container} = render(<Overlay onClose={onClose} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render the backdrop if the overlay is visible', () => {
        const {container} = render(<Overlay isVisible onClose={onClose} />)
        expect(container.firstChild).toHaveClass(css.backdrop)
    })

    it('should render the feed if the overlay is visible', () => {
        render(<Overlay isVisible onClose={onClose} />)
        expect(screen.getByText('Feed')).toBeInTheDocument()
    })
})
