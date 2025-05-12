import React, { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import {
    Link,
    NavLink,
    Redirect,
    Route,
    Switch,
    useHistory,
} from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import dotError from 'assets/img/icons/dot-error.svg'
import { TicketChannel } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import {
    CONTACT_FORM_AUTOMATE_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_MANAGE_EMBEDMENTS_PATH,
    CONTACT_FORM_PAGE_TITLE,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
} from 'pages/settings/contactForm/constants'
import { CurrentContactFormContext } from 'pages/settings/contactForm/contexts/currentContactForm.context'
import { useContactFormApi } from 'pages/settings/contactForm/hooks/useContactFormApi'
import { useContactFormIdParam } from 'pages/settings/contactForm/hooks/useCurrentContactFormId'
import { catchAsync } from 'pages/settings/contactForm/utils/errorHandling'
import { insertContactFormIdParam } from 'pages/settings/contactForm/utils/navigation'
import ContactFormCustomization from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormCustomization'
import ContactFormPreferences from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPreferences'
import ContactFormPublish from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish'
import settingsCss from 'pages/settings/settings.less'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentContactForm } from 'state/entities/contactForm/contactForms'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { changeContactFormId } from 'state/ui/contactForm'

import { ContactFormAutomateView } from './ContactFormAutomateView'

import css from './ContactFormSettingsView.less'

const navLinks = {
    Preferences: CONTACT_FORM_PREFERENCES_PATH,
    Customization: CONTACT_FORM_CUSTOMIZATION_PATH,
    Publish: CONTACT_FORM_PUBLISH_PATH,
}

const ContactFormSettingsView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { fetchContactFormById, isReady } = useContactFormApi()
    const { id: contactFormId, isValid: isIdValid } = useContactFormIdParam()
    const contactForm = useAppSelector(getCurrentContactForm)
    const hasAutomate = useAppSelector(getHasAutomate)
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

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
                fetchContactFormById(contactFormId),
            )

            if (!error && !!result) return

            void dispatch(
                notify({
                    message:
                        result === null
                            ? 'Contact Form not found'
                            : 'Something went wrong',
                    status: NotificationStatus.Error,
                }),
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
            <div className={settingsCss.pageContainer}>
                <Loader />
            </div>
        )
    }

    const onPreview = () => {
        window.open(contactForm.url_template, '_blank')?.focus()
    }

    const logContactFormEvent = (version: string) => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingButtonClicked, {
            channel: TicketChannel.ContactForm,
            version,
        })
    }

    return (
        <div className="full-width">
            <PageHeader
                className={css.pageHeader}
                title={
                    <Breadcrumb className={css.breadcrumbContainer}>
                        <BreadcrumbItem>
                            <Link
                                aria-label="base-path"
                                to={CONTACT_FORM_BASE_PATH}
                            >
                                {CONTACT_FORM_PAGE_TITLE}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem
                            className={css.breadcrumbEllipsis}
                            active
                        >
                            {contactForm.name}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <div className={css.header}>
                    {!changeAutomateSettingButtomPosition &&
                        (hasAutomate ? (
                            !contactForm.shop_name && (
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    onClick={() => {
                                        history.push(
                                            `/app/settings/contact-form/${contactForm.id}/preferences`,
                                        )
                                    }}
                                >
                                    <ButtonIconLabel
                                        icon="warning"
                                        className={css.connectStoreWarning}
                                    >
                                        Connect store to enable AI Agent
                                    </ButtonIconLabel>
                                </Button>
                            )
                        ) : (
                            <>
                                <AutomateSubscriptionButton
                                    fillStyle="ghost"
                                    label="Upgrade your contact form with automate"
                                    onClick={() =>
                                        setIsAutomationModalOpened(true)
                                    }
                                />
                                <AutomateSubscriptionModal
                                    confirmLabel="Subscribe"
                                    isOpen={isAutomationModalOpened}
                                    onClose={() =>
                                        setIsAutomationModalOpened(false)
                                    }
                                />
                            </>
                        ))}
                    <Button
                        aria-label="contact form preview"
                        intent="secondary"
                        onClick={onPreview}
                        leadingIcon="open_in_new"
                    >
                        View Contact Form
                    </Button>
                </div>
            </PageHeader>
            <SecondaryNavbar>
                {Object.entries({
                    ...navLinks,
                    ...(hasAutomate
                        ? { Automate: CONTACT_FORM_AUTOMATE_PATH }
                        : {}),
                }).map(([name, to]) => (
                    <NavLink
                        key={name}
                        to={insertContactFormIdParam(to, contactFormId)}
                    >
                        {name}
                        {name === 'Automate' && !contactForm.shop_name && (
                            <img
                                alt="status icon"
                                src={dotError}
                                className={css.redDot}
                            />
                        )}
                    </NavLink>
                ))}
                {changeAutomateSettingButtomPosition &&
                    (hasAutomate ? (
                        <>
                            {!contactForm.shop_name && (
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    onClick={() => {
                                        logContactFormEvent('Store')
                                        history.push(
                                            `/app/settings/contact-form/${contactForm.id}/preferences`,
                                        )
                                    }}
                                >
                                    <ButtonIconLabel
                                        icon="warning"
                                        className={css.connectStoreWarning}
                                    >
                                        Connect Store
                                    </ButtonIconLabel>
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <AutomateSubscriptionButton
                                fillStyle="ghost"
                                label="Upgrade to AI Agent"
                                onClick={() => {
                                    logContactFormEvent('Upsell')
                                    setIsAutomationModalOpened(true)
                                }}
                            />
                            <AutomateSubscriptionModal
                                confirmLabel="Subscribe"
                                isOpen={isAutomationModalOpened}
                                onClose={() => {
                                    setIsAutomationModalOpened(false)
                                }}
                            />
                        </>
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
                        path={CONTACT_FORM_AUTOMATE_PATH}
                        component={ContactFormAutomateView}
                    />
                    <Route
                        exact
                        path={[
                            CONTACT_FORM_PUBLISH_PATH,
                            CONTACT_FORM_MANAGE_EMBEDMENTS_PATH,
                        ]}
                        component={ContactFormPublish}
                    />
                    {!isIdValid ? null : (
                        <Route
                            component={() => (
                                <Redirect
                                    to={insertContactFormIdParam(
                                        CONTACT_FORM_CUSTOMIZATION_PATH,
                                        contactFormId,
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
