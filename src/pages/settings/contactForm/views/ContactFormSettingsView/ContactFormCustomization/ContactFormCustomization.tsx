import classNames from 'classnames'
import React, {useState} from 'react'
import {Container} from 'reactstrap'
import {useDispatch} from 'react-redux'
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
import FlowsBanner from 'pages/settings/contactForm/components/FlowsBanner'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAutomateProduct} from 'state/billing/selectors'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'

const initUpdateDto = (
    subject_lines: ContactForm['subject_lines']
): Pick<UpdateContactFormDto, 'subject_lines'> => {
    return {
        subject_lines: {
            allow_other: !!subject_lines?.allow_other,
            options: subject_lines?.options || [],
        },
    }
}

const ContactFormCustomization = (): JSX.Element => {
    const dispatch = useDispatch()
    const {updateContactForm, isLoading} = useContactFormApi()
    const contactForm = useCurrentContactForm()
    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [updateContactFormDto, setUpdateContactFormDto] = useState<
        Pick<UpdateContactFormDto, 'subject_lines'>
    >(() => initUpdateDto(contactForm.subject_lines))
    const automationProduct = useAppSelector(getCurrentAutomateProduct)

    const {automationSettings, isFetchPending} =
        useContactFormsAutomationSettings(contactForm.id, true)
    const workflows = automationSettings?.workflows || []
    const hasFlowsEnabled =
        workflows.some((workflow) => workflow.enabled) && !isFetchPending

    const discardChanges = () => {
        setUpdateContactFormDto(initUpdateDto(contactForm.subject_lines))
        setIsChangesModalShown(false)
        setIsDirty(false)
    }

    const onSave = async () => {
        if (!updateContactFormDto.subject_lines) return

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
                    {!hasFlowsEnabled && (
                        <FlowsBanner
                            isSubscribedToAutomation={!!automationProduct}
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
