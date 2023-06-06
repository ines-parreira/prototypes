import React from 'react'
import classnames from 'classnames'

import css from './MockComponents.less'

type Props = {
    title: string
    description: string
}

export const FakeFAQArticle: React.FC<Props> = ({title, description}) => (
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

export const FakeFAQArticleAnswerPreview: React.FC = () => (
    <div className={classnames(css.container, css.FAQArticlePreview)}>
        <p className={css.previewTitle}>We found an answer!</p>
        <div className={css.previewAnswer}>
            <p>
                Our delivery times vary depending on where you’re based and
                whether it’s peak season, but it can take 5 to 10 business days
                with regular delivery and up to 5 days with express shipping.
            </p>
            <p>
                This information was pulled from the articles below from our
                Help Center.
            </p>
        </div>
    </div>
)
