import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {Map} from 'immutable'

import {FeatureFlagKey} from 'config/featureFlags'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import useQuickRepliesAlternativesLinks from './hooks/useQuickRepliesAlternativesLinks'

import css from './GorgiasChatIntegrationQuickReplies.less'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationQuickRepliesSunsetAlert: React.FC<Props> = ({
    integration,
}) => {
    const isQuickRepliesSunsetAlertEnabled =
        useFlags()[FeatureFlagKey.ChatQuickRepliesSunsetAlert]

    const {
        showAlternatives,
        quickResponsesLink,
        flowsLink,
        installationTabLink,
    } = useQuickRepliesAlternativesLinks(integration)

    if (!isQuickRepliesSunsetAlertEnabled || !showAlternatives) {
        return null
    }

    return (
        <Alert className={css.section} type={AlertType.Warning} icon>
            Quick Replies will not be available anymore after Q1 2024. Since you
            are subscribed to Automate, we advise you to use{' '}
            <a href={quickResponsesLink}>Quick Responses</a> and{' '}
            <a href={flowsLink}>Flows</a> instead.{' '}
            {installationTabLink && (
                <>
                    <a href={installationTabLink}>Connect a store</a> to this
                    chat to get started.
                </>
            )}
        </Alert>
    )
}

export default GorgiasChatIntegrationQuickRepliesSunsetAlert
