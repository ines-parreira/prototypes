import React from 'react'
import {Tooltip} from '@gorgias/ui-kit'
import Button from 'pages/common/components/button/Button'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../../constants'
import {useGuidanceTemplates} from '../../hooks/useGuidanceTemplates'
import css from './GuidanceHeader.less'

const CREATE_GUIDANCE_BUTTON_ID = 'create-guidance-button'

type Props = {
    onCreateGuidanceClick: () => void
    onCreateFromTemplate: () => void
    guidanceArticlesLength: number
}

export const GuidanceHeader = ({
    onCreateGuidanceClick,
    onCreateFromTemplate,
    guidanceArticlesLength,
}: Props) => {
    const isGuidanceArticleLimitRiched =
        guidanceArticlesLength >= GUIDANCE_ARTICLE_LIMIT
    const isGuidanceArticleLimitWarning =
        guidanceArticlesLength >= GUIDANCE_ARTICLE_LIMIT_WARNING
    const {guidanceTemplates} = useGuidanceTemplates()
    const isGuidanceTemplatesEmpty = guidanceTemplates.length === 0
    return (
        <>
            <div className={css.container}>
                <p>
                    Guidance is internal-facing knowledge that allows you to
                    customize AI Agent's behavior and fine-tune how it handles
                    customer requests.
                </p>

                <div className={css.btnGroup}>
                    {isGuidanceTemplatesEmpty ? (
                        <Button
                            isDisabled={isGuidanceArticleLimitRiched}
                            disabled={isGuidanceArticleLimitRiched}
                            onClick={onCreateGuidanceClick}
                            id={CREATE_GUIDANCE_BUTTON_ID}
                        >
                            Create Guidance
                        </Button>
                    ) : (
                        <>
                            <Button
                                isDisabled={isGuidanceArticleLimitRiched}
                                disabled={isGuidanceArticleLimitRiched}
                                onClick={onCreateGuidanceClick}
                                intent="secondary"
                                id={CREATE_GUIDANCE_BUTTON_ID}
                            >
                                Create Custom Guidance
                            </Button>

                            <Button
                                isDisabled={isGuidanceArticleLimitRiched}
                                disabled={isGuidanceArticleLimitRiched}
                                onClick={onCreateFromTemplate}
                            >
                                Create From Template
                            </Button>
                        </>
                    )}
                    {isGuidanceArticleLimitRiched && (
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
