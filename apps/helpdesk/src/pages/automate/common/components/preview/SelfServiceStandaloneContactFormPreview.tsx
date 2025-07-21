import React, { memo } from 'react'

import { Route, useLocation } from 'react-router-dom'

import { ContactForm } from 'models/contactForm/types'
import StandaloneContactFormPreview from 'pages/settings/contactForm/components/StandaloneContactFormPreview/StandaloneContactFormPreview'
import { ContactFormDisplayMode } from 'pages/settings/contactForm/types/formDisplayMode.enum'

import { SELF_SERVICE_PREVIEW_ROUTES } from './constants'
import SelfServiceStandaloneContactFormHomePage from './SelfServiceStandaloneContactFormHomePage'

type Props = {
    contactForm: ContactForm
}

const SelfServiceStandaloneContactFormPreview = (props: Props) => {
    const { contactForm } = props
    const location = useLocation()
    const isFormHidden =
        contactForm.form_display_mode ===
        ContactFormDisplayMode.SHOW_AFTER_BUTTON_CLICK

    return (
        <StandaloneContactFormPreview>
            <React.Fragment key={location.key}>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.HOME} exact>
                    <SelfServiceStandaloneContactFormHomePage
                        locale={props.contactForm.default_locale}
                        formIsHidden={isFormHidden}
                    />
                </Route>
            </React.Fragment>
        </StandaloneContactFormPreview>
    )
}

export default memo(SelfServiceStandaloneContactFormPreview)
