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

        expect(getByText('Get Convert')).toBeInTheDocument()
        expect(
            queryByText('Subscribe to Convert', {exact: false})
        ).toBeInTheDocument()
    })

    it('should render with custom tagline', () => {
        const propsWithTagline = {
            ...defaultProps,
            tagline: 'Trololo',
        }

        const {getByText} = render(<PaywallPopover {...propsWithTagline} />)

        expect(getByText('Trololo')).toBeInTheDocument()
    })

    it('should not render if closed', () => {
        const {queryByText} = render(
            <PaywallPopover {...defaultProps} isOpened={false} />
        )

        expect(queryByText('Get This Feature')).toBe(null)
    })

    it('should render with custom button content', () => {
        const {getByText, queryByText, getByRole} = render(
            <PaywallPopover
                {...defaultProps}
                buttonContent={'Learn more'}
                buttonClassName={'mt-2'}
            />
        )
        expect(getByText('Learn more')).toBeInTheDocument()
        expect(queryByText('auto_awesome')).toBeNull()

        const button = getByRole('button', {name: 'Learn more'})
        expect(button).toHaveClass('mt-2')
        expect(button).not.toHaveClass('mt-3')
    })
})
