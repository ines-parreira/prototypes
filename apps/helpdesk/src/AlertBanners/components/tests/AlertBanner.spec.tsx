import React from 'react'

import { render, screen } from '@testing-library/react'

import { AlertBannerTypes } from '../../types'
import { AlertBanner, AlertBannerProps } from '../AlertBanner'
import { CTA } from '../CTA'

jest.mock('../CTA', () => ({
    CTA: jest.fn(() => <div>CTA</div>),
}))

describe('<AlertBanner/>', () => {
    const minProps: AlertBannerProps = {
        message: 'the <b>musketeer</b> is here',
    }

    it('should render the HTML message', () => {
        render(<AlertBanner {...minProps} />)

        expect(
            screen.getByText('musketeer', { selector: 'b' }),
        ).toBeInTheDocument()
    })

    it('should render banner with correct aria-live', () => {
        render(
            <AlertBanner
                {...minProps}
                type={AlertBannerTypes.Critical}
                aria-label="target"
            />,
        )

        expect(screen.getByLabelText('target')).toBeInTheDocument()
    })

    it('should render the node message', () => {
        render(
            <AlertBanner
                {...minProps}
                message={
                    <div>
                        the <b>musketeer</b> is here
                    </div>
                }
            />,
        )

        expect(
            screen.getByText('musketeer', { selector: 'b' }),
        ).toBeInTheDocument()
    })

    it('should call CTA with passed props', () => {
        const CTAProps = {
            text: 'click me',
            type: 'internal',
            to: '/app',
        } as const

        render(<AlertBanner {...minProps} CTA={CTAProps} />)

        expect(CTA).toHaveBeenCalledWith(CTAProps, {})
    })

    it('should render suffix if provided', () => {
        render(<AlertBanner {...minProps} suffix={<div>Suffix</div>} />)

        expect(screen.getByText('Suffix')).toBeInTheDocument()
    })
})
