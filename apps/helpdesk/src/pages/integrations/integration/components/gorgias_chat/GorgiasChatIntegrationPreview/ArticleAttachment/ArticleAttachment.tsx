import articlePreviewImg from 'assets/img/article-preview.svg'

import css from './ArticleAttachment.less'

type ArticleAttachmentProps = {
    title: string
    summary?: string
}

const ArticleAttachment = ({
    title,
    summary,
}: ArticleAttachmentProps): JSX.Element => {
    return (
        <div className={css.container}>
            <img
                className={css.icon}
                src={articlePreviewImg}
                alt="article-preview"
            />
            <div className={css.content}>
                <span className={css.title}>{title}</span>
                {summary && <span className={css.summary}>{summary}</span>}
            </div>
        </div>
    )
}

export default ArticleAttachment
