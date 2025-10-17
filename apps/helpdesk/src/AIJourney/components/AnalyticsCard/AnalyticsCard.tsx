import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'

import { LoadingSpinner } from '@gorgias/axiom'
import {
    JourneyApiDTO,
    JourneyDetailApiDTO,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

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
    integrationId?: number
    journey?: JourneyApiDTO
    journeyData?: JourneyDetailApiDTO
    period: {
        start: string
        end: string
    }
    totalConversations?: string
}

export const AnalyticsCard = ({
    analyticsData,
    integrationId,
    journey,
    journeyData,
    period,
    totalConversations,
}: AnalyticsCardProps) => {
    const dispatch = useAppDispatch()
    const [journeyState, setJourneyState] = useState<JourneyStatusEnum>(
        journey?.state || JourneyStatusEnum.Draft,
    )

    const { store_name: shopName, type: journeyType } = journeyData || {}

    const isLoadingMetrics = analyticsData.some((data) => data.isLoading)
    const isEmpty = !analyticsData.some(
        (data) => data.value !== 0 && data.prevValue !== 0,
    )
    const shouldRenderTotalConversationsCard =
        !isLoadingMetrics && !isEmpty && totalConversations !== '0'
    const shouldRenderFooter = !isLoadingMetrics && !isEmpty

    useEffect(() => {
        if (journey?.state) setJourneyState(journey?.state)
    }, [journey])

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
        journey,
    })

    const handleUpdateJourneyState = useCallback(async () => {
        try {
            const { data: newData } = await handleUpdate({
                journeyState:
                    journeyState === JourneyStatusEnum.Active
                        ? JourneyStatusEnum.Paused
                        : JourneyStatusEnum.Active,
                journeyMessageInstructions: journey?.message_instructions,
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
    }, [journeyState, dispatch, handleUpdate, journey?.message_instructions])

    const totalRevenue = analyticsData.find(
        (data) => data.label === 'Total Revenue',
    )

    const shouldRenderMoreOptions = shopName && journeyType

    const cardContent = () => {
        if (isLoadingMetrics) {
            return <LoadingSpinner style={{ height: '25px', width: '25px' }} />
        }
        if (isEmpty) {
            return <EmptyState />
        }
        return (
            <>
                <AnalyticsData data={analyticsData} period={period} />
            </>
        )
    }

    return (
        <div className={css.analyticsCard}>
            <div className={analyticsContentClass}>
                <div className={css.status}>
                    <img src={statusIcon[journeyState]} alt="sphere-icon" />
                    <span>Abandoned Cart</span>
                    <div className={statusBadgeClass}>
                        {journeyState?.toUpperCase()}
                    </div>
                    {shouldRenderMoreOptions && (
                        <MoreOptions
                            shopName={shopName}
                            journeyState={journeyState}
                            journeyType={journeyType}
                            handleChangeStatus={handleUpdateJourneyState}
                        />
                    )}
                </div>
                {cardContent()}
                {shouldRenderTotalConversationsCard && (
                    <TotalConversationsCard
                        totalConversations={totalConversations}
                        ticketViewId={ticketViewId}
                    />
                )}
            </div>
            {shouldRenderFooter && (
                <Footer
                    isDiscountEnabled={isDiscountEnabled}
                    journeyType={journey?.type.replace('_', '-')}
                    maxDiscount={maxDiscount}
                    totalRevenue={totalRevenue}
                />
            )}
        </div>
    )
}
