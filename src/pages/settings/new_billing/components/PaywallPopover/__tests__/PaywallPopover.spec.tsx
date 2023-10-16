import {render} from '@testing-library/react'
import React from 'react'
import PaywallPopover from '..'

describe('<PaywallPopover />', () => {
    const defaultProps = {
        featureName: 'Convert',
        iconRef: {
            current: document.createElement('div'),
        },
        onButtonClick: jest.fn(),
        isOpened: true,
        setIsOpened: jest.fn(),
    }

    it('should render', () => {
        const {getByText, queryByText} = render(
            <PaywallPopover {...defaultProps} />
        )

        expect(getByText('Get This Feature')).toBeInTheDocument()
        expect(
            queryByText('Subscribe to the Convert', {exact: false})
        ).toBeInTheDocument()
    })

    it('should not render if closed', () => {
        const {queryByText} = render(
            <PaywallPopover {...defaultProps} isOpened={false} />
        )

        expect(queryByText('Get This Feature')).toBe(null)
    })
})
