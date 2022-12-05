import React from 'react'
import {Badge} from 'reactstrap'
import classNames from 'classnames'

import {assetsUrl} from 'utils'
import {IntegrationConfig} from 'config'
import {AppDetail, isAppDetail, TrialPeriod} from 'models/integration/types/app'

import css from './Detail.less'

export default function Header(props: AppDetail | IntegrationConfig) {
    const {
        image,
        title,
        description,
        categories = [],
        company,
        companyUrl,
        hasFreeTrial,
        freeTrialPeriod,
    } = props

    let trialLabel = 'Free trial'
    if (freeTrialPeriod && freeTrialPeriod !== TrialPeriod.CUSTOM) {
        trialLabel = freeTrialPeriod + ' free trial'
    }

    return (
        <header className={css.hero}>
            {image && (
                <img
                    src={
                        isAppDetail(props)
                            ? image
                            : assetsUrl(`/img/integrations/${image}`)
                    }
                    alt={`${title}'s logo`}
                    className={css.heroImage}
                />
            )}
            {isAppDetail(props) && props.icon && (
                <i className={classNames(css.icon, 'material-icons-outlined')}>
                    {props.icon}
                </i>
            )}
            <div>
                <h1 className={css.heroHeading}>{title}</h1>
                <p className={css.heroDescription}>{description}</p>
                <div className={css.heroMeta}>
                    {categories.length > 0 &&
                        categories.map((category, index) => (
                            <Badge
                                key={index}
                                color="secondary"
                                pill
                                className={css.badge}
                            >
                                {category.toUpperCase()}
                            </Badge>
                        ))}
                    {hasFreeTrial && (
                        <Badge color="success" pill className={css.badge}>
                            {trialLabel.toUpperCase()}
                        </Badge>
                    )}
                    {company && companyUrl && (
                        <span className={css.by}>
                            by{' '}
                            <a
                                href={companyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {company}
                            </a>
                        </span>
                    )}
                </div>
            </div>
        </header>
    )
}
