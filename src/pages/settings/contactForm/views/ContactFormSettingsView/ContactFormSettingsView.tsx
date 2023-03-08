import React, {useEffect} from 'react'
import {
    Link,
    NavLink,
    Redirect,
    Route,
    Switch,
    useHistory,
} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {
    CONTACT_FORM_APPEARANCE_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_PAGE_TITLE,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
} from 'pages/settings/contactForm/constants'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm.fixture'
import {useContactFormIdParam} from 'pages/settings/contactForm/hooks/useCurrentContactFormId'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import ContactFormAppearance from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormAppearance'
import ContactFormPreferences from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPreferences'
import ContactFormPublish from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish'

const navLinks = {
    Preferences: CONTACT_FORM_PREFERENCES_PATH,
    Appearance: CONTACT_FORM_APPEARANCE_PATH,
    Publish: CONTACT_FORM_PUBLISH_PATH,
}

const ContactFormSettingsView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const {id: contactFormId, isValid: isIdValid} = useContactFormIdParam()
    // TODO: take contact form via API
    const contactForm = ContactFormFixture

    const onPreview = () => {
        // TODO: proper preview
        window.open(CONTACT_FORM_BASE_PATH, '_blank')?.focus()
    }

    useEffect(() => {
        if (!isIdValid) history.push(CONTACT_FORM_BASE_PATH)
    }, [isIdValid, history, dispatch])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                aria-label="base-path"
                                to={CONTACT_FORM_BASE_PATH}
                            >
                                {CONTACT_FORM_PAGE_TITLE}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {contactForm.name}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button
                    aria-label="contact form preview"
                    intent="secondary"
                    onClick={onPreview}
                >
                    <ButtonIconLabel icon="open_in_new">
                        Preview
                    </ButtonIconLabel>
                </Button>
            </PageHeader>
            <SecondaryNavbar>
                {Object.entries(navLinks).map(([name, to]) => (
                    <NavLink
                        exact
                        key={name}
                        to={insertContactFormIdParam(to, contactFormId)}
                    >
                        {name}
                    </NavLink>
                ))}
            </SecondaryNavbar>
            <CurrentContactFormContext.Provider value={contactForm}>
                <Switch>
                    <Route
                        exact
                        path={CONTACT_FORM_PREFERENCES_PATH}
                        component={ContactFormPreferences}
                    />
                    <Route
                        exact
                        path={CONTACT_FORM_APPEARANCE_PATH}
                        component={ContactFormAppearance}
                    />
                    <Route
                        exact
                        path={CONTACT_FORM_PUBLISH_PATH}
                        component={ContactFormPublish}
                    />
                    {!isIdValid ? null : (
                        <Route
                            component={() => (
                                <Redirect
                                    to={insertContactFormIdParam(
                                        CONTACT_FORM_APPEARANCE_PATH,
                                        contactFormId
                                    )}
                                />
                            )}
                        />
                    )}
                </Switch>
            </CurrentContactFormContext.Provider>
        </div>
    )
}

export default ContactFormSettingsView
