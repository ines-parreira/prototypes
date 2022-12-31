import React, {useEffect, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Col, Container, Row} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {isSmoochInsideIntegration} from 'models/integration/types/smoochInside'
import {fetchApps} from 'models/integration/resources'
import {RootState} from 'state/types'
import {fetchIntegrations} from 'state/integrations/actions'
import {IntegrationListItem} from 'state/integrations/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    getAutomationPrices,
    getCurrentHelpdeskMaxIntegrations,
    getCurrentHelpdeskName,
    getCurrentProductsFeatures,
    getHelpdeskPrices,
} from 'state/billing/selectors'
import {
    getActiveIntegrations,
    getIntegrations,
    getIntegrationsList,
} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import {AppListItem} from 'models/integration/types/app'
import PageHeader from 'pages/common/components/PageHeader'
import {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import css from 'pages/settings/settings.less'
import {getCheapestPriceNameForFeature} from 'utils/paywalls'

import IntegrationListRow from './Row'

export const List = ({
    activeIntegrations,
    automationPrices,
    features,
    helpdeskName,
    helpdeskPrices,
    integrations,
    integrationsList,
    maxIntegrations,
}: ConnectedProps<typeof connector>) => {
    const [isLoading, setLoading] = useState(true)
    const [apps, setApps] = useState<AppListItem[]>([])
    const dispatch = useAppDispatch()

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetchApps()
                setApps(res)
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Something went wrong while trying to fetch additional apps.`,
                    })
                )
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [dispatch])

    useEffect(() => {
        void dispatch(fetchIntegrations())
    }, [dispatch])

    const hasActiveSmoochInsideIntegrations = useMemo(
        () =>
            integrations.find((integration) =>
                isSmoochInsideIntegration(integration)
                    ? integration.deactivated_datetime === null ||
                      integration.meta?.shopify_integration_ids?.length
                    : false
            ),
        [integrations]
    )

    const hasTwitterIntegrations = useMemo(
        () =>
            integrations
                .filter(
                    (integration) =>
                        integration.type === IntegrationType.Twitter
                )
                .find((integration) => integration.deleted_datetime === null),
        [integrations]
    )

    const hasKlaviyoIntegrations = useMemo(
        () =>
            integrations
                .filter(
                    (integration) =>
                        integration.type === IntegrationType.Klaviyo
                )
                .find((integration) => integration.deleted_datetime === null),
        [integrations]
    )

    const limitWarning = useMemo(() => {
        const remainingIntegrations = maxIntegrations - activeIntegrations
        const plural = activeIntegrations > 1

        if (remainingIntegrations > 3) {
            return null
        }

        return (
            <LinkAlert
                type={
                    remainingIntegrations > 0
                        ? AlertType.Warning
                        : AlertType.Error
                }
                icon
                actionLabel="Upgrade your plan"
                actionHref={'/app/settings/billing'}
            >
                {remainingIntegrations > 0 ? (
                    <span>
                        You are using{' '}
                        <strong>
                            {activeIntegrations}{' '}
                            {plural ? 'integrations' : 'integration'} of{' '}
                            {maxIntegrations}
                        </strong>{' '}
                        allowed on your <strong>{helpdeskName} plan.</strong>{' '}
                        Need more?
                    </span>
                ) : (
                    <span>
                        <strong>
                            Your account has reached the integration limit.{' '}
                        </strong>
                        Need more?
                    </span>
                )}
            </LinkAlert>
        )
    }, [activeIntegrations, maxIntegrations, helpdeskName])

    const deprecatedChatWarning = useMemo(
        () =>
            hasActiveSmoochInsideIntegrations && (
                <Row className="mb-4">
                    <Col>
                        <LinkAlert
                            type={AlertType.Error}
                            actionLabel="Migrate"
                            actionHref="/app/settings/channels/gorgias_chat"
                        >
                            You are currently using a deprecated version of the
                            chat integration. If applicable, please migrate to
                            the <strong>new chat integration</strong> by 03/31
                            following these{' '}
                            <a
                                href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                instructions
                            </a>
                            . Past this date, any remaining active integrations
                            will be automatically removed.
                        </LinkAlert>
                    </Col>
                </Row>
            ),
        [hasActiveSmoochInsideIntegrations]
    )

    const isWhatsAppEnabled = useFlags()[FeatureFlagKey.EnableWhatsApp]

    let displayList: (IntegrationListItem | AppListItem)[] = integrationsList
        .filter((integration) => {
            // do not return the smooch inside integration
            // if there is no active integration of it
            if (
                integration.type === IntegrationType.SmoochInside &&
                !hasActiveSmoochInsideIntegrations
            ) {
                return false
            }

            // Handle deprecation of Klaviyo integrations
            // TODO(@walter) remove this when Klaviyo migration is completed
            if (
                integration.type === IntegrationType.Klaviyo &&
                !hasKlaviyoIntegrations
            ) {
                return false
            }

            if (
                integration.type === IntegrationType.WhatsApp &&
                !isWhatsAppEnabled
            ) {
                return false
            }

            return true
        })
        .map((integration) => {
            const requiredFeature = integration.requiredFeature

            if (requiredFeature && !features[requiredFeature]?.enabled) {
                let requiredPriceName = getCheapestPriceNameForFeature(
                    requiredFeature,
                    [...automationPrices, ...helpdeskPrices]
                )
                // Kind of a hacky way because `prices` variable doesn't
                // contain the custom prices (Enterprise prices == Custom prices)
                if (
                    !hasTwitterIntegrations &&
                    integration.type === IntegrationType.Twitter
                ) {
                    requiredPriceName = 'Enterprise'
                }
                return {
                    ...integration,
                    requiredPriceName,
                }
            }
            return integration
        })

    displayList = displayList.concat(apps)

    return (
        <div className="full-width">
            <PageHeader title="Apps & integrations" />
            <Container fluid className={css.pageContainer}>
                <Row
                    className="mb-4"
                    data-candu-id="integrations-list-description"
                >
                    <Col md="10">
                        <p>
                            Gorgias is most useful when you connect it to other
                            applications. Integrations let you communicate with
                            customers through multiple channels, pull more
                            information about them and perform actions in
                            outside tools directly from Gorgias.
                        </p>

                        {limitWarning}
                    </Col>
                </Row>
                {deprecatedChatWarning}
                <Row>
                    <Col>
                        {displayList.map((integration, index) => {
                            return (
                                <IntegrationListRow
                                    key={index}
                                    integration={integration}
                                />
                            )
                        })}
                    </Col>
                </Row>
                {isLoading && (
                    <Loader
                        minHeight="150px"
                        message="Loading additional Apps..."
                    />
                )}
            </Container>
        </div>
    )
}

const connector = connect((state: RootState) => ({
    activeIntegrations: getActiveIntegrations(state).size,
    maxIntegrations: getCurrentHelpdeskMaxIntegrations(state),
    features: getCurrentProductsFeatures(state),
    integrations: getIntegrations(state),
    integrationsList: getIntegrationsList(state),
    automationPrices: getAutomationPrices(state),
    helpdeskPrices: getHelpdeskPrices(state),
    helpdeskName: getCurrentHelpdeskName(state),
}))

export default connector(List)
