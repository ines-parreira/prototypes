import React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import CustomEntityCard from 'pages/common/components/CustomEntityCard'

import TemplateCard from './TemplateCard'
import {SLATemplate} from './config'

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
            {templates.map((template) => (
                <TemplateCard
                    key={template.name}
                    template={template}
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
                        <Button intent="secondary" fillStyle="ghost">
                            <ButtonIconLabel
                                position="right"
                                icon="arrow_forward"
                            >
                                See All Templates
                            </ButtonIconLabel>
                        </Button>
                    </Link>
                </div>
            )}
            <CustomEntityCard
                title="Create SLA"
                to={{
                    pathname: '/app/settings/sla/new',
                }}
                description="Create an SLA policy from scratch."
            />
        </div>
    )
}
