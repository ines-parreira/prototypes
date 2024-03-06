import React from 'react'
import {Link} from 'react-router-dom'

import {assetsUrl} from 'utils'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {useHelpCenterIdParam} from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import Button from 'pages/common/components/button/Button'

import css from './AILibraryBanner.less'

const ArticleTemplatesBanner = () => {
    const helpCenterId = useHelpCenterIdParam()

    return (
        <div className={css.container}>
            <div className={css.wrapper}>
                <div className={css.bannerContent}>
                    <Badge type={ColorType.Magenta} className={css.badge}>
                        <i className="material-icons">auto_awesome</i>ai powered
                    </Badge>
                    <div className={css.bannerTitle}>
                        Get started with AI generated articles just for you
                    </div>
                    <div className={css.bannerDescription}>
                        We used AI to generate pre-written articles based on
                        your customer's most frequently asked questions.
                    </div>
                    <Link
                        to={`/app/settings/help-center/${helpCenterId}/ai-library`}
                        className={css.actionButton}
                    >
                        <Button intent="primary">Review Articles</Button>
                    </Link>
                </div>
                <img
                    src={assetsUrl(`/img/help-center/ai-library-template.png`)}
                    alt="Flows Banner"
                    className={css.image}
                />
            </div>
        </div>
    )
}

export default ArticleTemplatesBanner
