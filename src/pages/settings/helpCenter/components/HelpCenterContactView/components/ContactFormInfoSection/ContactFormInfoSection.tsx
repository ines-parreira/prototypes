import React, {useState} from 'react'
import {useLocalStorage} from 'react-use'

import * as integrationsSelectors from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {EmailContactInfoDto} from 'models/helpCenter/types'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import TextArea from 'pages/common/forms/TextArea'

import {
    EMAIL_INTEGRATION_TYPES,
    isGenericEmailIntegration,
} from 'constants/integration'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY} from 'pages/settings/helpCenter/constants'
import ContactCard from '../ContactCard'
import helpCenterContactViewCss from '../../HelpCenterContactView.less'

import {MAX_DESCRIPTION_LENGTH} from '../../constants'
import css from './ContactFormInfoSection.less'

const ContactFormInfoSection: React.FC = () => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const {
        translation: {contactInfo},
        updateTranslation,
        updateContactForm,
        contactForm,
    } = useHelpCenterTranslation()

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    )

    const emailIntegrations = integrations.filter(isGenericEmailIntegration)

    const {description} = contactInfo.email

    const handleChange =
        <TKey extends keyof EmailContactInfoDto>(key: TKey) =>
        (value: EmailContactInfoDto[TKey]) => {
            updateTranslation({
                contactInfo: {
                    ...contactInfo,
                    email: {
                        ...contactInfo.email,
                        [key]: value,
                    },
                },
            })
        }

    const [isAlertAcknowledged, setIsAlertAcknowledged] = useLocalStorage(
        CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY,
        false
    )

    const isBaseEmailIntegration =
        !!contactForm.helpdesk_integration_email?.endsWith(
            window.EMAIL_FORWARDING_DOMAIN
        )

    const handleInfoClose = () => {
        setIsAlertAcknowledged(true)
    }

    return (
        <section className={css.container}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <section className={css.emailSection}>
                    <div className={css.heading}>
                        <div>
                            <h3>Email</h3>
                            <p>
                                Reply by email when customers get in touch via
                                contact form.
                            </p>
                        </div>
                    </div>
                </section>
                {isBaseEmailIntegration && !isAlertAcknowledged && (
                    <Alert
                        icon
                        type={AlertType.Info}
                        onClose={handleInfoClose}
                        className={css.alert}
                    >
                        Default Gorgias email selected, make sure the desired
                        integration is selected.
                    </Alert>
                )}
                {!contactForm.helpdesk_integration_email && (
                    <Alert icon type={AlertType.Error} className={css.alert}>
                        Email integration is required in order to display the
                        Contact Us card.
                    </Alert>
                )}
                <label className="control-label" htmlFor="contactForm">
                    Select email integration
                </label>
                <SelectField
                    id="contactForm"
                    placeholder="Select an email integration"
                    value={contactForm.helpdesk_integration_id}
                    options={emailIntegrations.map((integration) => ({
                        label:
                            `${integration.name} ` +
                            `<${integration.meta.address}>`,
                        value: integration.id,
                    }))}
                    fullWidth
                    onChange={(integrationId) => {
                        const selectedIntegration = emailIntegrations.find(
                            (integration) => integration.id === integrationId
                        )

                        if (selectedIntegration) {
                            updateContactForm({
                                helpdesk_integration_email:
                                    selectedIntegration.meta.address,
                                helpdesk_integration_id: selectedIntegration.id,
                            })

                            setIsAlertAcknowledged(false)
                        }
                    }}
                    className={css.selectEmailIntegration}
                    icon="email"
                />
                <TextArea
                    label="Card description"
                    value={description}
                    onChange={(value: string) => {
                        if (value.length > MAX_DESCRIPTION_LENGTH) {
                            setIsDescriptionTooLong(true)
                            return
                        }
                        setIsDescriptionTooLong(false)

                        handleChange('description')(value)
                    }}
                    autoRowHeight
                    rows={1}
                    error={
                        isDescriptionTooLong
                            ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                            : undefined
                    }
                />
            </div>
            <ContactCard
                icon="email"
                title="Contact us"
                helpText="Contact us card preview"
                className={css.card}
            >
                <div>{description}</div>
            </ContactCard>
        </section>
    )
}

export default ContactFormInfoSection
