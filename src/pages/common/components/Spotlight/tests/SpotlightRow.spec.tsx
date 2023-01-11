import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as platform from 'utils/platform'

import SpotlightRow from '../SpotlightRow'

describe('<SpotlightRow/>', () => {
    const mockOnClose = jest.fn()
    const minProps: ComponentProps<typeof SpotlightRow> = {
        title: 'This is the title',
        info: 'And this is the info!',
        link: '/app/foo',
        onCloseModal: mockOnClose,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with minimal props', () => {
        const {container} = render(<SpotlightRow {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render with icon', () => {
        const {container} = render(<SpotlightRow {...minProps} icon={'🚀'} />)
        expect(container).toMatchSnapshot()
    })

    it('should shrink info flex container', () => {
        const {container} = render(
            <SpotlightRow {...minProps} shrinkInfo={true} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should close modal on click if user is not pressing on ctrl / cmd', () => {
        const {container} = render(<SpotlightRow {...minProps} />)
        userEvent.click(container.firstChild! as Element)
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal on click if user is pressing on ctrl on a non-mac device', () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: false,
            writable: true,
        })
        const {container} = render(<SpotlightRow {...minProps} />)
        userEvent.click(container.firstChild! as Element, {ctrlKey: true})
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should close modal on click if user is pressing on command on a mac device', () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        const {container} = render(<SpotlightRow {...minProps} />)
        userEvent.click(container.firstChild! as Element, {metaKey: true})
        expect(mockOnClose).not.toHaveBeenCalled()
    })
})
