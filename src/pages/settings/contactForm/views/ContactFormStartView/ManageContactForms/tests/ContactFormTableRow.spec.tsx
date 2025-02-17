import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {ContactFormFixture} from '../../../../fixtures/contacForm'
import {ContactFormTableRow} from '../ContactFormTableRow'

const mockedLocales = [
    {name: 'English', code: 'en-US'},
    {name: 'Spanish', code: 'es-ES'},
    {name: 'French', code: 'fr-FR'},
    {name: 'German', code: 'de-DE'},
]

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockedLocales,
}))

describe('<ContactFormTableRow />', () => {
    it('should display the name, ecom platform logo and store name, language, and arrow', () => {
        const form = {
            ...ContactFormFixture,
            name: 'Contact Form name',
            shop_name: 'storename',
        }

        const {container} = render(
            <ContactFormTableRow
                key={form.id}
                form={form}
                onClick={jest.fn()}
            />
        )

        screen.getByText(form.name)
        screen.getByText(form.shop_name)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the placeholder label when not connected to a shop', () => {
        const form = {
            ...ContactFormFixture,
            name: 'Contact Form name',
            shop_name: null,
        }

        const {container} = render(
            <ContactFormTableRow
                key={form.id}
                form={form}
                onClick={jest.fn()}
            />
        )

        screen.getByText(form.name)
        screen.getByText(/no store connected/i)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should trigger the onClick function on click', () => {
        const mockedOnClick = jest.fn()
        render(
            <ContactFormTableRow
                key={ContactFormFixture.id}
                form={ContactFormFixture}
                onClick={mockedOnClick}
            />
        )

        const contactFormName = screen.getByText(ContactFormFixture.name)

        userEvent.click(contactFormName)

        expect(mockedOnClick).toHaveBeenCalledTimes(1)
    })
})
