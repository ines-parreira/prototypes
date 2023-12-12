import React, {useMemo} from 'react'
import {
    getArticleUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {useGetHelpCenter} from 'models/helpCenter/queries'
import {Components} from '../../../../rest_api/help_center_api/client.generated'
import css from './PreviewArticle.less'

interface Props {
    articleData: Components.Schemas.ArticleWithLocalTranslation
}

export default function PreviewHeader({articleData}: Props) {
    const {data: helpCenterData} = useGetHelpCenter(
        articleData.help_center_id,
        {}
    )

    const articleURL = useMemo(() => {
        if (!helpCenterData) return null

        return getArticleUrl({
            domain: getHelpCenterDomain(helpCenterData),
            locale: articleData.translation.locale,
            slug: articleData.translation.slug,
            articleId: articleData.id,
            unlistedId: articleData.translation.article_unlisted_id,
            isUnlisted:
                articleData.translation.visibility_status === 'UNLISTED',
        })
    }, [articleData, helpCenterData])

    return (
        <div className={css.container}>
            <div className={css.articleContainer}>
                <div className={css.infoContainer}>
                    <div className={css.titleContainer}>
                        <div className={css.subTitle}>Article preview</div>
                        <div className={css.title}>
                            {articleData?.translation.title}
                        </div>
                    </div>
                    {articleURL && (
                        <i
                            onClick={() => window.open(articleURL, '_blank')}
                            className={'material-icons'}
                        >
                            open_in_new
                        </i>
                    )}
                </div>
                <div className={css.contentContainer}>
                    {
                        <div
                            className={css.content}
                            dangerouslySetInnerHTML={{
                                __html: articleData?.translation.content,
                            }}
                        />
                    }
                </div>
            </div>
        </div>
    )
}
