import React, { useCallback, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import classnames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import type { EmailContactInfoDto } from 'models/helpCenter/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TextArea from 'pages/common/forms/TextArea'
import {
    isBaseEmailAddress,
    isGenericEmailIntegration,
} from 'pages/integrations/integration/components/email/helpers'
import { CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY } from 'pages/settings/helpCenter/constants'
import { useHelpCenterTranslation } from 'pages/settings/helpCenter/providers/HelpCenterTranslation/HelpCenterTranslation'
import settingsCss from 'pages/settings/settings.less'
import * as integrationsSelectors from 'state/integrations/selectors'

import ToggleInput from '../../../../../../common/forms/ToggleInput'
import SubjectLines from '../../../SubjectLines/SubjectLines'
import { MAX_DESCRIPTION_LENGTH } from '../../constants'
import ContactCard from '../ContactCard'

import helpCenterContactViewCss from '../../HelpCenterContactView.less'
import css from './ContactFormInfoSection.less'

const ContactFormInfoSection = () => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)

    const {
        emailIntegration,
        updateEmailIntegration,
        translation: { contactInfo },
        updateTranslation,
        updateContactForm,
        contactForm,
        setIsDirty,
    } = useHelpCenterTranslation()

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const emailIntegrations = integrations.filter(isGenericEmailIntegration)

    const { description } = contactInfo.email

    const isSubjectLinesAvailable = useFlag(
        FeatureFlagKey.HelpCenterSubjectLines,
    )

    const [isAlertAcknowledged, setIsAlertAcknowledged] = useLocalStorage(
        CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY,
        false,
    )

    const isEmailIntegrationSelected = !!emailIntegration?.email
    const isBaseEmailIntegration =
        emailIntegration?.email && isBaseEmailAddress(emailIntegration.email)

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

    const handleInfoClose = () => {
        setIsAlertAcknowledged(true)
    }

    const onChangeContactFormIntegration = useCallback(
        (integrationId: number | string) => {
            const selectedIntegration = emailIntegrations.find(
                (integration) => integration.id === integrationId,
            )

            if (selectedIntegration) {
                updateEmailIntegration({
                    id: selectedIntegration.id,
                    email: selectedIntegration.meta.address,
                })
                setIsAlertAcknowledged(false)
            }
        },
        [emailIntegrations, updateEmailIntegration, setIsAlertAcknowledged],
    )

    return (
        <>
            <section className={classnames(css.container, settingsCss.mb16)}>
                <div className={helpCenterContactViewCss.leftColumn}>
                    <section
                        className={classnames(
                            css.emailSection,
                            settingsCss.mb40,
                        )}
                    >
                        <div className={css.heading}>
                            <div>
                                <h3>Email</h3>
                                <p>
                                    Reply by email when customers get in touch
                                    via contact form.
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
                            Default Gorgias email selected, make sure the
                            desired integration is selected.
                        </Alert>
                    )}
                    {!emailIntegration.email && (
                        <Alert
                            icon
                            type={AlertType.Error}
                            className={css.alert}
                        >
                            Email integration is required in order to display
                            the Contact Us card.
                        </Alert>
                    )}
                    <label className="control-label" htmlFor="contactForm">
                        Select email integration
                    </label>
                    <SelectField
                        id="contactForm"
                        placeholder="Select an email integration"
                        value={emailIntegration.id}
                        options={emailIntegrations.map((integration) => ({
                            label:
                                `${integration.name} ` +
                                `<${integration.meta.address}>`,
                            value: integration.id,
                        }))}
                        fullWidth
                        onChange={(integrationId) => {
                            onChangeContactFormIntegration(integrationId)
                            setIsDirty(true)
                        }}
                        className={css.selectEmailIntegration}
                        icon="email"
                    />
                    <ToggleInput
                        isToggled={!!contactForm.card_enabled}
                        onClick={(value) => {
                            updateContactForm({ card_enabled: value })
                            setIsDirty(true)
                        }}
                        isDisabled={!emailIntegration.email}
                        className={css.contactCardToggle}
                    >
                        Contact form card
                    </ToggleInput>

                    <TextArea
                        label="Card description"
                        value={description}
                        isDisabled={
                            !(
                                contactForm.card_enabled &&
                                emailIntegration?.email
                            )
                        }
                        onChange={(value: string) => {
                            if (value.length > MAX_DESCRIPTION_LENGTH) {
                                setIsDescriptionTooLong(true)
                                return
                            }
                            setIsDescriptionTooLong(false)

                            handleChange('description')(value)
                            setIsDirty(true)
                        }}
                        autoRowHeight
                        rows={1}
                        error={
                            isDescriptionTooLong
                                ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                                : undefined
                        }
                    />
                    {isSubjectLinesAvailable && contactForm.subject_lines && (
                        <SubjectLines
                            title="Contact form subject"
                            description="Here is a default list of subject lines. If there is no subject added, user can freely type any subject."
                            subjectLines={contactForm.subject_lines}
                            updateSubjectLines={(subjectLines) => {
                                updateContactForm({
                                    subject_lines: subjectLines,
                                })
                            }}
                            setIsDirty={setIsDirty}
                        />
                    )}
                    <div
                        className={css.embedWrapper}
                        id="embedded-contact-form"
                    >
                        {!isEmailIntegrationSelected && (
                            <Tooltip
                                target="embedded-contact-form"
                                placement="top-start"
                                className={css.embedTooltip}
                                arrowClassName={css.embedTooltipArrow}
                                autohide={false}
                            >
                                Select an email integration to enable & embed
                                your contact form.
                            </Tooltip>
                        )}
                    </div>
                </div>
                <ContactCard
                    icon="email"
                    title="Contact us"
                    helpText="Contact us card preview"
                    className={css.card}
                    disabled={
                        !(contactForm.card_enabled && emailIntegration?.email)
                    }
                >
                    <div>{description}</div>
                </ContactCard>
            </section>
        </>
    )
}

export default ContactFormInfoSection
