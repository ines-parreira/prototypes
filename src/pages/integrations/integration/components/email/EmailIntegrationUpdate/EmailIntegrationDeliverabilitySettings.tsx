import React, { useState } from 'react'

import _capitalize from 'lodash/capitalize'
import { Link } from 'react-router-dom'

import warningIcon from 'assets/img/icons/warning.svg'
import { EmailProvider, IntegrationType } from 'models/integration/constants'
import { GmailIntegration, OutlookIntegration } from 'models/integration/types'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import { canEnableEmailingViaInternalProvider } from '../helpers'

import css from './EmailIntegrationDeliverabilitySettings.less'

export enum DeliverabilityProviderSetting {
    UseNativeProvider = 'use-native-provider',
    UseProviderAPI = 'use-provider-api',
}

type Props = {
    integration: GmailIntegration | OutlookIntegration
    onChange: (newValue: boolean) => void
}

export default function EmailIntegrationDeliverabilitySettings({
    integration,
    onChange,
}: Props) {
    const [currentProvider, setCurrentProvider] = useState(() => {
        switch (integration.type) {
            case IntegrationType.Gmail:
                return integration.meta?.enable_gmail_sending
                    ? DeliverabilityProviderSetting.UseProviderAPI
                    : DeliverabilityProviderSetting.UseNativeProvider
            case IntegrationType.Outlook:
                return integration.meta?.enable_outlook_sending
                    ? DeliverabilityProviderSetting.UseProviderAPI
                    : DeliverabilityProviderSetting.UseNativeProvider
            default:
                return DeliverabilityProviderSetting.UseProviderAPI
        }
    })

    const handleOnChange = (selectedProvider: string) => {
        onChange(
            selectedProvider === DeliverabilityProviderSetting.UseProviderAPI,
        )
        setCurrentProvider(selectedProvider as DeliverabilityProviderSetting)
    }

    const capitalizedIntegrationType = _capitalize(integration.type)
    const isUseNativeProviderOptionDisabled =
        !canEnableEmailingViaInternalProvider(integration)

    const useProviderAPILabel = `Send emails via ${capitalizedIntegrationType} API`

    const domainVerificationPageLink = `/app/settings/channels/email/${
        integration.id
    }/${
        integration.meta?.provider === EmailProvider.Sendgrid
            ? 'outbound-verification'
            : 'dns'
    }`

    const useInternalProviderLabel = (
        <>
            <div>
                Send emails via Gorgias email delivery platform (recommended)
            </div>
        </>
    )

    const useInternalProviderCaption =
        'Recommended to avoid deliverability issues.'
    const useDefaultProviderCaption =
        'Potential risk of deliverability issues with high email volume.'

    const caption = canEnableEmailingViaInternalProvider(integration) ? (
        currentProvider === DeliverabilityProviderSetting.UseProviderAPI ? (
            <>
                {`To avoid deliverability issues that can occur when using ${capitalizedIntegrationType}’s API, it is recommended to use Gorgias’ email delivery platform to send your emails. This ensures successful delivery and tracking.`}
            </>
        ) : (
            <>
                {`Your emails are now being sent via Gorgias’ email delivery platform to prevent deliverability issues that can occur when using ${capitalizedIntegrationType}’s API with high email volumes.`}
            </>
        )
    ) : (
        <>
            {`To avoid deliverability issues that can occur when using
            ${capitalizedIntegrationType}'s API, complete`}
            <Link to={domainVerificationPageLink}>Domain Verification</Link>
            {` to enable Gorgias’ email delivery platform.`}
        </>
    )

    return (
        <FormSection
            title="Outbound Email Delivery Settings"
            description={caption}
            headingSize="small"
        >
            <RadioFieldSet
                options={[
                    {
                        value: DeliverabilityProviderSetting.UseNativeProvider,
                        label: useInternalProviderLabel,
                        disabled: isUseNativeProviderOptionDisabled,
                        caption: useInternalProviderCaption,
                    },
                    {
                        value: DeliverabilityProviderSetting.UseProviderAPI,
                        label: useProviderAPILabel,
                        disabled: false,
                        caption:
                            currentProvider ===
                            DeliverabilityProviderSetting.UseProviderAPI ? (
                                <div className={css.warningCaption}>
                                    <img alt="warning" src={warningIcon} />
                                    {useDefaultProviderCaption}
                                </div>
                            ) : (
                                useDefaultProviderCaption
                            ),
                    },
                ]}
                selectedValue={currentProvider}
                onChange={handleOnChange}
            />
        </FormSection>
    )
}
