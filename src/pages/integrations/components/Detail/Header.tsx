import React from 'react'
import {Badge} from 'reactstrap'

import {IntegrationConfig} from 'config'
import {AppDetail, isAppDetail, TrialPeriod} from 'models/integration/types/app'

import css from './Detail.less'

const imgPrefix = `${
    window.GORGIAS_ASSETS_URL || ''
}/static/private/js/assets/img/integrations/`

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
                    src={isAppDetail(props) ? image : `${imgPrefix}${image}`}
                    alt={`${title}'s logo`}
                    className={css.heroImage}
                />
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
