import React from 'react'
import {formatCurrency, formatMetricValue} from 'pages/stats/common/utils'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import css from './AutomationSavingsCard.less'

interface Props {
    amountSaved: number
    teamTimeSaved: Maybe<number>
    customersTimeSaved: Maybe<number>
}

export const AutomationSavingsCard = ({
    amountSaved,
    teamTimeSaved,
    customersTimeSaved,
}: Props) => {
    return (
        <div className={css.container}>
            <p className="mb-1">In the last 28 days</p>
            <div className={css.headings}>
                <div className={css.wrapper}>
                    <h2 className={css.heading}>Automate saved your team</h2>
                    <div className={css.valuesContainer}>
                        <div className={css.values}>
                            <div>
                                <div className={css.heading}>
                                    {formatCurrency(
                                        Math.round(amountSaved),
                                        'usd'
                                    )}
                                </div>
                                <div className="d-flex align-items-center">
                                    <p className={css.subheading}>
                                        In support costs
                                    </p>
                                    <HintTooltip title="How much more it would have cost if these interactions were handled by an agent, based on Helpdesk ticket cost plus the benchmark agent cost of $3.1 per ticket." />
                                </div>
                            </div>
                            <div>
                                <div className={css.heading}>
                                    {teamTimeSaved
                                        ? formatMetricValue(
                                              teamTimeSaved,
                                              'duration'
                                          )
                                        : '0h 0m'}
                                </div>
                                <div className="d-flex align-items-center">
                                    <p className={css.subheading}>Of time</p>
                                    <HintTooltip title="How much time agents would have spent resolving your automated interactions, based on your average resolution time." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={css.divider} />
                <div className={css.wrapper}>
                    <h2 className={css.heading}>
                        Automate saved your customers
                    </h2>
                    <div className={css.valuesContainer}>
                        <div className={css.values}>
                            <div>
                                <div className={css.heading}>
                                    {customersTimeSaved
                                        ? formatMetricValue(
                                              customersTimeSaved,
                                              'duration'
                                          )
                                        : '0h 0m'}
                                </div>
                                <div className="d-flex align-items-center">
                                    <p className={css.subheading}>
                                        In average first response
                                    </p>
                                    <HintTooltip title="How much longer customers would have had to wait for a first response if you were not using Automate, based on your average first response time." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
