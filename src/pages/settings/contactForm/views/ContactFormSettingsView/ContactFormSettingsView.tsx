import React, {useEffect} from 'react'
import {
    Link,
    NavLink,
    Redirect,
    Route,
    Switch,
    useHistory,
} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_PAGE_TITLE,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
} from 'pages/settings/contactForm/constants'
import {CurrentContactFormContext} from 'pages/settings/contactForm/contexts/currentContactForm.context'
import {useContactFormIdParam} from 'pages/settings/contactForm/hooks/useCurrentContactFormId'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import ContactFormCustomization from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormCustomization'
import ContactFormPreferences from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPreferences'
import ContactFormPublish from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentContactForm} from 'state/entities/contactForm/contactForms'
import settingsCss from 'pages/settings/settings.less'
import Loader from 'pages/common/components/Loader/Loader'
import useAppSelector from 'hooks/useAppSelector'
import {changeContactFormId} from 'state/ui/contactForm'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {catchAsync} from 'pages/settings/contactForm/utils/errorHandling'

const navLinks = {
    Preferences: CONTACT_FORM_PREFERENCES_PATH,
    Customization: CONTACT_FORM_CUSTOMIZATION_PATH,
    Publish: CONTACT_FORM_PUBLISH_PATH,
}

const ContactFormSettingsView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const {fetchContactFormById, isReady} = useContactFormApi()
    const {id: contactFormId, isValid: isIdValid} = useContactFormIdParam()
    const contactForm = useAppSelector(getCurrentContactForm)

    useEffect(() => {
        if (!isIdValid) return history.push(CONTACT_FORM_BASE_PATH)
        dispatch(changeContactFormId(contactFormId))
        return () => {
            dispatch(changeContactFormId(null))
        }
    }, [contactFormId, isIdValid, history, dispatch])

    useEffect(() => {
        if (!isReady || !isIdValid) return

        void (async () => {
            const [error, result] = await catchAsync(() =>
                fetchContactFormById(contactFormId)
            )

            if (!error && !!result) return

            void dispatch(
                notify({
                    message:
                        result === null
                            ? 'Contact Form not found'
                            : 'Something went wrong',
                    status: NotificationStatus.Error,
                })
            )

            history.push(CONTACT_FORM_BASE_PATH)
        })()
    }, [
        isReady,
        fetchContactFormById,
        contactFormId,
        isIdValid,
        history,
        dispatch,
    ])

    if (!contactForm) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <Loader />
            </Container>
        )
    }

    const onPreview = () => {
        window.open(contactForm.url_template, '_blank')?.focus()
    }

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
                        path={CONTACT_FORM_CUSTOMIZATION_PATH}
                        component={ContactFormCustomization}
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
                                        CONTACT_FORM_CUSTOMIZATION_PATH,
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
