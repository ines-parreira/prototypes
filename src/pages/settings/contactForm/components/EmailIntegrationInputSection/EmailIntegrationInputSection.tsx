import {Label} from '@gorgias/ui-kit'
import React, {useMemo} from 'react'

import {ContactFormIntegration} from 'models/contactForm/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

type EmailIntegrationInputSectionProps = {
    onChange: (integration: ContactFormIntegration) => void
    emailIntegrationId?: number
    isRequiredShown?: boolean
    customLabel?: string
}

const EmailIntegrationInputSection = ({
    onChange,
    emailIntegrationId,
    isRequiredShown = false,
    customLabel = 'Email that will receive submissions',
}: EmailIntegrationInputSectionProps): JSX.Element => {
    const {emailIntegrations} = useEmailIntegrations()

    const onChangeEmail = (integrationId: Value) => {
        const selectedIntegration = emailIntegrations.find(
            (integration) => integration.id === integrationId
        )

        if (!selectedIntegration) return

        onChange(selectedIntegration)
    }

    const emailOptions = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            label: `${integration.name} ` + `<${integration.meta.address}>`,
            value: integration.id,
        }))
    }, [emailIntegrations])

    return (
        <>
            <Label
                className={contactFormCss.mbXs}
                isRequired={isRequiredShown}
                htmlFor="email-select"
            >
                {customLabel}
            </Label>
            <SelectField
                required
                fullWidth
                id="email-select"
                placeholder="Select an email integration"
                value={emailIntegrationId}
                options={emailOptions}
                onChange={onChangeEmail}
                icon="email"
            />
        </>
    )
}

export default EmailIntegrationInputSection
