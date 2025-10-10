import React, { useRef } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { LegacyButton as Button } from '@gorgias/axiom'

import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import {
    formatCurrency,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasAgentPrivileges, isAdmin } from 'utils'

import AutomateExploreDataModal, {
    AutomateExploreDataModalHandle,
} from './AutomateExploreDataModal'

import css from './AutomateSavingsCard.less'

interface Props {
    moneySavedPerInteraction: number
    automatedInteractions: Maybe<number>
    resolutionTime: Maybe<number>
    firstResponseTime: Maybe<number>
    ticketHandleTime: Maybe<number>
    hasAgentCosts?: boolean
}

export const AutomateSavingsCard = ({
    moneySavedPerInteraction,
    automatedInteractions,
    resolutionTime,
    firstResponseTime,
    ticketHandleTime,
    hasAgentCosts = false,
}: Props) => {
    const isTicketTimeToHandleEnabled =
        useFlags()[FeatureFlagKey.ObservabilityTicketTimeToHandle]

    const exploreDataModal = useRef<AutomateExploreDataModalHandle>(null)

    const amountSaved = moneySavedPerInteraction * (automatedInteractions ?? 0)

    const user = useAppSelector(getCurrentUser)

    const hasAccessToROICalculator =
        useFlags()[FeatureFlagKey.ObservabilityROICalculator] &&
        (isAdmin(user) || hasAgentPrivileges(user))

    const timeSavedByAgents =
        (automatedInteractions ?? 0) * (ticketHandleTime ?? 0)

    return (
        <div className={css.container}>
            <div className={css.savings}>
                <p className="mb-1">In the last 28 days</p>
                <div className={css.headings}>
                    <div className={css.wrapper}>
                        <h2 className={css.heading}>
                            AI Agent saved your team
                        </h2>
                        <div className={css.valuesContainer}>
                            <div className={css.values}>
                                <div>
                                    <div className={css.heading}>
                                        {formatCurrency(
                                            Math.round(amountSaved),
                                            'usd',
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <p className={css.subheading}>
                                            In support costs
                                        </p>
                                        <HintTooltip
                                            title="Your estimated savings from automating support tickets instead of paying agents to handle them. Make sure your agent salary represents the full cost of staffing to get an accurate estimate. "
                                            link="https://link.gorgias.com/cge"
                                        />
                                    </div>
                                </div>
                                {isTicketTimeToHandleEnabled && (
                                    <div>
                                        <div className={css.heading}>
                                            {timeSavedByAgents
                                                ? formatMetricValue(
                                                      timeSavedByAgents,
                                                      'duration',
                                                  )
                                                : '0h 0m'}
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <p className={css.subheading}>
                                                {`Of agents' time`}
                                            </p>
                                            <HintTooltip
                                                title="How much time your agents would have spent resolving all the customer questions that got instantly resolved by AI Agent. Based on your actual automated interactions and average handle time (AHT)."
                                                link="https://link.gorgias.com/jax"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={css.divider} />
                    <div className={css.wrapper}>
                        <h2 className={css.heading}>
                            AI Agent saved your customers
                        </h2>
                        <div className={css.valuesContainer}>
                            <div className={css.values}>
                                <div>
                                    <div className={css.heading}>
                                        {firstResponseTime
                                            ? formatMetricValue(
                                                  firstResponseTime,
                                                  'duration',
                                              )
                                            : '0h 0m'}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <p className={css.subheading}>
                                            In average first response
                                        </p>
                                        <HintTooltip
                                            title="How much longer customers would have had to wait for a first response if you were not using AI Agent, based on your average first response time."
                                            link="https://link.gorgias.com/mal"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className={css.heading}>
                                        {resolutionTime
                                            ? formatMetricValue(
                                                  resolutionTime,
                                                  'duration',
                                              )
                                            : '0h 0m'}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <p className={css.subheading}>
                                            In average resolution time
                                        </p>
                                        <HintTooltip
                                            title="How much faster Gorgias AI Agent is helping your team resolve interactions, based on your average resolution time."
                                            link="https://link.gorgias.com/ec5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {hasAccessToROICalculator && (
                    <>
                        <Button
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => exploreDataModal.current?.open()}
                            leadingIcon="calculate"
                        >
                            Explore Data
                        </Button>
                        <AutomateExploreDataModal
                            monthlySupportTickets={automatedInteractions}
                            firstResponseTime={firstResponseTime}
                            resolutionTime={resolutionTime}
                            ticketHandleTime={ticketHandleTime}
                            hasAgentCosts={hasAgentCosts}
                            ref={exploreDataModal}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
