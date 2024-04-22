import classNames from 'classnames'
import React, {useEffect, useState} from 'react'
import {Container} from 'reactstrap'
import {useDispatch} from 'react-redux'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import SubjectLines from 'pages/settings/helpCenter/components/SubjectLines/SubjectLines'
import settingsCss from 'pages/settings/settings.less'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal'
import {
    ContactForm,
    UpdateContactFormDto,
    UpdateSubjectLinesProps,
} from 'models/contactForm/types'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {catchAsync} from 'pages/settings/contactForm/utils/errorHandling'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import ContactFormDisplayModeToggle from 'pages/settings/contactForm/components/ContactFormDisplayModeToggle'
import {ContactFormDisplayMode} from 'pages/settings/contactForm/types/formDisplayMode.enum'
import {FeatureFlagKey} from 'config/featureFlags'
import ContactFormFlowsBanner from './ContactFormFlowsBanner'

const initUpdateDto = (
    subject_lines: ContactForm['subject_lines'],
    form_display_mode: ContactForm['form_display_mode']
): Pick<UpdateContactFormDto, 'subject_lines' | 'form_display_mode'> => {
    return {
        subject_lines: {
            allow_other: !!subject_lines?.allow_other,
            options: subject_lines?.options || [],
        },
        form_display_mode: form_display_mode,
    }
}

const ContactFormCustomization = (): JSX.Element => {
    const dispatch = useDispatch()
    const {updateContactForm, isLoading} = useContactFormApi()
    const contactForm = useCurrentContactForm()
    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [updateContactFormDto, setUpdateContactFormDto] = useState<
        Pick<UpdateContactFormDto, 'subject_lines' | 'form_display_mode'>
    >(() =>
        initUpdateDto(contactForm.subject_lines, contactForm.form_display_mode)
    )
    const [isFormHidden, setIsFormHidden] = useState(
        contactForm.form_display_mode ===
            ContactFormDisplayMode.SHOW_AFTER_BUTTON_CLICK
    )
    const isContactFormNewEntrypointViewEnabled =
        useFlags()[FeatureFlagKey.ContactFormNewEntrypointView] || false

    useEffect(() => {
        setUpdateContactFormDto({
            form_display_mode: isFormHidden
                ? ContactFormDisplayMode.SHOW_AFTER_BUTTON_CLICK
                : ContactFormDisplayMode.SHOW_IMMEDIATELY,
        })
    }, [isFormHidden])

    const discardChanges = () => {
        setUpdateContactFormDto(
            initUpdateDto(
                contactForm.subject_lines,
                contactForm.form_display_mode
            )
        )
        setIsChangesModalShown(false)
        setIsDirty(false)
    }

    const onToggleClick = () => {
        setIsDirty(true)
        setIsFormHidden(!isFormHidden)
    }

    const onSave = async () => {
        if (
            !updateContactFormDto.subject_lines &&
            !updateContactFormDto.form_display_mode
        )
            return

        const [error, result] = await catchAsync(() =>
            updateContactForm(contactForm.id, updateContactFormDto)
        )
        const isUpdated = !error && result

        dispatch(
            notifyAction({
                status: isUpdated
                    ? NotificationStatus.Success
                    : NotificationStatus.Error,
                message: isUpdated
                    ? 'Contact form updated successfully'
                    : 'Failed to update the Contact Form',
            })
        )

        if (isUpdated) {
            setIsDirty(false)
            setIsChangesModalShown(false)
        }
    }

    const isValid = (updateContactFormDto.subject_lines?.options || []).every(
        (option) => option.trim().length > 1
    )

    const isSaveChangesEnabled = isValid && isDirty && !isLoading

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <PendingChangesModal
                when={isDirty}
                show={isChangesModalShown}
                onSave={onSave}
                onDiscard={() => setIsChangesModalShown(false)}
                onContinueEditing={() => setIsChangesModalShown(false)}
            />
            <div className={settingsCss.contentWrapper}>
                <section className={contactFormCss.mbM}>
                    <h2 className={classNames(contactFormCss.sectionTitle)}>
                        Customization
                    </h2>
                </section>
                <section className={contactFormCss.mbL}>
                    <SubjectLines
                        title="Contact form subject"
                        description="Here is a default list of subject lines. If there is no subject added, the user can freely type any subject."
                        subjectLines={
                            updateContactFormDto.subject_lines || null
                        }
                        updateSubjectLines={(
                            payload: UpdateSubjectLinesProps
                        ) => {
                            setUpdateContactFormDto({
                                subject_lines: payload,
                            })
                        }}
                        setIsDirty={setIsDirty}
                    />
                </section>
                {isContactFormNewEntrypointViewEnabled && (
                    <section className={contactFormCss.mbL}>
                        <ContactFormDisplayModeToggle
                            title="Expandable Contact Form"
                            description="This feature hides the form behind a button,
                            requiring shoppers to click to view it. This
                            minimizes form submissions and ensures that
                            customers explore other options, such as order
                            management or custom flows, before reaching out
                            directly."
                            toggleLabel="Enable expandable contact form"
                            isToggled={isFormHidden}
                            handleToggleClick={onToggleClick}
                        />
                    </section>
                )}
                <div className={contactFormCss.mtXl}>
                    <Button isDisabled={!isSaveChangesEnabled} onClick={onSave}>
                        Save Changes
                    </Button>
                    <Button
                        onClick={() => discardChanges()}
                        className={contactFormCss.mlXs}
                        intent="secondary"
                    >
                        Cancel
                    </Button>
                </div>
                <section className={contactFormCss.mtXl}>
                    {contactForm.shop_name && (
                        <ContactFormFlowsBanner
                            contactFormId={contactForm.id}
                            shopName={contactForm.shop_name}
                        />
                    )}
                </section>
            </div>
        </Container>
    )
}

export default ContactFormCustomization
