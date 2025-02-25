import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { FeatureFlagKey } from 'config/featureFlags'
import { AI_AGENT, GUIDANCE } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

type Props = { shopName: string; title?: string }

export const GuidanceBreadcrumbs = ({ shopName, title }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link
                    to={isStandaloneMenuEnabled ? routes.guidance : routes.main}
                >
                    {isStandaloneMenuEnabled ? GUIDANCE : AI_AGENT}
                </Link>
            </BreadcrumbItem>
            {title !== undefined && (
                <BreadcrumbItem active>{title}</BreadcrumbItem>
            )}
        </Breadcrumb>
    )
}
