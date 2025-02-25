import React from 'react'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import css from './FeedbackCreateResource.less'

type Props = {
    shopType: string
    shopName: string
    helpCenterId: number
}

type LinkProps = {
    href: string
    text: string
}

const LinkInText: React.FC<LinkProps> = ({ href, text }) => {
    return (
        <a href={href} target="_blank" rel="noreferrer">
            {text}
        </a>
    )
}

const FeedbackCreateResource: React.FC<Props> = ({
    shopName,
    helpCenterId,
}) => {
    const aiAgentNavigation = useAiAgentNavigation({ shopName })
    const actionLink = aiAgentNavigation.routes.newAction()
    const guidanceLink = aiAgentNavigation.routes.guidanceTemplates
    const helpCenterArticlesLink = `/app/settings/help-center/${helpCenterId}/articles`

    return (
        <div className={css.container}>
            <div className={css.info}>
                Can’t find a resource? Create an{' '}
                <LinkInText href={actionLink} text="Action" />,{' '}
                <LinkInText href={guidanceLink} text="Guidance" /> or{' '}
                <LinkInText href={helpCenterArticlesLink} text="Article" /> to
                improve responses.{' '}
                <LinkInText
                    href={helpCenterArticlesLink}
                    text="Learn more about which resource type to create."
                />
            </div>
        </div>
    )
}

export default FeedbackCreateResource
