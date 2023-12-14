import React, {useState} from 'react'
import classnames from 'classnames'
import {useGetHelpCenterArticle} from 'models/helpCenter/queries'
import Button from 'pages/common/components/button/Button'
import {Components as ComponentsSSP} from '../../../../rest_api/ssp_api/client.generated'
import css from './PreviewHeader.less'
import ArticleSelect from './ArticleSelect'

interface Props {
    noRelevantArticles: boolean
    onSelectArticle: (articleId: number) => void
    onChange: (articleId: number) => void
    recommendations: ComponentsSSP.Schemas.PredictionResponseDataDTO
    isFeedbackProvided: boolean
    articleTitle?: string
}

export default function PreviewHeader({
    noRelevantArticles,
    onSelectArticle,
    onChange,
    recommendations,
    isFeedbackProvided,
    articleTitle,
}: Props) {
    const {data: recommendedArticleData} = useGetHelpCenterArticle(
        recommendations.articleId,
        recommendations.helpCenterId,
        recommendations.locale,
        {enabled: !noRelevantArticles}
    )
    const [showDropdown, setShowDropdown] = useState(false)
    const articleDeleted = recommendedArticleData === null

    const hasFeedback =
        noRelevantArticles ||
        typeof recommendations.articleIdFeedback === 'number'

    return (
        <div className={css.container}>
            <div className={css.messageContainer}>
                <i className={classnames('material-icons', css.icon)}>forum</i>
                <div>{recommendations.message}</div>
            </div>
            <div className={css.banner}>
                {recommendedArticleData && (
                    <div className={css.aiBanner}>
                        <i className={'material-icons'}>auto_awesome</i>
                        <div className={css.content}>
                            Our AI suggested that{' '}
                            <b>{recommendedArticleData.translation.title}</b>{' '}
                            might be helpful.
                        </div>
                    </div>
                )}
                <div className={css.customerFeedback}>
                    customer feedback:{' '}
                    {recommendations.isHelpful === null ? (
                        'none'
                    ) : recommendations.isHelpful ? (
                        <div className={css.helpful}>
                            <i className={'material-icons'}>thumb_up</i>
                            helpful
                        </div>
                    ) : (
                        <div className={css.notHelpful}>
                            <i className={'material-icons'}>thumb_down</i>
                            unhelpful
                        </div>
                    )}
                </div>
            </div>
            <div className={css.feedback}>
                {isFeedbackProvided ? (
                    <div className={css.confirm}>
                        <div>Thanks for the feedback!</div>
                    </div>
                ) : (
                    <>
                        <div className={css.question}>
                            {hasFeedback || articleDeleted || showDropdown
                                ? 'Which article should have been sent?'
                                : 'Was this the best article to recommend?'}
                        </div>

                        <div className={css.editor}>
                            {showDropdown ? (
                                <ArticleSelect
                                    helpCenterId={recommendations.helpCenterId}
                                    onSelect={onSelectArticle}
                                    onChange={onChange}
                                />
                            ) : hasFeedback || articleDeleted ? (
                                <div className={css.edit}>
                                    {articleTitle && (
                                        <>
                                            <div>{articleTitle}</div>
                                            <i
                                                onClick={() =>
                                                    setShowDropdown(true)
                                                }
                                                className={'material-icons'}
                                            >
                                                edit
                                            </i>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className={css.improve}>
                                    <Button
                                        intent="secondary"
                                        onClick={() => setShowDropdown(true)}
                                    >
                                        Improve recommendation
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            onSelectArticle(
                                                recommendations.articleId
                                            )
                                        }}
                                    >
                                        Keep recommendation
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className={css.divider}></div>
        </div>
    )
}
