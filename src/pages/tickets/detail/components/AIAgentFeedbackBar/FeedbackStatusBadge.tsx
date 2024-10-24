import React, {useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {setAgentFeedbackMessageStatus} from 'state/agents/actions'

import css from './FeedbackStatusBadge.less'
import {FeedbackStatus, ResourceSection} from './types'

type Props = {
    status: FeedbackStatus | null
    resourceSection: ResourceSection
}

const DISAPPEAR_TIME = 5000

const FeedbackStatusBadge = ({status, resourceSection}: Props) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const timer: NodeJS.Timeout = setTimeout(() => {
            dispatch(setAgentFeedbackMessageStatus(null, resourceSection))
        }, DISAPPEAR_TIME) // Hide after 5 seconds
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [dispatch, status, resourceSection])

    const getStatusContent = () => {
        switch (status) {
            case FeedbackStatus.SAVING:
                return {
                    text: 'saving',
                    icon: (
                        <i className="icon-custom icon-circle-o-notch md-spin" />
                    ),
                    colorType: ColorType.LightGrey,
                }
            case FeedbackStatus.ERROR:
                return {
                    text: 'error',
                    icon: <i className="material-icons">warning</i>,
                    colorType: ColorType.LightError,
                }
            case FeedbackStatus.SAVED:
                return {
                    text: 'saved',
                    icon: <i className="material-icons">check_circle</i>,
                    colorType: ColorType.LightSuccess,
                }
            default:
                return {text: '', icon: '', colorType: ColorType.LightSuccess}
        }
    }

    const {text, icon, colorType} = getStatusContent()

    return (
        <Badge
            type={colorType}
            className={css.feedbackStatusBadge}
            data-testid="badge-test-id"
        >
            {icon}
            <div>{text}</div>
        </Badge>
    )
}

export default FeedbackStatusBadge
