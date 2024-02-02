import React from 'react'
import classnames from 'classnames'
import Label from 'pages/common/forms/Label/Label'
import ToggleInput from 'pages/common/forms/ToggleInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {GorgiasChatIntegration} from 'models/integration/types'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import css from './HelpCenterWizardArticleRec.less'

const optionLabel = (option: JSX.Element | string) => (
    <span className={css.chatOption}>
        <i className={classnames('material-icons', css.chatIcon)}>forum</i>

        <span>{option}</span>
    </span>
)

type HelpCenterWizardArticleRecProps = {
    chatIntegrations: GorgiasChatIntegration[]
    selectedChatId: number | null
    articleRecommendationEnabled: boolean
    onChatApplicationIdChange: (value: number | null) => void
    onArticleRecommendationEnabledChange: (enabled: boolean) => void
}

const HelpCenterWizardArticleRec = ({
    chatIntegrations,
    selectedChatId,
    onChatApplicationIdChange,
    articleRecommendationEnabled,
    onArticleRecommendationEnabledChange,
}: HelpCenterWizardArticleRecProps) => {
    const handleChatApplicationIdChange = (value: number | string) => {
        if (typeof value === 'number') {
            onChatApplicationIdChange(value)
        }
    }

    const handleArticleRecommendationEnabledChange = (enabled: boolean) => {
        onArticleRecommendationEnabledChange(enabled)

        if (!enabled) {
            onChatApplicationIdChange(null)
        }
    }

    const chatOptions = chatIntegrations.map((chatIntegration) => ({
        text: chatIntegration.name,
        label:
            selectedChatId === chatIntegration.id
                ? chatIntegration.name
                : optionLabel(chatIntegration.name),
        value: chatIntegration.id,
    }))

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

                {articleRecommendationEnabled && (
                    <div>
                        <div className={css.labelContainer}>
                            <Label
                                isRequired
                                className="control-label"
                                htmlFor="chat-integration"
                            >
                                Connect a Chat integration{' '}
                            </Label>
                            <IconTooltip className={css.iconTooltip}>
                                Only chats connected to the store selected in
                                Step 1 are displayed.
                            </IconTooltip>
                        </div>
                        <SelectField
                            id="chat-integration"
                            required={true}
                            value={selectedChatId}
                            options={chatOptions}
                            onChange={handleChatApplicationIdChange}
                            placeholder="Select a chat"
                            fullWidth
                            icon="forum"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default HelpCenterWizardArticleRec
