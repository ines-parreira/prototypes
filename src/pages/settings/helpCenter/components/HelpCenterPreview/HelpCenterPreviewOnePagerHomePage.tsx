import React from 'react'

import css from './HelpCenterPreviewHomePage.less'

const HomePageCategory = ({ title }: { title: string }) => {
    return <div className={css.categoryTitle}>{title}</div>
}

const HomePageArticle = ({ title }: { title: string }) => {
    return (
        <li className={css.articleTitle}>
            <span>{title}</span>
            <i className="material-icons">keyboard_arrow_down</i>
        </li>
    )
}

const HelpCenterPreviewOnePagerHomePage = () => {
    return (
        <div>
            <div className={css.sectionWrapper}>
                <span className={css.sectionTitle}>FAQs</span>
                <div className={css.categoryMenu}>
                    <span>Go to category...</span>
                    <i className="material-icons">arrow_drop_down</i>
                </div>
            </div>
            <div className={css.categoryList}>
                <div>
                    <HomePageCategory title="Shipping & Delivery" />
                    <ul className={css.articleList}>
                        <HomePageArticle title="What is your shipping policy?" />
                        <HomePageArticle title="How do I track the status of my order?" />
                        <HomePageArticle title="What if my package gets lost or arrives damaged?" />
                    </ul>
                </div>
                <div>
                    <HomePageCategory title="Order management" />
                    <ul className={css.articleList}>
                        <HomePageArticle title="How do I cancel my order?" />
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default HelpCenterPreviewOnePagerHomePage
