import type { PropsWithChildren } from 'react'
import type React from 'react'

import css from './Header.less'

export const TRAIN_ARTICLE_RECOMMENDATIONS_DOCS_URL =
    'https://docs.gorgias.com/en-US/answer-chat-tickets-with-automatic-article-recommendations-368447#train-your-article-recommendations'

type Props = PropsWithChildren<{
    alert?: React.ReactNode
}>

const Header = ({ children, alert }: Props) => {
    return (
        <div className={css.header}>
            {alert}
            <h2 className={css.title}>Train Article Recommendation</h2>
            <div className={css.description}>
                Review customer messages, check if recommended articles are
                helpful, and provide feedback to improve future recommendations.
                <a
                    href={TRAIN_ARTICLE_RECOMMENDATIONS_DOCS_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <i className="material-icons mr-2">menu_book</i>
                    How To Train Article Recommendations
                </a>
            </div>
            {children}
        </div>
    )
}

export default Header
