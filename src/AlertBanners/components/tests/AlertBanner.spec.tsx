import {fireEvent, screen, render} from '@testing-library/react'
import React from 'react'

import {AlertBannerTypes} from '../../types'
import {AlertBanner, AlertBannerProps} from '../AlertBanner'
import {CTA} from '../CTA'

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
            screen.getByText('musketeer', {selector: 'b'})
        ).toBeInTheDocument()
    })

    it('should render banner with correct aria-live', () => {
        const {rerender} = render(
            <AlertBanner
                {...minProps}
                type={AlertBannerTypes.Critical}
                aria-label="target"
            />
        )

        expect(screen.getByLabelText('target')).toHaveAttribute(
            'aria-live',
            'assertive'
        )

        rerender(
            <AlertBanner
                {...minProps}
                type={AlertBannerTypes.Info}
                aria-label="target"
            />
        )

        expect(screen.getByLabelText('target')).toHaveAttribute(
            'aria-live',
            'polite'
        )
    })

    it('should render icon before message', () => {
        render(<AlertBanner {...minProps} />)

        const infoIcon = screen.getByText('info')
        const message = screen.getByText('musketeer')

        expect(
            infoIcon.compareDocumentPosition(message) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
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
            />
        )

        expect(
            screen.getByText('musketeer', {selector: 'b'})
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

    it('should have a close button and call it on click', () => {
        const onClose = jest.fn()

        const {getByText} = render(
            <AlertBanner {...minProps} onClose={onClose} />
        )

        fireEvent.click(getByText('close'))
        expect(onClose).toHaveBeenCalledWith()
    })
})
