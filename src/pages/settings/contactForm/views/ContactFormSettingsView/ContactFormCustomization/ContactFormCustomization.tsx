import classNames from 'classnames'
import React, {useState, useMemo} from 'react'
import {Container} from 'reactstrap'
import {useDispatch} from 'react-redux'
import {UpdateContactForm, LocaleCode} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import SubjectLines from 'pages/settings/helpCenter/components/SubjectLines/SubjectLines'
import settingsCss from 'pages/settings/settings.less'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal/PendingChangesModal'
import {CONTACT_FORM_DEFAULT_LOCALE} from 'pages/settings/contactForm/constants'
import {ContactForm, UpdateContactFormDto} from 'models/contactForm/types'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {catchAsync} from 'pages/settings/contactForm/utils/errorHandling'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

const initUpdateDto = (
    subject_lines: ContactForm['subject_lines'],
    currentLocale: LocaleCode
): Pick<UpdateContactForm, 'subject_lines'> => {
    return {
        subject_lines: {
            [currentLocale]: {
                allow_other: !!subject_lines?.allow_other,
                options: subject_lines?.options || [],
            },
        },
    }
}

const ContactFormCustomization = (): JSX.Element => {
    const dispatch = useDispatch()
    const {updateContactForm, isLoading} = useContactFormApi()
    const contactForm = useCurrentContactForm()
    const currentLocale = useMemo<LocaleCode>(() => {
        return contactForm.default_locale || CONTACT_FORM_DEFAULT_LOCALE
    }, [contactForm.default_locale])

    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [updateContactFormDto, setUpdateContactFormDto] = useState<
        Pick<UpdateContactForm, 'subject_lines'>
    >(() => initUpdateDto(contactForm.subject_lines, currentLocale))

    const discardChanges = () => {
        setUpdateContactFormDto(
            initUpdateDto(contactForm.subject_lines, currentLocale)
        )
        setIsChangesModalShown(false)
        setIsDirty(false)
    }

    const onSave = async () => {
        if (!updateContactFormDto.subject_lines) return

        const {allow_other, options} =
            updateContactFormDto.subject_lines[contactForm.default_locale]

        const payload: Pick<UpdateContactFormDto, 'subject_lines'> = {
            subject_lines: {
                allow_other,
                options,
            },
        }

        const [error, result] = await catchAsync(() =>
            updateContactForm(contactForm.id, payload)
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

    const isValid = (
        updateContactFormDto.subject_lines?.[contactForm.default_locale]
            ?.options || []
    ).every((option) => option.trim().length > 1)

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
                <section>
                    <h2
                        className={classNames(
                            contactFormCss.sectionTitle,
                            contactFormCss.mbM
                        )}
                    >
                        Customization
                    </h2>
                    <SubjectLines
                        title="Contact form subject"
                        description="Here is a default list of subject lines. If there is no subject added, the user can freely type any subject."
                        subjectLines={updateContactFormDto.subject_lines || {}}
                        currentLocale={currentLocale}
                        updateContactForm={(
                            payload: React.SetStateAction<UpdateContactForm>
                        ) => {
                            setUpdateContactFormDto(
                                payload as UpdateContactForm
                            )
                        }}
                        setIsDirty={setIsDirty}
                    />
                </section>
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
            </div>
        </Container>
    )
}

export default ContactFormCustomization
