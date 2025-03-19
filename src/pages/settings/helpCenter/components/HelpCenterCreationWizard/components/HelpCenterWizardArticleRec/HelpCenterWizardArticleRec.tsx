import classnames from 'classnames'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './HelpCenterWizardArticleRec.less'

type HelpCenterWizardArticleRecProps = {
    isSectionDisabled?: boolean
    articleRecommendationEnabled: boolean
    isArticleRecomAlreadyEnabled: boolean
    onArticleRecommendationEnabledChange: (enabled: boolean) => void
}

const HelpCenterWizardArticleRec = ({
    isSectionDisabled = false,
    articleRecommendationEnabled,
    onArticleRecommendationEnabledChange,
    isArticleRecomAlreadyEnabled,
}: HelpCenterWizardArticleRecProps) => {
    const handleArticleRecommendationEnabledChange = (enabled: boolean) => {
        onArticleRecommendationEnabledChange(enabled)
    }

    return (
        <div
            className={classnames({
                [css.disabled]: isSectionDisabled,
            })}
        >
            <div className="heading-section-semibold mb-4">
                Article Recommendation
            </div>

            <div className={css.container}>
                {isArticleRecomAlreadyEnabled && (
                    <Alert icon type={AlertType.Warning}>
                        You already have another Help Center used for article
                        recommendations. By turning this setting on, articles
                        will be surfaced in your chat from this Help Center
                        instead.
                    </Alert>
                )}

                <ToggleInput
                    name="article-recommendation"
                    isToggled={articleRecommendationEnabled}
                    onClick={handleArticleRecommendationEnabledChange}
                    caption="At least 1 published article is required"
                    isDisabled={isSectionDisabled}
                >
                    <i
                        className={classnames(
                            'material-icons mr-1',
                            css.AIIcon,
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
