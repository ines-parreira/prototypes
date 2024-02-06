import _capitalize from 'lodash/capitalize'
import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {EmailProvider, IntegrationType} from 'models/integration/constants'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import {GmailIntegration, OutlookIntegration} from 'models/integration/types'
import Tooltip from 'pages/common/components/Tooltip'
import {canEnableEmailingViaInternalProvider} from '../helpers'

export enum DeliverabilityProviderSetting {
    UseDefaultProvider = 'use-default-provider',
    UseInternalProvider = 'use-internal-provider',
}

type Props = {
    integration: GmailIntegration | OutlookIntegration
    onChange: (newValue: boolean) => void
}

export default function EmailIntegrationDeliverabilitySettings({
    integration,
    onChange,
}: Props) {
    const isUseInternalProviderSettingAlreadyEnabled = () => {
        switch (integration.type) {
            case IntegrationType.Gmail:
                return integration.meta?.enable_gmail_sending
                    ? DeliverabilityProviderSetting.UseDefaultProvider
                    : DeliverabilityProviderSetting.UseInternalProvider
            case IntegrationType.Outlook:
                return integration.meta?.enable_outlook_sending
                    ? DeliverabilityProviderSetting.UseDefaultProvider
                    : DeliverabilityProviderSetting.UseInternalProvider
            default:
                return DeliverabilityProviderSetting.UseDefaultProvider
        }
    }
    const [currentProvider, setCurrentProvider] = useState(
        isUseInternalProviderSettingAlreadyEnabled()
    )
    const handleOnChange = (selectedProvider: string) => {
        onChange(
            selectedProvider ===
                DeliverabilityProviderSetting.UseDefaultProvider
        )
        setCurrentProvider(selectedProvider as DeliverabilityProviderSetting)
    }

    const capitalizedIntegrationType = _capitalize(integration.type)
    const isUseInternalProviderOptionDisabled =
        !canEnableEmailingViaInternalProvider(integration)

    const useDefaultProviderLabel =
        'Send emails from Gorgias with ' + capitalizedIntegrationType
    const domainVerificationPageLink = `/app/settings/channels/email/${
        integration.id
    }/${
        integration.meta?.provider === EmailProvider.Sendgrid
            ? 'outbound-verification'
            : 'dns'
    }`
    const useInternalProviderLabelTooltip = (
        <>
            <i
                className="material-icons"
                id={`${DeliverabilityProviderSetting.UseInternalProvider}-info-icon`}
            >
                info_outline
            </i>
            <Tooltip
                target={`${DeliverabilityProviderSetting.UseInternalProvider}-info-icon`}
                autohide={false}
            >
                To enable this setting, you must{' '}
                <Link to={domainVerificationPageLink}>
                    verify your domain first.
                </Link>
            </Tooltip>
        </>
    )

    const useInternalProviderLabel = (
        <>
            <div>
                Send emails using email provider{' '}
                {isUseInternalProviderOptionDisabled &&
                    useInternalProviderLabelTooltip}
            </div>
        </>
    )

    const useDefaultProviderCaption =
        'Emails are sent through ' + capitalizedIntegrationType
    const enableInternalProviderCaption = (
        <div>
            {'Once activated, Emails will be sent through our internal email provider. ' +
                'Ensure your domain verification is complete to activate this feature. '}
            <a
                href="https://docs.gorgias.com/email-integrations/spf-dkim-support"
                target="_blank"
                rel="noopener noreferrer"
            >
                View Step-by-Step Guide
            </a>
        </div>
    )

    return (
        <RadioFieldSet
            options={[
                {
                    value: DeliverabilityProviderSetting.UseDefaultProvider,
                    label: useDefaultProviderLabel,
                    disabled: false,
                    caption: useDefaultProviderCaption,
                },
                {
                    value: DeliverabilityProviderSetting.UseInternalProvider,
                    label: useInternalProviderLabel,
                    disabled: isUseInternalProviderOptionDisabled,
                    caption: enableInternalProviderCaption,
                },
            ]}
            selectedValue={currentProvider}
            key="outbound-email-deliverability-settings"
            label="Outbound Email Deliverability"
            name="Button"
            onChange={handleOnChange}
        />
    )
}
