import {screen, render, fireEvent} from '@testing-library/react'
import React from 'react'

import {CTA} from '../CTA'

describe('<CTA/>', () => {
    const onClick = jest.fn()

    const externalCTAProps = {
        type: 'external',
        href: 'https://www.google.com',
        text: 'Google',
        opensInNewTab: true,
        onClick,
    } as const

    const internalCTAProps = {
        type: 'internal',
        to: '/app',
        text: 'App',
        opensInNewTab: true,
        onClick,
    } as const

    const buttonCTAProps = {
        type: 'action',
        text: 'Action',
        onClick,
    } as const

    const CTATypesProps = [externalCTAProps, internalCTAProps, buttonCTAProps]

    it.each(CTATypesProps)('should render CTA with %p', (props) => {
        render(<CTA {...props} />)

        const CTAElement = screen.getByText(props.text)
        fireEvent.click(CTAElement)

        expect(onClick).toHaveBeenCalledTimes(1)

        if (props.type === 'action') {
            expect(CTAElement.closest('button')).toBeTruthy()
        } else {
            expect(CTAElement.tagName).toBe('A')
        }

        if (
            (props.type === 'external' || props.type === 'internal') &&
            props.opensInNewTab
        ) {
            expect(CTAElement).toHaveAttribute('target', '_blank')
            expect(CTAElement).toHaveAttribute('rel', 'noopener noreferrer')
        }
    })
})
