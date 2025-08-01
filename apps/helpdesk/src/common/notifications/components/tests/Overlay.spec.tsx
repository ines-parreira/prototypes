import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import useNotificationsOverlay from '../../hooks/useNotificationsOverlay'
import Overlay from '../Overlay'

import css from '../Overlay.less'

jest.mock('../../hooks/useNotificationsOverlay', () => jest.fn())
const useNotificationsOverlayMock = assumeMock(useNotificationsOverlay)
jest.mock('../Feed', () => () => <div>Feed</div>)

describe('Overlay', () => {
    let onToggle: jest.Mock

    beforeEach(() => {
        onToggle = jest.fn()
        useNotificationsOverlayMock.mockReturnValue([false, onToggle])
    })

    it('should render nothing if the overlay is not visible', () => {
        const { container } = render(<Overlay />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render the backdrop and feed if the overlay is visible', () => {
        useNotificationsOverlayMock.mockReturnValue([true, onToggle])
        const { container } = render(<Overlay />)
        expect(container.firstChild).toHaveClass(css.backdrop)
        expect(screen.getByText('Feed')).toBeInTheDocument()
    })
})
