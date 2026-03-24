import { useFeedbackTracking } from '@repo/ai-agent'
import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { useCookies } from 'react-cookie'

import { LegacyBadge as Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { getTicketState } from 'state/ticket/selectors'

import type {
    Action,
    Feedback,
    FeedbackOnResource,
    Guidance,
    Knowledge,
} from '../../../../../models/aiAgentFeedback/types'
import IconButton from '../../../../common/components/button/IconButton'
import type { ResourceSection } from './types'
import { ActionStatus } from './types'

import css from './AIAgentFeedbackBar.less'

export const TOOLTIP_COOKIE_NAME =
    'helpdesk-show-ticket-ai-agent-message-feedback-tooltip'

type FeedbackResourceSectionProps = {
    resource: (Knowledge | Guidance | Action) & { feedback: Feedback }
    resourceType: FeedbackOnResource['resourceType']
    resourceSection: ResourceSection
    handleSubmitFeedback: (
        resourceId: number | string,
        resourceType: FeedbackOnResource['resourceType'],
        feedback: Feedback,
        resourceSection?: ResourceSection,
    ) => void
    href?: string
    dataTestId?: string
    resourceId: number | string
    accountId: number
}

export const FeedbackResourceSection: React.FC<
    FeedbackResourceSectionProps
> = ({
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

    const ticket = useAppSelector(getTicketState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const ticketId: number = ticket.get('id')
    const userId: number = currentUser.get('id')

    const { onFeedbackGiven } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

    const handleClick = (ev: React.MouseEvent, buttonType: Feedback) => {
        ev.preventDefault()

        if (resource.feedback === buttonType) {
            return
        }

        onFeedbackGiven(buttonType || 'unknown')

        logEventWithSampling(SegmentEvent.AiAgentFeedbackSubmitFeedback, {
            accountId,
            outcome: buttonType,
            source: resourceType,
        })
        handleSubmitFeedback(
            resource.id,
            resourceType,
            buttonType,
            resourceSection,
        )
    }

    const handleBlur = () => {
        if (!cookies[TOOLTIP_COOKIE_NAME]) {
            setCookie(TOOLTIP_COOKIE_NAME, true)
        }
    }

    const renderThumbButtons = () => {
        return (
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
                    title="Prioritize this knowledge source in requests like this"
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
                    title="Don't prioritize this knowledge source in requests like this"
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
        )
    }

    const renderBadge = () => {
        if (!(resource && 'status' in resource)) {
            return null
        }
        const successTooltip =
            'The Action was completed because the customer confirmed the details were correct.'
        const errorTooltip =
            'The Action was cancelled because the customer did not confirm the details were correct.'
        return (
            <div className={css.section}>
                <Badge
                    data-testid="badge-test-id"
                    id={`badge-${resourceId}-${resourceType}`}
                    upperCase={false}
                    style={{ textTransform: 'capitalize', flexShrink: 0 }}
                    type={
                        resource.status === ActionStatus.CONFIRMED
                            ? 'light-success'
                            : 'error'
                    }
                >
                    <div>{resource.status}</div>
                </Badge>
                <Tooltip
                    target={`badge-${resourceId}-${resourceType}`}
                    placement="bottom"
                    className={css.tooltip}
                    aria-label={`badge tooltip for ${resourceId}`}
                    trigger={['hover']}
                >
                    {resource.status === ActionStatus.CONFIRMED
                        ? successTooltip
                        : errorTooltip}
                </Tooltip>
            </div>
        )
    }

    const shouldRenderBadge = () => {
        return (
            resourceType === 'hard_action' && resource && 'status' in resource
        )
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
                            },
                        )
                    }}
                >
                    open_in_new
                </i>
            </div>

            {shouldRenderBadge() ? renderBadge() : renderThumbButtons()}
        </a>
    )
}
