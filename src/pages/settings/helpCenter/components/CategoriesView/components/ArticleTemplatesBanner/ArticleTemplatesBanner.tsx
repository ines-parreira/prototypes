import React from 'react'

import {assetsUrl} from 'utils'

import css from './ArticleTemplatesBanner.less'

const ArticleTemplatesBanner = () => {
    return (
        <div className={css.container}>
            <div className={css.wrapper}>
                <div className={css.bannerContent}>
                    <div className={css.bannerTitle}>
                        Get started with Articles
                    </div>
                    <div className={css.bannerDescription}>
                        Help customers find answers to most commonly asked
                        questions without help from support.
                    </div>
                </div>
                <img
                    src={assetsUrl(`/img/help-center/article-templates.png`)}
                    alt="Flows Banner"
                    className={css.image}
                />
            </div>
        </div>
    )
}

export default ArticleTemplatesBanner
