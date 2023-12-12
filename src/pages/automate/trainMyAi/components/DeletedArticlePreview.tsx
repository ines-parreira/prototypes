import React from 'react'
import css from './DeletedArticlePreview.less'

export default function DeletedArticlePreview() {
    return (
        <div className={css.container}>
            <div className={css.title}>Deleted article</div>

            <div className={css.content}>
                <div>This article has been deleted.</div>
            </div>
        </div>
    )
}
