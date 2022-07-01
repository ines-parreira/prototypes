import React from 'react'
import classnames from 'classnames'

import css from './MockComponents.less'

export const FakeFAQArticlePreview = () => {
    return (
        <div className={classnames(css.container, css.FAQArticle)}>
            <div className={css.articleTitle}>What size should I order</div>
            <div className={css.articleDescription}>
                <p>
                    Unsure what size will work? Check out our sizing guide
                    located above the sizes offered on each product page for
                    exact measure...
                </p>
                <p className={css.articleLink}>Read more</p>
            </div>
        </div>
    )
}

export default FakeFAQArticlePreview
