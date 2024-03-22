import React, {useEffect, useMemo, useRef, useState} from 'react'
import moment from 'moment'
import classNames from 'classnames'

import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Label from 'pages/common/forms/Label/Label'
import Tooltip from 'pages/common/components/Tooltip'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/constants'
import {
    useClosedTicketsTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
} from 'hooks/reporting/metricTrends'

import {useGetCostPerBillableTicket} from 'pages/automate/common/hooks/useGetCostPerBillableTicket'
import {useGetCostPerAutomatedInteraction} from 'pages/automate/common/hooks/useGetCostPerAutomatedInteraction'
import {formatCurrency} from 'pages/stats/common/utils'
import {SUPPORT_METRICS_TYPES, SALARY_TYPES} from './constants'
import css from './ROICalculator.less'
import {
    convertSecondsToHours,
    formatOnBlur,
    formatOnFocus,
    formatValue,
    getFirstResponseTimeWithAutomate,
    getResolutionTimeWithAutomate,
} from './utils'

const ROICalculator = () => {
    const agentWagesRef = useRef(null)
    const currentResolutionTimeRef = useRef(null)
    const currentFirstResponseRef = useRef(null)

    const {startDatetime, endDatetime} = useMemo(() => {
        const startDatetime = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()

        const endDatetime = moment().endOf('day').format()

        return {
            startDatetime,
            endDatetime,
        }
    }, [])

    const filters = {
        period: {
            end_datetime: endDatetime,
            start_datetime: startDatetime,
        },
    }

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const resolutionTimeTrend = useMedianResolutionTimeTrend(
        filters,
        userTimezone
    )
    const firstResponseTimeTrend = useMedianFirstResponseTimeTrend(
        filters,
        userTimezone
    )

    const ticketsClosedTrend = useClosedTicketsTrend(filters, userTimezone)

    const costPerAutomatedInteraction = useGetCostPerAutomatedInteraction()
    const costPerBillableTicket = useGetCostPerBillableTicket()

    const [metricsType, setMetricsType] = useState('monthly_support_tickets')
    const [salaryType, setSalaryType] = useState('annual_salary')

    const [metricsValue, setMetricsValue] = useState('0')
    const [salaryValue, setSalaryValue] = useState('15.5')

    const [resolutionTime, setResolutionTime] = useState<number | string>(
        '4hrs'
    )
    const [firstResponseTime, setFirstResponseTime] = useState<number | string>(
        '12hrs'
    )

    const [isMetricsDisabled, setIsMetricsDisabled] = useState(false)
    const [isResolutionTimeDisabled, setIsResolutionTimeDisabled] =
        useState(false)
    const [isFirstResponseTimeDisabled, setIsFirstResponseTimeDisabled] =
        useState(false)

    const [costWithoutAutomate, setCostWithoutAutomate] = useState<
        string | number
    >('(X)')
    const [costWithAutomate, setCostWithAutomate] = useState<string | number>(
        '(X)'
    )

    const closedTickets = useMemo(
        () => ticketsClosedTrend.data?.value || 0,
        [ticketsClosedTrend.data?.value]
    )

    const [savedInPercentage, setSavedInPercentage] = useState('(x)')

    // Set the resolution time and determine if it's disabled
    useEffect(() => {
        setResolutionTime(
            `${
                convertSecondsToHours(resolutionTimeTrend.data?.value) || '4'
            }hrs`
        )

        if (resolutionTimeTrend.data?.value) {
            setIsResolutionTimeDisabled(true)
        }
    }, [resolutionTimeTrend.data?.value])

    // Set the first response time and determine if it's disabled
    useEffect(() => {
        setFirstResponseTime(
            `${
                convertSecondsToHours(firstResponseTimeTrend.data?.value) ||
                '12'
            }hrs`
        )

        if (firstResponseTimeTrend.data?.value) {
            setIsFirstResponseTimeDisabled(true)
        }
    }, [firstResponseTimeTrend.data?.value])

    // Set the metrics value based on the metrics type
    useEffect(() => {
        if (metricsType === 'full_time_support_agents') {
            setMetricsValue('')
            setIsMetricsDisabled(false)
        } else {
            setMetricsValue(closedTickets.toLocaleString())

            if (closedTickets) {
                setIsMetricsDisabled(true)
            }
        }
    }, [metricsType, closedTickets])

    // Set the salary value based on the salary type
    useEffect(() => {
        if (salaryType === SALARY_TYPES.annual_salary.value) {
            setSalaryValue(formatValue('31248'))
        } else {
            setSalaryValue('15.5')
        }
    }, [salaryType])

    // Calculate the cost without and with automate and the saved amount in percentage
    useEffect(() => {
        const salary = salaryValue.replace(/[^0-9.]/g, '')
        const agentCostPerTicket =
            salaryType === 'annual_salary'
                ? Number(salary) / (12 * 840)
                : Number(salary) / 5

        const metricsNumber = Number(metricsValue.replace(/[^0-9.]/g, ''))

        const numberOfTickets =
            closedTickets ||
            (metricsType === 'monthly_support_tickets'
                ? metricsNumber
                : metricsNumber * 40 * 21)

        const costWithoutAutomate = Math.round(
            numberOfTickets * (agentCostPerTicket + costPerBillableTicket)
        )

        const costWithAutomate = Math.round(
            numberOfTickets * (agentCostPerTicket + costPerBillableTicket) -
                0.3 *
                    numberOfTickets *
                    (agentCostPerTicket +
                        costPerBillableTicket -
                        costPerAutomatedInteraction)
        )

        setCostWithoutAutomate(
            costWithoutAutomate > 0 ? costWithoutAutomate : '(X)'
        )

        setCostWithAutomate(costWithAutomate > 0 ? costWithAutomate : '(X)')

        setSavedInPercentage(
            `${Math.round((1 - costWithAutomate / costWithoutAutomate) * 100)}%`
        )
    }, [
        metricsType,
        metricsValue,
        closedTickets,
        costPerAutomatedInteraction,
        costPerBillableTicket,
        salaryType,
        salaryValue,
    ])

    return (
        <div className={css.container}>
            <div className={css.formContainer}>
                <div className={css.formRow}>
                    <div className={css.labelContainer}>
                        <Label>Number of:</Label>
                    </div>
                    <div className={css.inputsContainer}>
                        <SelectField
                            className={css.selectField}
                            options={Object.values(SUPPORT_METRICS_TYPES)}
                            value={metricsType}
                            onChange={(value) => setMetricsType(String(value))}
                            disabled={isMetricsDisabled}
                        />
                        <InputField
                            placeholder="0000"
                            onChange={(val) =>
                                setMetricsValue(formatValue(val))
                            }
                            value={metricsValue}
                            isDisabled={isMetricsDisabled}
                            data-testid="metrics-value-input"
                        />
                    </div>
                </div>
                <div className={css.formRow}>
                    <div className={css.labelContainer}>
                        <Label>Agent wages</Label>
                        <i className={'material-icons'} ref={agentWagesRef}>
                            info_outline
                        </i>
                        <Tooltip placement="right" target={agentWagesRef}>
                            Average hourly rate or annual salary of a support
                            agent, in USD. By default, we use the industry
                            average hourly rate. Wage information will not be
                            stored in our system.
                        </Tooltip>
                    </div>
                    <div className={css.inputsContainer}>
                        <SelectField
                            className={css.selectField}
                            options={Object.values(SALARY_TYPES)}
                            value={salaryType}
                            onChange={(value) => setSalaryType(String(value))}
                        />
                        <InputField
                            placeholder="0"
                            onChange={(value) =>
                                setSalaryValue(formatValue(value))
                            }
                            value={salaryValue}
                            className={css.salaryValue}
                            prefix="$"
                            data-testid="salary-value-input"
                        />
                    </div>
                </div>
                <div className={css.formRow}>
                    <div className={css.labelContainer}>
                        <Label>Current resolution time</Label>
                        <i
                            className={'material-icons'}
                            ref={currentResolutionTimeRef}
                        >
                            info_outline
                        </i>
                        <Tooltip
                            placement="right"
                            target={currentResolutionTimeRef}
                        >
                            Resolution time for non-automated tickets in the
                            last 28 days
                        </Tooltip>
                    </div>
                    <div className={css.inputsContainer}>
                        <InputField
                            className={classNames(
                                css.inputField,
                                css.resolutionTime
                            )}
                            value={resolutionTime}
                            isDisabled={isResolutionTimeDisabled}
                            placeholder="hrs"
                            onChange={(val) => setResolutionTime(val)}
                            onFocus={() =>
                                formatOnFocus(setResolutionTime, resolutionTime)
                            }
                            onBlur={() =>
                                formatOnBlur(setResolutionTime, resolutionTime)
                            }
                            data-testid="resolution-time-input"
                        />
                    </div>
                </div>
                <div className={css.formRow}>
                    <div className={css.labelContainer}>
                        <Label>Current first response time</Label>
                        <i
                            className={'material-icons'}
                            ref={currentFirstResponseRef}
                        >
                            info_outline
                        </i>
                        <Tooltip
                            placement="right"
                            target={currentFirstResponseRef}
                        >
                            First response time for non-automated tickets in the
                            last 28 days
                        </Tooltip>
                    </div>
                    <div className={css.inputsContainer}>
                        <InputField
                            className={css.inputField}
                            value={firstResponseTime}
                            isDisabled={isFirstResponseTimeDisabled}
                            placeholder="hrs"
                            onChange={(val) => setFirstResponseTime(val)}
                            onFocus={() => {
                                formatOnFocus(
                                    setFirstResponseTime,
                                    firstResponseTime
                                )
                            }}
                            onBlur={() => {
                                formatOnBlur(
                                    setFirstResponseTime,
                                    firstResponseTime
                                )
                            }}
                            data-testid="first-response-time-input"
                        />
                    </div>
                </div>
            </div>
            <div className={css.resultsContainer}>
                <div className={css.resultsWrapper}>
                    <div className={css.title}>
                        Monthly cost to answer support tickets:
                    </div>
                    <div className={css.resultRowBackground}>
                        <div className={css.withoutAutomate}>
                            <div className={css.resultTitle}>
                                Without Automate
                            </div>
                            <div
                                className={classNames(
                                    css.automateCost,
                                    css.withoutAutomateCost
                                )}
                                data-testid="cost-without-automate"
                            >
                                {formatCurrency(
                                    Number(costWithoutAutomate) || 0,
                                    'usd'
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={css.resultRowBackground}>
                        <div className={css.withAutomate}>
                            <div className={css.resultTitle}>With Automate</div>
                            <div
                                className={classNames(
                                    css.automateCost,
                                    css.withAutomateCost
                                )}
                                data-testid="cost-with-automate"
                            >
                                {formatCurrency(
                                    Number(costWithAutomate) || 0,
                                    'usd'
                                )}
                            </div>
                        </div>
                        <div className={css.savePercentage}>
                            Save {savedInPercentage}
                        </div>
                    </div>
                    <div className={css.reduceTimeContainer}>
                        <div className={css.reduceResolutionTime}>
                            <div className={css.reducePercentage}>
                                Reduce resolution time by 30%
                            </div>
                            <div className={css.reduceTime}>
                                to{' '}
                                {getResolutionTimeWithAutomate(resolutionTime)}
                                hrs
                            </div>
                        </div>
                        <div className={css.reduceFirstResponseTime}>
                            <div className={css.reducePercentage}>
                                Reduce first response time by 30%
                            </div>
                            <div className={css.reduceTime}>
                                to{' '}
                                {getFirstResponseTimeWithAutomate(
                                    firstResponseTime
                                )}
                                hrs
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ROICalculator
