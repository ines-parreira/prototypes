import React from 'react'
import {Link} from 'react-router-dom'
import Alert from 'pages/common/components/Alert/Alert'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import css from './PlaygroundPrerequisitesAlerts.less'

export const MissingKnowledgeSourceAlert = ({shopName}: {shopName: string}) => {
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <div>
            <h1 className={css.title}>Test AI Agent as a customer</h1>
            <Alert
                className={css.alert}
                icon
                // TODO link to knowledge tab once it is implemented
                customActions={
                    <Link to={routes.configuration('knowledge')}>
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

export const MissingEmailAlert = ({shopName}: {shopName: string}) => {
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <div>
            <h1 className={css.title}>Test AI Agent as a customer</h1>
            <Alert
                className={css.alert}
                icon
                customActions={
                    <Link to={routes.configuration('email')}>Select Email</Link>
                }
            >
                At least{' '}
                <strong>one email must be connected to AI Agent</strong> to use
                test mode.
            </Alert>
        </div>
    )
}

export const MissingEmailAndKnowledgeSourceAlert = ({
    shopName,
}: {
    shopName: string
}) => {
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <div>
            <h1 className={css.title}>Test AI Agent as a customer</h1>
            <Alert
                className={css.alert}
                customActions={
                    // TODO link to knowledge tab once it is implemented
                    <Link to={routes.configuration('knowledge')}>
                        Go To Settings
                    </Link>
                }
                icon
            >
                Your <strong>email and knowledge settings must be saved</strong>{' '}
                to use test mode. Click save in settings to proceed.
            </Alert>
        </div>
    )
}
