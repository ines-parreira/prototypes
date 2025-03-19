import css from './HelpCenterWizardArticlePreview.less'

type Props = {
    title: string | undefined
    content: string | undefined
}

const HelpCenterWizardArticlePreview: React.FC<Props> = ({
    title,
    content,
}) => {
    if (!title || !content) return null
    return (
        <div className={css.articlePreviewContainer}>
            <div className="heading-section-semibold">{title}</div>
            <p
                className={css.previewContent}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    )
}

export default HelpCenterWizardArticlePreview
