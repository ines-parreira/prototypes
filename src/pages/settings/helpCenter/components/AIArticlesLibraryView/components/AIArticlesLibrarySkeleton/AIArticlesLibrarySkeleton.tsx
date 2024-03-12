import React from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import listCss from '../AIArticlesLibraryList/AIArticlesLibraryList.less'
import previewCss from '../AIArticlesLibraryPreview/AIArticlesLibraryPreview.less'
import css from './AIArticlesLibrarySkeleton.less'

const LibrarySkeleton = () => {
    return (
        <div className={css.container}>
            <div className={listCss.container}>
                <h3>AI Generated Articles</h3>
                <div className={listCss.description}>
                    Review, edit, and publish pre-written articles based on your
                    customers' top asked questions. New articles are generated
                    every 90 days.
                </div>
                <div className={listCss.listHeader}>
                    <div>Generated Article</div>
                    <div># of ticket inquiries</div>
                </div>
                <div className={css.list}>
                    {Array.from({length: 7}).map((_, index) => (
                        <Skeleton key={index} width={'100%'} height={72} />
                    ))}
                </div>
            </div>
            <div className={previewCss.container}>
                <div className={previewCss.header}>
                    <Skeleton width={120} />
                    <div className={previewCss.actions}>
                        <Skeleton width={20} />
                        <Skeleton width={75} />
                        <Skeleton width={75} />
                    </div>
                </div>
                <div className={previewCss.descriptionContainer}>
                    <Skeleton height={28} width={'100%'} />
                    <div className={css.textRows}>
                        {Array.from({length: 24}).map((_, index) => (
                            <Skeleton key={index} width={'100%'} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LibrarySkeleton
