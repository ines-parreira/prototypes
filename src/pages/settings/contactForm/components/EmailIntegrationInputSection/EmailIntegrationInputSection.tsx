import React, {useMemo} from 'react'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import Label from 'pages/common/forms/Label/Label'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {isGenericEmailIntegration} from 'pages/integrations/integration/components/email/helpers'
import * as integrationsSelectors from 'state/integrations/selectors'
import {ContactFormIntegration} from 'models/contactForm/types'

const emailIntegrationsSelector = integrationsSelectors.getIntegrationsByTypes(
    EMAIL_INTEGRATION_TYPES
)

type EmailIntegrationInputSectionProps = {
    onChange: (integration: ContactFormIntegration) => void
    emailIntegrationId?: number
    isRequiredShown?: boolean
}

const EmailIntegrationInputSection = ({
    onChange,
    emailIntegrationId,
    isRequiredShown = false,
}: EmailIntegrationInputSectionProps): JSX.Element => {
    const integrations = useAppSelector(emailIntegrationsSelector)
    const emailIntegrations = integrations.filter(isGenericEmailIntegration)

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
                Select email that will receive form submissions
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
