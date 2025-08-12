import React, { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import css from 'domains/reporting/pages/automate/ai-agent/AiAgentStatsEmptyState.less'
import { PAGE_TITLE_AI_AGENT } from 'domains/reporting/pages/self-service/constants'
import { IntegrationType } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import PageHeader from 'pages/common/components/PageHeader'
import { assetsUrl } from 'utils'

export const AiAgentStatsEmptyState = () => {
    const storeIntegrations = useStoreIntegrations()

    const ctaLink = useMemo(() => {
        const firstShopifyIntegration = storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration.type === IntegrationType.Shopify,
        )

        if (firstShopifyIntegration === undefined) return '/app/automation/'

        return `/app/automation/${
            firstShopifyIntegration.type
        }/${getShopNameFromStoreIntegration(firstShopifyIntegration)}/ai-agent`
    }, [storeIntegrations])

    return (
        <div className={css.pageContainer}>
            <PageHeader title={PAGE_TITLE_AI_AGENT}></PageHeader>
            <div className={css.contentContainer}>
                <div className={css.leftContainer}>
                    <div className={css.content}>
                        <div className={css.description}>
                            <div className={css.heading}>
                                AI Agent Statistics
                            </div>

                            <div className={css.text}>
                                Analyze how AI Agent performs against the rest
                                of your team on key metrics, and identify trends
                                in user inquiries and top topics.
                            </div>

                            <div className={css.text}>
                                Get started by setting up AI Agent to
                                autonomously handle inquires with personalized,
                                accurate answers for email, chat, and Contact
                                Form tickets.
                            </div>
                        </div>

                        <div>
                            <Link to={ctaLink}>
                                <Button intent="primary" size="medium">
                                    Set Up AI Agent
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={css.rightContainer}>
                    <img
                        className={css.exampleImg}
                        src={assetsUrl(
                            '/img/paywalls/screens/ai_agent_stats_empty_state.png',
                        )}
                        alt="AI Agent stats example"
                    />
                </div>
            </div>
        </div>
    )
}
