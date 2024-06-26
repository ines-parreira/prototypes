import React from 'react'
import {Link} from 'react-router-dom'
import css from './AIArticlesLibraryList.less'

type AIArticleLibraryRedirectProps = {
    message: string
    linkAddress: string
    linkDescription: string
    openNewTab?: boolean
}

const AIArticleLibraryRedirect = ({
    message,
    linkAddress,
    linkDescription,
    openNewTab,
}: AIArticleLibraryRedirectProps) => (
    <div className={css.centeredMessage}>
        <div className={css.messageContainer}>
            <div className={css.message}>{message}</div>
            <Link
                className={css.linkDescription}
                to={linkAddress}
                target={openNewTab ? '_blank' : undefined}
                rel={openNewTab ? 'noopener noreferrer' : undefined}
            >
                {linkDescription}
            </Link>
        </div>
    </div>
)

export default AIArticleLibraryRedirect
