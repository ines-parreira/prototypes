import { useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    ContactForm,
    UpdateContactFormDto,
    UpdateSubjectLinesProps,
} from 'models/contactForm/types'
import type { ContactFormExtraHTML } from 'pages/common/components/ExtraHtmlSection/ExtraHtmlSection'
import { ExtraHtmlSection } from 'pages/common/components/ExtraHtmlSection/ExtraHtmlSection'
import ContactFormDisplayModeToggle from 'pages/settings/contactForm/components/ContactFormDisplayModeToggle'
import ContactFormEntrypointPreview from 'pages/settings/contactForm/components/ContactFormEntrypointPreview'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import { useContactFormApi } from 'pages/settings/contactForm/hooks/useContactFormApi'
import { useCurrentContactForm } from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import { ContactFormDisplayMode } from 'pages/settings/contactForm/types/formDisplayMode.enum'
import { catchAsync } from 'pages/settings/contactForm/utils/errorHandling'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal'
import SubjectLines from 'pages/settings/helpCenter/components/SubjectLines/SubjectLines'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import ContactFormFlowsBanner from './ContactFormFlowsBanner'

import css from './ContactFormCustomization.less'

const initUpdateDto = (
    subject_lines: ContactForm['subject_lines'],
    form_display_mode: ContactForm['form_display_mode'],
    extra_html: ContactForm['extra_html'],
): Pick<
    UpdateContactFormDto,
    'subject_lines' | 'form_display_mode' | 'extra_html'
> => {
    return {
        subject_lines: {
            allow_other: !!subject_lines?.allow_other,
            options: subject_lines?.options || [],
        },
        form_display_mode: form_display_mode,
        extra_html: extra_html,
    }
}

const ContactFormCustomization = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const { updateContactForm, isLoading } = useContactFormApi()
    const contactForm = useCurrentContactForm()

    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [extraHTML, setExtraHTML] = useState<ContactFormExtraHTML | null>(
        null,
    )
    const [updateContactFormDto, setUpdateContactFormDto] = useState<
        Pick<
            UpdateContactFormDto,
            'subject_lines' | 'form_display_mode' | 'extra_html'
        >
    >(() =>
        initUpdateDto(
            contactForm.subject_lines,
            contactForm.form_display_mode,
            contactForm.extra_html,
        ),
    )
    const [isFormHidden, setIsFormHidden] = useState(
        contactForm.form_display_mode ===
            ContactFormDisplayMode.SHOW_AFTER_BUTTON_CLICK,
    )

    useEffect(() => {
        setExtraHTML({
            extra_head: contactForm?.extra_html?.extra_head ?? '',
            extra_head_deactivated:
                contactForm?.extra_html?.extra_head_deactivated_datetime !==
                null,
        })
        setUpdateContactFormDto((prevState) => ({
            ...prevState,
            extra_html: contactForm?.extra_html,
        }))
    }, [contactForm])

    useEffect(() => {
        setUpdateContactFormDto((prevState) => ({
            ...prevState,
            form_display_mode: isFormHidden
                ? ContactFormDisplayMode.SHOW_AFTER_BUTTON_CLICK
                : ContactFormDisplayMode.SHOW_IMMEDIATELY,
        }))
    }, [isFormHidden])

    const discardChanges = () => {
        setIsFormHidden(
            contactForm.form_display_mode ===
                ContactFormDisplayMode.SHOW_AFTER_BUTTON_CLICK,
        )
        setUpdateContactFormDto(
            initUpdateDto(
                contactForm.subject_lines,
                contactForm.form_display_mode,
                contactForm.extra_html,
            ),
        )
        setExtraHTML({
            extra_head: contactForm?.extra_html?.extra_head ?? '',
            extra_head_deactivated:
                contactForm?.extra_html?.extra_head_deactivated_datetime !==
                null,
        })
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
            !updateContactFormDto.form_display_mode &&
            !updateContactFormDto.extra_html
        )
            return

        const [error, result] = await catchAsync(() =>
            updateContactForm(contactForm.id, updateContactFormDto),
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
            }),
        )

        if (isUpdated) {
            setIsDirty(false)
            setIsChangesModalShown(false)
        }
    }

    const isExtraHtmlToggled = useMemo(() => {
        if (!extraHTML) {
            return false
        }

        return !extraHTML.extra_head_deactivated
    }, [extraHTML])

    const isValid = (updateContactFormDto.subject_lines?.options || []).every(
        (option) => option.trim().length > 1,
    )

    const isSaveChangesEnabled = isValid && isDirty && !isLoading

    return (
        <div className={css.pageContainer}>
            <PendingChangesModal
                when={isDirty}
                show={isChangesModalShown}
                onSave={onSave}
                onDiscard={() => setIsChangesModalShown(false)}
                onContinueEditing={() => setIsChangesModalShown(false)}
            />
            <div className={css.contentWrapper}>
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
                            payload: UpdateSubjectLinesProps,
                        ) => {
                            setUpdateContactFormDto((prevState) => ({
                                ...prevState,
                                subject_lines: payload,
                            }))
                        }}
                        setIsDirty={setIsDirty}
                    />
                </section>
                <section className={contactFormCss.mbL}>
                    <ContactFormDisplayModeToggle
                        title="Expand Contact Form"
                        description="Make your Contact Form visible when customers land
                            on the page or require them to click a button to see the form.
                            Toggling OFF encourages customers to explore self-service
                            options like Flows and Order Management before submitting a ticket
                            to your team."
                        toggleLabel="Expand Contact Form"
                        isToggled={!isFormHidden}
                        handleToggleClick={onToggleClick}
                    />
                </section>
                <ExtraHtmlSection
                    extraHTML={extraHTML}
                    isExtraHtmlToggled={isExtraHtmlToggled}
                    setIsDirty={setIsDirty}
                    setExtraHTML={(updater) => {
                        setExtraHTML(updater)
                        const updatedExtraHTML = updater(extraHTML)
                        if (updatedExtraHTML) {
                            setUpdateContactFormDto((prevState) => ({
                                ...prevState,
                                extra_html: {
                                    extra_head: updatedExtraHTML.extra_head,
                                    extra_head_deactivated_datetime:
                                        updatedExtraHTML.extra_head_deactivated
                                            ? new Date().toISOString()
                                            : null,
                                },
                            }))
                        }
                    }}
                />
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
                    {contactForm.shop_integration && (
                        <ContactFormFlowsBanner
                            contactFormId={contactForm.id}
                            shopName={contactForm.shop_integration.shop_name}
                        />
                    )}
                </section>
            </div>
            <div className={css.preview}>
                <div className={css.previewCenter}>
                    <ContactFormEntrypointPreview
                        contactForm={contactForm}
                        isFormHidden={isFormHidden}
                    />
                </div>
            </div>
        </div>
    )
}

export default ContactFormCustomization
