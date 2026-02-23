import React from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import useNotificationsOverlay from '../../hooks/useNotificationsOverlay'
import Overlay from '../Overlay'

import css from '../Overlay.less'

jest.mock('../../hooks/useNotificationsOverlay', () => jest.fn())
jest.mock('@repo/feature-flags', () => ({
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))

const useNotificationsOverlayMock = assumeMock(useNotificationsOverlay)
const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
jest.mock('../Feed', () => () => <div>Feed</div>)

describe('Overlay', () => {
    let onToggle: jest.Mock

    beforeEach(() => {
        onToggle = jest.fn()
        useNotificationsOverlayMock.mockReturnValue([false, onToggle])
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
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

    it('should not apply legacy class when wayfinding flag is enabled', () => {
        useNotificationsOverlayMock.mockReturnValue([true, onToggle])
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)

        const { container } = render(<Overlay />)
        const overlayContainer = container.querySelector(`.${css.container}`)

        expect(overlayContainer).toBeInTheDocument()
        expect(overlayContainer).not.toHaveClass(css.legacy)
    })

    it('should apply legacy class when wayfinding flag is disabled', () => {
        useNotificationsOverlayMock.mockReturnValue([true, onToggle])
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)

        const { container } = render(<Overlay />)
        const overlayContainer = container.querySelector(`.${css.container}`)

        expect(overlayContainer).toBeInTheDocument()
        expect(overlayContainer).toHaveClass(css.legacy)
    })
})
