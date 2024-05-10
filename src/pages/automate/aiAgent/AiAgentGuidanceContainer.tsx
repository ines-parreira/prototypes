import React from 'react'
import {Link, useParams} from 'react-router-dom'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import AutomateView from '../common/components/AutomateView'
import AutomateViewContent from '../common/components/AutomateViewContent'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {AiAgentGuidanceView} from './AiAgentGuidanceView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import css from './AiAgentGuidanceContainer.less'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'

export const AiAgentGuidanceContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})
    const {headerNavbarItems, routes} = useAiAgentNavigation({shopName})

    // We don't handle for now the case when guidanceHelpCenter is not created.
    // We assume it always created after AI agent initialisation.
    if (!guidanceHelpCenter) {
        return (
            <AutomateView
                title={<GuidanceBreadcrumbs shopName={shopName} />}
                headerNavbarItems={headerNavbarItems}
                className={css.container}
            >
                <AutomateViewContent>
                    <Alert icon type={AlertType.Warning}>
                        Please configure your{' '}
                        <Link to={routes.configuration}>
                            AI Agent settings{' '}
                        </Link>
                        first.
                    </Alert>
                </AutomateViewContent>
            </AutomateView>
        )
    }

    return (
        <AutomateView
            title={<GuidanceBreadcrumbs shopName={shopName} />}
            headerNavbarItems={headerNavbarItems}
            className={css.container}
        >
            <AiAgentGuidanceView
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
            />
        </AutomateView>
    )
}
