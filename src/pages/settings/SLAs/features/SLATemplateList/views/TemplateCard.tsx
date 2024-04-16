import React from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import {LocationDescriptor} from 'history'

import Button from 'pages/common/components/button/Button'

import {SLATemplate} from './config'

import css from './TemplateCard.less'

type Props<T> = {
    template: SLATemplate
    to: LocationDescriptor<T>
}

function TemplateCard<T>({template, to}: Props<T>) {
    return (
        <Link className={css.container} to={to}>
            <div className={css.header}>
                <i className={classNames('material-icons', css.icon)}>
                    {template.icon}
                </i>
                <Button size="small" intent="secondary" tabIndex={-1}>
                    Use template
                </Button>
            </div>
            <div className={css.title}>{template.name}</div>
            <div className={css.description}>{template.description}</div>
        </Link>
    )
}

export default TemplateCard
