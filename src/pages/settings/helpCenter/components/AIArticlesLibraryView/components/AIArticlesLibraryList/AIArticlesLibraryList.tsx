import React from 'react'

import css from './AIArticlesLibraryList.less'

const AIArticlesLibraryList = () => {
    return (
        <div className={css.container}>
            <h3>AI Generated Articles</h3>
            <div className={css.description}>
                Review, edit, and publish pre-written articles based on your
                customers' top asked questions. New articles are generated every
                90 days.
            </div>
            <a className={css.articleLink} href="#">
                <i className="material-icons rounded">menu_book</i>
                How articles are generated with AI
            </a>
            <div className={css.listHeader}>
                <div>Generated Article</div>
                <div># of ticket inquiries</div>
            </div>
            <div className={css.articlesList}></div>
        </div>
    )
}

export default AIArticlesLibraryList
