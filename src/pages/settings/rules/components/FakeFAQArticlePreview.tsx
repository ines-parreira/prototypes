import React from 'react'

import classnames from 'classnames'

import css from './MockComponents.less'

type Props = {
    title: string
    description: string
}

export const FakeFAQArticle: React.FC<Props> = ({ title, description }) => (
    <div className={classnames(css.container, css.FAQArticle)}>
        <div className={css.articleTitle}>{title}</div>
        <p className={css.articleDescription}>{description}</p>
        <span className={css.articleLink}>Read More</span>
    </div>
)

export const FakeFAQArticlePreview: React.FC = () => (
    <>
        <FakeFAQArticle
            title="What’s your shipping policy?"
            description="Delivery times are based on where you’re located. We ship our orders from California…"
        />
        <FakeFAQArticle
            title="Shipping timelines during peak season"
            description="During Black Friday, Cyber Monday and Christmas our orders may take longer to deliver…"
        />
        <FakeFAQArticle
            title="Do you support express shipping?"
            description="If you’d like your order to ship faster, we support express shipping! Simply select this as your preferred shipping during checkout…"
        />
    </>
)
