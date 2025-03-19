import templateCss from '../ArticleTemplateCard/ArticleTemplateCard.less'
import css from './AddArticleCard.less'

type Props = {
    onCreateArticle: () => void
    canUpdateArticle: boolean | null
}

const AddArticleCard = ({ onCreateArticle, canUpdateArticle }: Props) => {
    const handleOnCreate = () => {
        if (canUpdateArticle) {
            onCreateArticle()
        }
    }

    return (
        <>
            <div className={css.container} onClick={handleOnCreate}>
                <div className={css.header}>
                    <i className="material-icons">add_circle</i>
                </div>
                <div>
                    <div className={templateCss.title}>New Article</div>
                    <div className={templateCss.description}>
                        Create a custom article from scratch
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddArticleCard
