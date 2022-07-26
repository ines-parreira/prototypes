import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import standlonePreview from 'assets/img/presentationals/standalone-self-service-portal.png'

import {Banner} from '../Banner'

const minProps = {
    children: (
        <span>
            Customize your help center to look and feel like your brand by
            adding a logo, background image, your brand color and fonts, and
            more! Use your <a href="#">help center’s live URL</a> to redirect
            shoppers to self-service.
        </span>
    ),
    preview: <img src={standlonePreview} alt="" />,
    title: 'We created a help center for sfbicycles to help you get started.',
}

describe('<Banner />', () => {
    it('matches the snapshot', () => {
        const {container} = render(<Banner {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    describe('it is dismissible', () => {
        ;``
        const onCloseFn = jest.fn()

        it('renders the close icon', () => {
            const {getByAltText} = render(
                <Banner {...minProps} dismissible onClose={onCloseFn} />
            )
            expect(getByAltText('dismiss-icon')).toBeDefined()
        })

        it('calls the callback when the icon is pressed', () => {
            const {getByAltText} = render(
                <Banner {...minProps} dismissible onClose={onCloseFn} />
            )
            fireEvent.click(getByAltText('dismiss-icon'))
            expect(onCloseFn).toHaveBeenCalled()
        })
    })
})
