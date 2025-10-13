import { Link } from 'react-router-dom'

import Alert from 'pages/common/components/Alert/Alert'

import { useAiAgentNavigation } from '../../../hooks/useAiAgentNavigation'

import css from './PlaygroundPrerequisitesAlerts.less'

export const MissingKnowledgeSourceAlert = ({
    shopName,
}: {
    shopName: string
}) => {
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <div role="alert" className={css.missingKnowledgeContainer}>
            <Alert
                className={css.alert}
                icon
                customActions={<Link to={routes.knowledge}>Add Knowledge</Link>}
            >
                At least <strong>one knowledge source</strong> is required to
                use test mode.
            </Alert>
        </div>
    )
}
