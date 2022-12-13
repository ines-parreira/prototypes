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

const FakeFAQArticlePreview: React.FC = () => (
    <>
        <FakeFAQArticle
            title="What size should I order?"
            description="Unsure what size will work? Check out our sizing guide located above the sizes offered on each product page for exact measure..."
        />
        <FakeFAQArticle
            title="What shoe size should I buy?"
            description="We recommend looking at the product details on the product page for each item for specific fit information. Each style will have..."
        />
        <FakeFAQArticle
            title="What size am I in your denim?"
            description="Take a look at our denim size guide for measurement instructions and keep in mind that the fabric will relax during the first..."
        />
    </>
)

export default FakeFAQArticlePreview
