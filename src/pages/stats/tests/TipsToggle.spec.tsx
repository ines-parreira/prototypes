import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import TipsToggle from '../TipsToggle'

describe('<TipsToggle />', () => {
    const defaultProps = {
        isVisible: true,
        onClick: jest.fn(),
    }

    it('should render the tips toggle', () => {
        const {container} = render(<TipsToggle {...defaultProps} />)

        expect(container).toMatchSnapshot()
    })

    it('should call onClick when clicking the tooltip', () => {
        const {getByText} = render(<TipsToggle {...defaultProps} />)

        fireEvent.click(getByText('Hide tips'))
        expect(defaultProps.onClick).toHaveBeenNthCalledWith(1, false)
    })
})
