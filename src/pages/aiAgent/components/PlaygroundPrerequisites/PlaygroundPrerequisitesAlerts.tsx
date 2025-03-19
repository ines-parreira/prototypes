import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import Alert from 'pages/common/components/Alert/Alert'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'

import css from './PlaygroundPrerequisitesAlerts.less'

export const MissingKnowledgeSourceAlert = ({
    shopName,
}: {
    shopName: string
}) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const isAiAgentKnowledgeTabEnabled =
        useFlags()[FeatureFlagKey.AiAgentKnowledgeTab]

    return (
        <div role="alert">
            <h1 className={css.title}>Test AI Agent as a customer</h1>
            <Alert
                className={css.alert}
                icon
                customActions={
                    <Link
                        to={
                            isAiAgentKnowledgeTabEnabled
                                ? routes.knowledge
                                : routes.configuration('knowledge')
                        }
                    >
                        Add Knowledge
                    </Link>
                }
            >
                At least <strong>one knowledge source</strong> is required to
                use test mode.
            </Alert>
        </div>
    )
}
