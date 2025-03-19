import classnames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import {
    EmailIntegration,
    EmailProvider,
    GmailIntegration,
} from '@gorgias/api-queries'

import gmailImg from 'assets/img/integrations/gmail.svg'
import officeImg from 'assets/img/integrations/office.svg'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    EmailIntegration as DEPRECATED_EmailIntegration,
    IntegrationType,
    OutlookIntegration,
} from 'models/integration/types'
import history from 'pages/history'
import { getDefaultIntegrationSettings } from 'state/currentAccount/selectors'
import { getIconFromType } from 'state/integrations/helpers'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import DefaultIntegrationBadge from './DefaultIntegrationBadge'
import EmailIntegrationListVerificationStatus from './EmailIntegrationListVerificationStatus'
import {
    canIntegrationDomainBeVerified,
    getDomainFromEmailAddress,
    isBaseEmailIntegration,
    isOutboundVerifiedSendgrid,
} from './helpers'
import { useEmailOnboardingCompleteCheck } from './hooks/useEmailOnboarding'

import css from './EmailIntegrationList.less'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    isRowSubmitting: boolean
    verifiedDomains: string[]
    integrations: (EmailIntegration | GmailIntegration | OutlookIntegration)[]
    storeMappings?: Record<string, number>
}

export default function EmailIntegrationListItem({
    integration,
    isRowSubmitting,
    verifiedDomains,
    integrations,
    storeMappings,
}: Props): JSX.Element {
    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const defaultIntegrations = useAppSelector(getDefaultIntegrationSettings)

    const showDefaultIntegration: boolean | undefined =
        useFlags()[FeatureFlagKey.DefaultEmailAddress]
    const showStoreMapping: boolean | undefined =
        useFlags()[FeatureFlagKey.EnableEmailToStoreMapping]
    const isNewDomainVerificationEnabled: boolean =
        useFlags()[FeatureFlagKey.NewDomainVerification] ?? false

    const { isOnboardingComplete } =
        useEmailOnboardingCompleteCheck(integration)

    const active = !integration.deactivated_datetime
    const integrationId = integration.id

    const address = integration.meta.address ?? ''
    const domain = getDomainFromEmailAddress(address)

    const isBaseIntegration = isBaseEmailIntegration(integration)
    const canDomainBeVerified = canIntegrationDomainBeVerified(integration)
    const isDefault =
        showDefaultIntegration &&
        defaultIntegrations?.data?.email === integration.id

    const integrationType = integration.type as IntegrationType
    const isForwardEmail = integrationType === IntegrationType.Email
    const isSendgrid = integration.meta.provider === EmailProvider.Sendgrid

    const isVerified =
        ((integration as EmailIntegration).meta.verified ?? true) ||
        !isForwardEmail ||
        isBaseIntegration
    const isDomainVerified = isSendgrid
        ? isOutboundVerifiedSendgrid(integration as DEPRECATED_EmailIntegration)
        : verifiedDomains.includes(domain)

    // Whether to show the "pending domain verification" warning for this integration

    const shouldDisplayDomainVerificationWarning =
        !isDomainVerified &&
        !isBaseIntegration && // The base email integration cannot have a domain associated
        isVerified

    const getTabURL = () => {
        if (
            (isVerified && !canDomainBeVerified) ||
            (!isForwardEmail && !active)
        ) {
            return ''
        }

        if (shouldDisplayDomainVerificationWarning) {
            if (
                isNewDomainVerificationEnabled &&
                isForwardEmail &&
                !isOnboardingComplete
            ) {
                return '/onboarding/domain-verification'
            }

            return isSendgrid ? '/outbound-verification' : '/dns'
        }

        return isVerified ? '' : '/verification'
    }

    const editLink = `/app/settings/channels/email/${integrationId}${getTabURL()}`

    const getUri = (type: IntegrationType) => {
        const uri = new URL(getRedirectUri(type), window.location.origin)
        uri.search = new URLSearchParams({
            integration_id: integrationId.toString(),
        }).toString()
        return uri.toString()
    }
    const adapters = {
        [IntegrationType.Gmail]: {
            uri: getUri(IntegrationType.Gmail),
            image: <img alt="gmail logo" src={gmailImg} className={css.logo} />,
        },
        [IntegrationType.Outlook]: {
            uri: getUri(IntegrationType.Outlook),
            image: (
                <img alt="outlook logo" src={officeImg} className={css.logo} />
            ),
        },
        [IntegrationType.Email]: {
            uri: undefined,
            image: (
                <i
                    className={classnames(
                        css.icon,
                        'material-icons',
                        'align-bottom',
                    )}
                >
                    email
                </i>
            ),
        },
    }

    const adapter = adapters[integrationType as keyof typeof adapters]

    const storeIntegration = integrations.find(
        (_integration) => _integration?.id === storeMappings?.[integrationId],
    )

    const handleRowClick = () => {
        history.push(editLink)
    }

    return (
        <tr key={integrationId} onClick={handleRowClick} className={css.row}>
            <td className="smallest align-middle">{adapter.image}</td>
            <td className={classnames('align-middle')}>
                <div className={css.address}>
                    <div>
                        <b className="mr-2">{integration.name}</b>
                        <span className={css.addressValue}>{address}</span>
                    </div>

                    {isDefault && <DefaultIntegrationBadge />}
                </div>
            </td>
            {showStoreMapping && (
                <td className={classnames('align-middle pr-2', css.store)}>
                    {storeIntegration ? (
                        <span className={css.storeName}>
                            <img
                                height={16}
                                width={16}
                                src={getIconFromType(
                                    storeIntegration.type as IntegrationType,
                                )}
                                alt="logo"
                            />
                            <span>{storeIntegration.name}</span>
                        </span>
                    ) : (
                        'No store connected'
                    )}
                </td>
            )}
            <td className="smallest align-middle text-left p-0">
                <EmailIntegrationListVerificationStatus
                    active={active}
                    isForwardEmail={isForwardEmail}
                    isVerified={isVerified}
                    isRowSubmitting={isRowSubmitting}
                    redirectURI={adapter.uri}
                    isDomainVerificationWarningVisible={
                        shouldDisplayDomainVerificationWarning
                    }
                    integration={integration}
                />
            </td>
            <td className="smallest align-middle">
                <i className="material-icons md-2 align-middle icon-go-forward">
                    keyboard_arrow_right
                </i>
            </td>
        </tr>
    )
}
