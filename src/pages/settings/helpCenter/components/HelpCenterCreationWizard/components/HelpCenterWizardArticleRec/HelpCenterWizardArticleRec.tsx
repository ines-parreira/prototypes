import React from 'react'
import classnames from 'classnames'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './HelpCenterWizardArticleRec.less'

type HelpCenterWizardArticleRecProps = {
    articleRecommendationEnabled: boolean
    onArticleRecommendationEnabledChange: (enabled: boolean) => void
}

const HelpCenterWizardArticleRec = ({
    articleRecommendationEnabled,
    onArticleRecommendationEnabledChange,
}: HelpCenterWizardArticleRecProps) => {
    const handleArticleRecommendationEnabledChange = (enabled: boolean) => {
        onArticleRecommendationEnabledChange(enabled)
    }

    return (
        <div>
            <div className="heading-section-semibold mb-4">
                Article Recommendation
            </div>

            <div className={css.container}>
                <ToggleInput
                    name="article-recommendation"
                    isToggled={articleRecommendationEnabled}
                    onClick={handleArticleRecommendationEnabledChange}
                    caption="At least 1 published article is required"
                >
                    <i
                        className={classnames(
                            'material-icons mr-1',
                            css.AIIcon
                        )}
                    >
                        auto_awesome
                    </i>
                    Recommend articles from this Help Center in my Chat
                </ToggleInput>
            </div>
        </div>
    )
}

export default HelpCenterWizardArticleRec
