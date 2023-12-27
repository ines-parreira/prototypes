import React from 'react'
import classnames from 'classnames'

import useId from 'hooks/useId'
import {PlanInterval} from 'models/billing/types'
import Tooltip from 'pages/common/components/Tooltip'
import CheckBox from 'pages/common/forms/CheckBox'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'

import css from './AutomateAmount.less'

const AutomationLabel = ({id}: {id: string}) => {
    return (
        <div className={classnames('align-middle', css.checkboxLabel)}>
            <span id={`automation-text-${id}`}>Automate</span>
        </div>
    )
}

type Props = {
    addOnAmount?: number | string
    currency?: string
    fullAddOnAmount?: number
    interval?: PlanInterval
    isAutomateChecked?: boolean
    onAutomateChange?: () => void
    editable?: boolean
    isIntervalAbbreviated?: boolean
}

const AutomateAmount = ({
    addOnAmount,
    currency,
    fullAddOnAmount,
    interval,
    isAutomateChecked,
    onAutomateChange,
    editable = true,
    isIntervalAbbreviated = false,
}: Props) => {
    const checkboxId = useId()

    return (
        <>
            {editable ? (
                <div className={css.automationRow}>
                    {typeof addOnAmount === 'number' ? (
                        <CheckBox
                            className={css.checkbox}
                            name={checkboxId}
                            isChecked={isAutomateChecked}
                            {...(!!onAutomateChange
                                ? {onChange: onAutomateChange}
                                : {readOnly: true})}
                        >
                            <AutomationLabel id={checkboxId} />
                        </CheckBox>
                    ) : (
                        <AutomationLabel id={checkboxId} />
                    )}
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        currency &&
                        interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                fullAmount={fullAddOnAmount}
                                className={classnames(css.amount, {
                                    [css.amountDisabled]: !isAutomateChecked,
                                })}
                                currency={currency}
                                interval={interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                                isIntervalAbbreviated={isIntervalAbbreviated}
                            />
                        ) : (
                            <i>{addOnAmount || 'Unavailable'}</i>
                        )}
                    </div>
                    <Tooltip
                        target={`automation-text-${checkboxId}`}
                        placement="top-start"
                        innerClassName={css.tooltip}
                        fade={false}
                        autohide={false}
                    >
                        Automate up to 20% of all interactions with quick
                        responses, order management, article recommendation, and
                        advanced statistics.
                    </Tooltip>
                </div>
            ) : (
                <div className={css.automationRow}>
                    <div
                        className={classnames(
                            'align-middle',
                            css.checkboxLabel
                        )}
                    >
                        Automate
                    </div>
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        currency &&
                        interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                fullAmount={fullAddOnAmount}
                                className={classnames(css.amount)}
                                currency={currency}
                                interval={interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                                isIntervalAbbreviated={isIntervalAbbreviated}
                            />
                        ) : (
                            <i>{addOnAmount || 'Unavailable'}</i>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default AutomateAmount
