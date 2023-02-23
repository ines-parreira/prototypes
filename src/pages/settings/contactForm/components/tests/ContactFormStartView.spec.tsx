import {render, screen} from '@testing-library/react'
import React from 'react'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_FORMS_PATH,
} from '../../constants'
import ContactFormStartView from '../ContactFormStartView'

describe('<ContactFormStartView />', () => {
    it('should display nav links correctly', () => {
        const expectedAboutPath = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_ABOUT_PATH}`
        const expectedFormsPath = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_FORMS_PATH}`

        render(<ContactFormStartView />)

        const aboutNavLink = screen.getByText('About')
        const formsNavLink = screen.getByText('Forms')

        expect(aboutNavLink).toHaveAttribute('href', expectedAboutPath)
        expect(formsNavLink).toHaveAttribute('href', expectedFormsPath)
    })
})
