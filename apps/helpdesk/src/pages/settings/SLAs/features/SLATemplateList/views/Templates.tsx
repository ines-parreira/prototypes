import classNames from 'classnames'
import { Link } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {
    CustomCardLink,
    TemplateCardLink,
} from 'pages/common/components/TemplateCard'
import { SLATemplate } from 'pages/settings/SLAs/config/templates'

import css from './Templates.less'

export default function Templates({
    className,
    templates,
    showSeeAllTemplates,
}: {
    className?: string
    hideAt?: number
    showSeeAllTemplates?: boolean
    templates: SLATemplate[]
}) {
    return (
        <div className={classNames(css.wrapper, className)}>
            {templates.map(({ icon, description, ...template }) => (
                <TemplateCardLink
                    key={template.name}
                    icon={
                        <i className={classNames('material-icons', css.icon)}>
                            {icon}
                        </i>
                    }
                    buttonLabel="Use template"
                    title={template.name}
                    description={description}
                    to={{
                        pathname: '/app/settings/sla/new',
                        state: {
                            template,
                        },
                    }}
                />
            ))}
            {showSeeAllTemplates && (
                <div className={css.link}>
                    <Link to="/app/settings/sla/templates">
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            trailingIcon="arrow_forward"
                        >
                            See All Templates
                        </Button>
                    </Link>
                </div>
            )}
            <CustomCardLink
                title="Create SLA"
                to={{
                    pathname: '/app/settings/sla/new',
                }}
                description="Create an SLA policy from scratch."
            />
        </div>
    )
}
