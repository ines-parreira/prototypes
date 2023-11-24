import React from 'react'
import classNames from 'classnames'
import Badge from 'pages/common/components/Badge/Badge'
import {assetsUrl} from 'utils'
import LinkButton from 'pages/common/components/button/LinkButton'
import css from './ArticleRecommendationDisabled.less'

type Props = {
    articleRecommendationUrl: string
}

const ArticleRecommendationDisabled = ({articleRecommendationUrl}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.column}>
                <img
                    className={css.background}
                    alt=""
                    src={assetsUrl('/img/train-my-ai/background.svg')}
                />
                <img
                    className={css.preview}
                    alt="article recommendation in chat and train my ai screen preview"
                    src={assetsUrl('/img/train-my-ai/preview.png')}
                />
            </div>

            <div className={css.column}>
                <Badge className={css.badge}>
                    <span>
                        <i className={classNames('material-icons', css.AIIcon)}>
                            auto_awesome
                        </i>
                        {' AI POWERED'}
                    </span>
                </Badge>
                <div className={css.textContainer}>
                    <div className={css.title}>
                        Enable Article Recommendation to access AI training
                    </div>
                    <div className={css.description}>
                        Review recommendations and provide feedback to optimize
                        AI performance.
                    </div>
                </div>
                <LinkButton target="" href={articleRecommendationUrl}>
                    Set up article recommendation
                </LinkButton>
            </div>
        </div>
    )
}

export default ArticleRecommendationDisabled
