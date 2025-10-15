import React from 'react'

import { Link } from 'react-router-dom'

import Alert from 'pages/common/components/Alert/Alert'

import { useAiAgentNavigation } from '../../../hooks/useAiAgentNavigation'

import css from './PlaygroundMissingKnowledgeAlert.less'

type Props = {
    shopName: string
}

export const PlaygroundMissingKnowledgeAlert = ({ shopName }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <div role="alert">
            <h1 className={css.title}>Test AI Agent as a customer</h1>
            <Alert
                className={css.alert}
                icon
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
