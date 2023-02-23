import React from 'react'
import {NavLink} from 'react-router-dom'
import PageHeader from '../../../common/components/PageHeader'
import SecondaryNavbar from '../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_PAGE_TITLE,
} from '../constants'

const ContactFormStartView: React.FC = () => {
    const navAboutPath = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_ABOUT_PATH}`
    const navFormsPath = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_FORMS_PATH}`

    return (
        <div className="full-width">
            <PageHeader title={CONTACT_FORM_PAGE_TITLE} />
            <SecondaryNavbar>
                <NavLink exact to={navAboutPath}>
                    About
                </NavLink>
                <NavLink exact to={navFormsPath}>
                    Forms
                </NavLink>
            </SecondaryNavbar>
        </div>
    )
}

export default ContactFormStartView
