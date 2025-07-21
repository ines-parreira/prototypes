import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { GUIDANCE } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

type Props = { shopName: string; title?: string }

export const GuidanceBreadcrumbs = ({ shopName, title }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to={routes.guidance}>{GUIDANCE}</Link>
            </BreadcrumbItem>
            {title !== undefined && (
                <BreadcrumbItem active>{title}</BreadcrumbItem>
            )}
        </Breadcrumb>
    )
}
