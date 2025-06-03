import { Tooltip } from '@gorgias/merchant-ui-kit'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'

import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../../constants'
import { useGuidanceTemplates } from '../../hooks/useGuidanceTemplates'

import css from './GuidanceHeader.less'

const CREATE_GUIDANCE_BUTTON_ID = 'create-guidance-button'

type Props = {
    onCreateGuidanceClick: () => void
    onCreateFromTemplate: () => void
    onBrowseSuggestions: () => void
    guidanceArticlesLength: number
    hasAiGuidanceSuggestions: boolean
    isLoading: boolean
}

export const GuidanceHeader = ({
    onCreateGuidanceClick,
    onCreateFromTemplate,
    onBrowseSuggestions,
    guidanceArticlesLength,
    hasAiGuidanceSuggestions,
    isLoading,
}: Props) => {
    const isGuidanceArticleLimitReached =
        guidanceArticlesLength >= GUIDANCE_ARTICLE_LIMIT
    const isGuidanceArticleLimitWarning =
        guidanceArticlesLength >= GUIDANCE_ARTICLE_LIMIT_WARNING
    const { guidanceTemplates } = useGuidanceTemplates()
    const isGuidanceTemplatesEmpty = guidanceTemplates.length === 0

    const displayCreateGuidanceButton =
        isLoading || (!hasAiGuidanceSuggestions && isGuidanceTemplatesEmpty)

    return (
        <>
            <div className={css.container}>
                <p
                    className={css.textGroup}
                    data-candu-id="ai-agent-guidance-has-guidance-articles"
                >
                    Create internal Guidance to instruct AI Agent how to handle
                    customer inquiries and follow end-to-end processes in line
                    with your company policies.
                </p>

                <div className={css.btnGroup}>
                    {displayCreateGuidanceButton ? (
                        <Button
                            isDisabled={isGuidanceArticleLimitReached}
                            onClick={onCreateGuidanceClick}
                            intent="secondary"
                            id={CREATE_GUIDANCE_BUTTON_ID}
                        >
                            Create Guidance
                        </Button>
                    ) : (
                        <>
                            <Button
                                isDisabled={isGuidanceArticleLimitReached}
                                onClick={onCreateGuidanceClick}
                                intent="secondary"
                                id={CREATE_GUIDANCE_BUTTON_ID}
                            >
                                Create Custom Guidance
                            </Button>

                            {hasAiGuidanceSuggestions ? (
                                <Button onClick={onBrowseSuggestions}>
                                    Start from Template
                                </Button>
                            ) : (
                                <Button
                                    isDisabled={isGuidanceArticleLimitReached}
                                    onClick={onCreateFromTemplate}
                                >
                                    Create From Template
                                </Button>
                            )}
                        </>
                    )}
                    {isGuidanceArticleLimitReached && (
                        <Tooltip
                            target={CREATE_GUIDANCE_BUTTON_ID}
                            placement="bottom"
                        >
                            You can only add up to {GUIDANCE_ARTICLE_LIMIT}{' '}
                            pieces of guidance. Edit or delete Guidance to
                            further improve the AI Agent performance.
                        </Tooltip>
                    )}
                </div>
            </div>
            {isGuidanceArticleLimitWarning && (
                <div className={css.warningContainer}>
                    <Alert type={AlertType.Warning} icon className={css.alert}>
                        You’ve added {guidanceArticlesLength} out of{' '}
                        {GUIDANCE_ARTICLE_LIMIT} pieces of guidance.
                    </Alert>
                </div>
            )}
        </>
    )
}
