import React, {useEffect, useMemo, useRef, useState} from 'react'
import moment from 'moment'
import classNames from 'classnames'
import {Label, Tooltip} from '@gorgias/ui-kit'

import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/constants'
import {
    useClosedTicketsTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useTicketHandleTimeTrend,
} from 'hooks/reporting/metricTrends'

import {useGetCostPerBillableTicket} from 'pages/automate/common/hooks/useGetCostPerBillableTicket'
import {useGetCostPerAutomatedInteraction} from 'pages/automate/common/hooks/useGetCostPerAutomatedInteraction'
import {formatCurrency, formatMetricValue} from 'pages/stats/common/utils'
import {PlanInterval} from 'models/billing/types'
import {getAvailableAutomatePlans} from 'state/billing/selectors'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import {SUPPORT_METRICS_TYPES, SALARY_TYPES} from './constants'
import css from './ROICalculator.less'
import {
    convertSecondsToHours,
    convertSecondsToMinutes,
    formatOnBlur,
    formatOnFocus,
    formatValue,
    getAutomateSubscriptionPrice,
    getFirstResponseTimeWithAutomate,
    getResolutionTimeWithAutomate,
} from './utils'

const isFiniteAndPositive = (value: number) => isFinite(value) && value > 0

const ROICalculator = () => {
    const agentWagesRef = useRef(null)
    const currentResolutionTimeRef = useRef(null)
    const currentFirstResponseRef = useRef(null)

    const filters = useMemo(() => {
        const startDatetime = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()

        const endDatetime = moment().endOf('day').format()

        return {
            period: {
                end_datetime: endDatetime,
                start_datetime: startDatetime,
            },
        }
    }, [])

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

    const ticketHandleTimeTrend = useTicketHandleTimeTrend(
        filters,
        userTimezone
    )

    const ticketsClosedTrend = useClosedTicketsTrend(filters, userTimezone)

    const costPerAutomatedInteraction = useGetCostPerAutomatedInteraction()
    const costPerBillableTicket = useGetCostPerBillableTicket()

    const automationPrices = useAppSelector(getAvailableAutomatePlans)

    const [metricsType, setMetricsType] = useState('monthly_support_tickets')
    const [salaryType, setSalaryType] = useState('hourly_rate')

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

    const [numberOfTickets, setNumberOfTickets] = useState(0)

    const [ticketsClosedPerHour, setTicketsClosedPerHour] = useState('5')

    const [ticketHandleTime, setTicketHandleTime] = useState<string | number>(
        '2m'
    )

    const [savedInPercentage, setSavedInPercentage] = useState('0%')

    const timeSavedTotal = useMemo(() => {
        const ticketHandleTimeInSeconds =
            Number(ticketHandleTime.toString().replace(/[^0-9.]/g, '')) * 60
        const timeSavedTotal = numberOfTickets * ticketHandleTimeInSeconds * 0.3

        return formatMetricValue(timeSavedTotal, 'duration')
    }, [ticketHandleTime, numberOfTickets])
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

    // Set the ticket handle time
    useEffect(() => {
        setTicketHandleTime(
            `${
                convertSecondsToMinutes(ticketHandleTimeTrend.data?.value) ||
                '2'
            }m`
        )
    }, [ticketHandleTimeTrend.data?.value])

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

    // Calculate the cost without and with Automate and the saved amount in percentage
    useEffect(() => {
        const salary = salaryValue.replace(/[^0-9.]/g, '')
        const agentCostPerTicket =
            salaryType === 'annual_salary'
                ? Number(salary) / (12 * 21 * 8 * Number(ticketsClosedPerHour))
                : Number(salary) / Number(ticketsClosedPerHour)

        const metricsNumber = Number(metricsValue.replace(/[^0-9.]/g, ''))

        const numberOfTickets =
            closedTickets ||
            (metricsType === 'monthly_support_tickets'
                ? metricsNumber
                : metricsNumber * 40 * 21)

        setNumberOfTickets(numberOfTickets)

        const automateSubscriptionPrices = automationPrices.filter(
            (price) => price.interval === PlanInterval.Month
        )

        const automateSubscriptionPrice = getAutomateSubscriptionPrice(
            automateSubscriptionPrices,
            numberOfTickets
        )

        const costWithoutAutomate = Math.round(
            numberOfTickets * (agentCostPerTicket + costPerBillableTicket)
        )

        const costWithAutomate = Math.round(
            automateSubscriptionPrice +
                numberOfTickets * (agentCostPerTicket + costPerBillableTicket) -
                0.3 *
                    numberOfTickets *
                    (agentCostPerTicket +
                        costPerBillableTicket -
                        costPerAutomatedInteraction)
        )

        setCostWithoutAutomate(
            isFiniteAndPositive(costWithoutAutomate) ? costWithoutAutomate : 0
        )

        setCostWithAutomate(
            isFiniteAndPositive(costWithAutomate) ? costWithAutomate : 0
        )

        if (costWithoutAutomate > 0) {
            const saved = Math.round(
                (1 - costWithAutomate / costWithoutAutomate) * 100
            )

            setSavedInPercentage(
                isFiniteAndPositive(saved) ? `${saved}%` : '0%'
            )
        }
    }, [
        metricsType,
        metricsValue,
        closedTickets,
        costPerAutomatedInteraction,
        costPerBillableTicket,
        salaryType,
        salaryValue,
        automationPrices,
        ticketsClosedPerHour,
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
                            dropdownMenuClassName={css.selectFieldDropdown}
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
                    <Label>
                        Tickets handled per hour{' '}
                        <HintTooltip title="Average number of tickets handled by one agent in an hour over the last 28 days" />
                    </Label>
                    <div className={css.inputsContainer}>
                        <InputField
                            className={css.inputField}
                            value={ticketsClosedPerHour}
                            onChange={(val) =>
                                setTicketsClosedPerHour(formatValue(val))
                            }
                            data-testid="tickets-closed-per-hour-input"
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
                            dropdownMenuClassName={css.selectFieldDropdown}
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
                            onChange={(val) =>
                                setResolutionTime(formatValue(val))
                            }
                            onFocus={() =>
                                formatOnFocus(setResolutionTime, resolutionTime)
                            }
                            onBlur={() =>
                                formatOnBlur(
                                    setResolutionTime,
                                    resolutionTime,
                                    'hrs'
                                )
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
                            onChange={(val) =>
                                setFirstResponseTime(formatValue(val))
                            }
                            onFocus={() => {
                                formatOnFocus(
                                    setFirstResponseTime,
                                    firstResponseTime
                                )
                            }}
                            onBlur={() => {
                                formatOnBlur(
                                    setFirstResponseTime,
                                    firstResponseTime,
                                    'hrs'
                                )
                            }}
                            data-testid="first-response-time-input"
                        />
                    </div>
                </div>
                <div className={css.formRow}>
                    <Label>
                        Current ticket handle time{' '}
                        <HintTooltip title="Average amount of time spent by any agent on tickets closed in the last 28 days" />
                    </Label>
                    <div className={css.inputsContainer}>
                        <InputField
                            className={css.inputField}
                            value={ticketHandleTime}
                            onChange={(val) => {
                                return setTicketHandleTime(formatValue(val))
                            }}
                            onFocus={() =>
                                formatOnFocus(
                                    setTicketHandleTime,
                                    ticketHandleTime
                                )
                            }
                            onBlur={() =>
                                formatOnBlur(
                                    setTicketHandleTime,
                                    ticketHandleTime,
                                    'm'
                                )
                            }
                            isDisabled={!!ticketHandleTimeTrend.data?.value}
                            placeholder="m"
                            data-testid="ticket-handle-time-input"
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
                        <div
                            className={css.savePercentage}
                            data-testid="saved-in-percentage"
                        >
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
                    <div className={css.timeSaved}>
                        <div className={css.timeSavedPercentage}>
                            Increase time saved by your agents by 30%
                        </div>
                        <div className={css.timeSavedTime}>
                            to {timeSavedTotal}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ROICalculator
