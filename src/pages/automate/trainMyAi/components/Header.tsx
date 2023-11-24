import React, {PropsWithChildren} from 'react'
import css from './Header.less'

type Props = PropsWithChildren<{
    hasAlert?: boolean
}>

const Header = ({children}: Props) => {
    return (
        <div className={css.header}>
            {/* TODO https://linear.app/gorgias/issue/AUTEN-2486/article-recommendation-disabled-alert */}
            <h2 className={css.title}>Train Article Recommendation</h2>
            <div className={css.description}>
                Review customer messages, check if recommended articles are
                helpful, and provide feedback to improve future recommendations.
                <a
                    href="https://docs.gorgias.com/en-US/help-center---article-recommendations-in-chat-89341"
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
