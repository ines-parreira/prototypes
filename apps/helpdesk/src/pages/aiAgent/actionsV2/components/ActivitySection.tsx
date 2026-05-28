import { useEffect, useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Box, Heading, Icon } from '@gorgias/axiom'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import type { ActivityAlert } from '../hooks/useActivityAlerts'
import { useActivityAlerts } from '../hooks/useActivityAlerts'
import type { ServiceConnectionStatuses } from '../hooks/useServiceConnectionStatuses'
import ActivityCard from './ActivityCard'

import css from './ActivitySection.less'

const CARD_WIDTH = 368
const GAP = 16
const VISIBLE_COUNT = 3

type Props = {
    shopName: string
    actions: StoreWorkflowsConfiguration[]
    serviceConnectionStatuses: ServiceConnectionStatuses
}

const ActivitySection = ({
    shopName,
    actions,
    serviceConnectionStatuses,
}: Props) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const { visible } = useActivityAlerts({
        actions,
        serviceConnectionStatuses,
    })

    const [currentIndex, setCurrentIndex] = useState(0)
    const totalCards = visible.length
    const maxIndex = Math.max(0, totalCards - VISIBLE_COUNT)

    useEffect(() => {
        if (currentIndex > maxIndex) setCurrentIndex(maxIndex)
    }, [currentIndex, maxIndex])

    if (totalCards === 0) return null

    const translateX = -(currentIndex * (CARD_WIDTH + GAP))
    const canScrollLeft = currentIndex > 0
    const canScrollRight = currentIndex < maxIndex

    const handlePrev = () => {
        setCurrentIndex((idx) => Math.max(0, idx - 1))
    }
    const handleNext = () => {
        setCurrentIndex((idx) => Math.min(maxIndex, idx + 1))
    }

    const handleActionClick = (alert: ActivityAlert) => {
        history.push(routes.appConnections(alert.appId))
    }

    return (
        <Box
            as="section"
            role="region"
            aria-label="Activity"
            px="lg"
            pt="lg"
            w="100%"
            className={css.section}
        >
            <Heading size="sm" className={css.header}>
                Activity
            </Heading>
            <div className={css.viewport}>
                <div
                    className={css.track}
                    style={{
                        transform: `translate3d(${translateX}px, 0, 0)`,
                    }}
                >
                    {visible.map((alert) => (
                        <ActivityCard
                            key={`reconnect:${alert.appId}`}
                            appName={alert.appName}
                            appIcon={alert.appIcon}
                            message="Credentials expired or were revoked. Reconnect to resume this action."
                            actionButtonLabel="Reconnect"
                            onActionClick={() => handleActionClick(alert)}
                        />
                    ))}
                </div>
            </div>
            {canScrollLeft && (
                <button
                    type="button"
                    aria-label="Previous alerts"
                    onClick={handlePrev}
                    className={`${css.arrow} ${css.arrowLeft}`}
                >
                    <Icon name="arrow-chevron-left" size="sm" />
                </button>
            )}
            {canScrollRight && (
                <button
                    type="button"
                    aria-label="More alerts"
                    onClick={handleNext}
                    className={`${css.arrow} ${css.arrowRight}`}
                >
                    <Icon name="arrow-chevron-right" size="sm" />
                </button>
            )}
        </Box>
    )
}

export default ActivitySection
