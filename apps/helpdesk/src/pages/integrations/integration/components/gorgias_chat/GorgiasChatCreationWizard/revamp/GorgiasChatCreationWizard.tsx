import type React from 'react'

import type { Map } from 'immutable'
import { Link, Redirect } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { IntegrationType } from 'models/integration/types'
import { GorgiasChatCreationWizardStatus } from 'models/integration/types/gorgiasChat'
import PageHeader from 'pages/common/components/PageHeader'

import css from './GorgiasChatCreationWizard.less'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

const GorgiasChatCreationWizard: React.FC<Props> = ({
    integration,
    isUpdate,
}) => {
    const wizardStatus = integration.getIn(['meta', 'wizard', 'status'])

    const name = integration.get('name')

    return (
        <>
            {wizardStatus === GorgiasChatCreationWizardStatus.Published && (
                <Redirect to="/app/settings/channels/gorgias_chat" />
            )}
            <div className={css.page}>
                <div
                    style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '16px',
                    }}
                >
                    🚧 Revamp mode: under development
                </div>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                                >
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {isUpdate ? name : 'New Chat'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
            </div>
        </>
    )
}

export default GorgiasChatCreationWizard
