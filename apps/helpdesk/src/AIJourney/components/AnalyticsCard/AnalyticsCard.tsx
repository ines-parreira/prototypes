import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import {
    JourneyApiDTO,
    JourneyDetailApiDTO,
    JourneyStatusEnum,
} from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { TotalConversationsCard } from 'AIJourney/components/AnalyticsCard/components/TotalConversationsCard/TotalConversationsCard'
import { AnalyticsData } from 'AIJourney/components/AnalyticsData/AnalyticsData'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import greenLightningIcon from 'assets/img/ai-journey/green-lightning.svg'
import greyLightningIcon from 'assets/img/ai-journey/lightning.svg'
import orangeLightningIcon from 'assets/img/ai-journey/orange-lightning.svg'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { EmptyState } from './components/EmptyState/EmptyState'
import { Footer } from './components/Footer/Footer'
import { MoreOptions } from './components/MoreOptions/MoreOptions'

import css from './AnalyticsCard.less'

type AnalyticsCardProps = {
    analyticsData: MetricProps[]
    journeyData?: JourneyDetailApiDTO
    integrationId?: number
    currentIntegration?: Integration
    abandonedCartJourney: Omit<JourneyApiDTO, 'created_datetime'>
    totalConversations?: string
    period: {
        start: string
        end: string
    }
}

export const AnalyticsCard = ({
    period,
    analyticsData,
    journeyData,
    integrationId,
    abandonedCartJourney,
    totalConversations,
}: AnalyticsCardProps) => {
    const { shopName } = useParams<{ shopName: string }>()
    const dispatch = useAppDispatch()
    const [journeyState, setJourneyState] = useState<JourneyStatusEnum>(
        abandonedCartJourney.state,
    )

    const isEmpty = !analyticsData?.length

    useEffect(() => {
        setJourneyState(abandonedCartJourney.state)
    }, [abandonedCartJourney])

    const statusIcon = {
        active: greenLightningIcon,
        paused: orangeLightningIcon,
        draft: greyLightningIcon,
    }

    const statusBadgeClass = classNames(css.statusBadge, {
        [css['statusBadge--active']]: journeyState === 'active',
        [css['statusBadge--paused']]: journeyState === 'paused',
    })

    const analyticsContentClass = classNames(css.analyticsContent, {
        [css['analyticsContent--empty']]: isEmpty,
    })

    const { configuration: journeyConfigurations, meta: journeyMeta } =
        journeyData || {}

    const { ticket_view_id: ticketViewId } = journeyMeta || {}

    const {
        offer_discount: isDiscountEnabled,
        max_discount_percent: maxDiscount,
    } = journeyConfigurations || {}

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        abandonedCartJourney,
    })

    const handleUpdateJourneyState = useCallback(async () => {
        try {
            const { data: newData } = await handleUpdate({
                journeyState:
                    journeyState === JourneyStatusEnum.Active
                        ? JourneyStatusEnum.Paused
                        : JourneyStatusEnum.Active,
                journeyMessageInstructions:
                    abandonedCartJourney.message_instructions,
            })
            setJourneyState(newData.state)
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error updating journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [
        journeyState,
        dispatch,
        handleUpdate,
        abandonedCartJourney.message_instructions,
    ])

    const totalRevenue = analyticsData.find(
        (data) => data.label === 'Total Revenue',
    )

    return (
        <div className={css.analyticsCard}>
            <div className={analyticsContentClass}>
                <div className={css.status}>
                    <img src={statusIcon[journeyState]} alt="sphere-icon" />
                    <span>Abandoned Cart</span>
                    <div className={statusBadgeClass}>
                        {journeyState?.toUpperCase()}
                    </div>
                    <MoreOptions
                        shopName={shopName}
                        journeyState={journeyState}
                        handleChangeStatus={handleUpdateJourneyState}
                    />
                </div>
                {isEmpty ? (
                    <EmptyState />
                ) : (
                    <>
                        <AnalyticsData data={analyticsData} period={period} />
                    </>
                )}
                <TotalConversationsCard
                    totalConversations={totalConversations}
                    ticketViewId={ticketViewId}
                />
            </div>
            {!isEmpty && (
                <Footer
                    isDiscountEnabled={isDiscountEnabled}
                    maxDiscount={maxDiscount}
                    totalRevenue={totalRevenue}
                />
            )}
        </div>
    )
}
