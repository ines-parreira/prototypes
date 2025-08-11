import React, { useEffect } from 'react'

import { Badge, ColorType } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { setAgentFeedbackMessageStatus } from 'state/agents/actions'

import { FeedbackStatus, ResourceSection } from './types'

import css from './FeedbackStatusBadge.less'

type Props = {
    status: FeedbackStatus | null
    resourceSection: ResourceSection
}

const DISAPPEAR_TIME = 5000

const FeedbackStatusBadge = ({ status, resourceSection }: Props) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const timer: NodeJS.Timeout = setTimeout(() => {
            dispatch(setAgentFeedbackMessageStatus(null, resourceSection))
        }, DISAPPEAR_TIME) // Hide after 5 seconds
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [dispatch, status, resourceSection])

    const getStatusContent = (): {
        text: string
        icon: React.ReactNode
        colorType: ColorType
    } => {
        switch (status) {
            case FeedbackStatus.SAVING:
                return {
                    text: 'saving',
                    icon: (
                        <i className="icon-custom icon-circle-o-notch md-spin" />
                    ),
                    colorType: 'light-grey',
                }
            case FeedbackStatus.ERROR:
                return {
                    text: 'error',
                    icon: <i className="material-icons">warning</i>,
                    colorType: 'light-error',
                }
            case FeedbackStatus.SAVED:
                return {
                    text: 'saved',
                    icon: <i className="material-icons">check_circle</i>,
                    colorType: 'light-success',
                }
            default:
                return { text: '', icon: '', colorType: 'light-success' }
        }
    }

    const { text, icon, colorType } = getStatusContent()

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
