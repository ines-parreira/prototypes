import React from 'react'
import classNames from 'classnames'
import {useCookies} from 'react-cookie'
import {Tooltip} from '@gorgias/ui-kit'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {
    Action,
    Feedback,
    FeedbackOnResource,
    Guidance,
    Knowledge,
} from '../../../../../models/aiAgentFeedback/types'
import {logEventWithSampling} from '../../../../../common/segment/segment'
import {SegmentEvent} from '../../../../../common/segment'
import IconButton from '../../../../common/components/button/IconButton'
import css from './AIAgentFeedbackBar.less'
import {ResourceSection} from './types'

export const TOOLTIP_COOKIE_NAME =
    'helpdesk-show-ticket-ai-agent-message-feedback-tooltip'

type FeedbackResourceSectionProps = {
    resource: (Knowledge | Guidance | Action) & {feedback: Feedback}
    resourceType: FeedbackOnResource['resourceType']
    resourceSection: ResourceSection
    handleSubmitFeedback: (
        resourceId: number | string,
        resourceType: FeedbackOnResource['resourceType'],
        feedback: Feedback,
        resourceSection?: ResourceSection
    ) => void
    href?: string
    dataTestId?: string
    resourceId: number | string
    accountId: number
}

export const FeedbackResourceSection: React.FC<FeedbackResourceSectionProps> =
    ({
        resource,
        resourceType,
        resourceSection,
        handleSubmitFeedback,
        href,
        dataTestId,
        resourceId,
        accountId,
    }) => {
        const hasAgentPrivileges = useHasAgentPrivileges()
        const [cookies, setCookie] = useCookies([TOOLTIP_COOKIE_NAME])

        const handleClick = (ev: React.MouseEvent, buttonType: Feedback) => {
            ev.preventDefault()

            if (resource.feedback === buttonType) {
                return
            }

            logEventWithSampling(SegmentEvent.AiAgentFeedbackSubmitFeedback, {
                accountId,
                outcome: buttonType,
                source: resourceType,
            })
            handleSubmitFeedback(
                resource.id,
                resourceType,
                buttonType,
                resourceSection
            )
        }

        const handleBlur = () => {
            if (!cookies[TOOLTIP_COOKIE_NAME]) {
                setCookie(TOOLTIP_COOKIE_NAME, true)
            }
        }

        return (
            <a
                href={hasAgentPrivileges ? href : undefined}
                target="_blank"
                rel="noreferrer noopener"
                className={classNames(css.section, {
                    [css.clickable]: hasAgentPrivileges,
                })}
                data-testid={dataTestId}
            >
                <div className={css.sectionText}>
                    <div className={css.text}>{resource.name}</div>
                    <i
                        className={classNames('material-icons', css.openIcon)}
                        onClick={() => {
                            logEventWithSampling(
                                SegmentEvent.AiAgentFeedbackResourceClicked,
                                {
                                    type: resourceType,
                                }
                            )
                        }}
                    >
                        open_in_new
                    </i>
                </div>
                <div className={css.feedback}>
                    <IconButton
                        fillStyle="fill"
                        intent="secondary"
                        size="small"
                        iconClassName={
                            resource.feedback === 'thumbs_up'
                                ? 'material-icons'
                                : 'material-icons-outlined'
                        }
                        className={classNames({
                            [css.positiveFeedback]:
                                resource.feedback === 'thumbs_up',
                        })}
                        onClick={(ev) => {
                            handleClick(ev, 'thumbs_up')
                        }}
                        onBlur={handleBlur}
                        title="Mark as Correct"
                        id={`thumbs_up-${resourceId}-${resourceType}`}
                    >
                        thumb_up
                    </IconButton>
                    {!cookies[TOOLTIP_COOKIE_NAME] && (
                        <Tooltip
                            target={`thumbs_up-${resourceId}-${resourceType}`}
                            placement="bottom-start"
                            className={css.tooltip}
                            data-testid={`thumbs_up-${resourceId}`}
                            trigger={['click']}
                        >
                            Thanks for the feedback! AI Agent will be{' '}
                            <span className={css.tooltipSpecialText}>
                                more likely
                            </span>{' '}
                            to use this on similar tickets in future
                        </Tooltip>
                    )}
                    <IconButton
                        fillStyle="fill"
                        intent="secondary"
                        size="small"
                        iconClassName={
                            resource.feedback === 'thumbs_down'
                                ? 'material-icons'
                                : 'material-icons-outlined'
                        }
                        className={classNames({
                            [css.negativeFeedback]:
                                resource.feedback === 'thumbs_down',
                        })}
                        onClick={(ev) => {
                            handleClick(ev, 'thumbs_down')
                        }}
                        onBlur={handleBlur}
                        title="Mark as Incorrect"
                        id={`thumbs-down-${resourceId}-${resourceType}`}
                    >
                        thumb_down
                    </IconButton>
                    {!cookies[TOOLTIP_COOKIE_NAME] && (
                        <Tooltip
                            target={`thumbs-down-${resourceId}-${resourceType}`}
                            placement="bottom-start"
                            className={css.tooltip}
                            aria-label={`thumbs down for ${resourceId}`}
                            trigger={['click']}
                        >
                            Thanks for the feedback! AI Agent will be{' '}
                            <span className={css.tooltipSpecialText}>
                                less likely
                            </span>{' '}
                            to use this on similar tickets in future
                        </Tooltip>
                    )}
                </div>
            </a>
        )
    }
