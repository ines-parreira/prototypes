import {Label, Tooltip} from '@gorgias/ui-kit'
import React, {forwardRef, useImperativeHandle, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {createAccountSetting, updateAccountSetting} from 'models/account'

import css from 'pages/automate/common/components/AutomateExploreDataModal.less'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {formatValue} from 'pages/settings/billing/automate/ROICalculator/utils'
import {HintTooltip} from 'pages/stats/common/HintTooltip'

import {formatMetricValue} from 'pages/stats/common/utils'
import {submitSettingSuccess} from 'state/currentAccount/actions'
import {getAgentCostsSettings} from 'state/currentAccount/selectors'
import {
    AccountSettingAgentCostType,
    AccountSettingAgentCosts,
    AccountSettingType,
} from 'state/currentAccount/types'

const defaultAgentCostPerTicket = 3.1
const defaultHourlyRateMultiplier = 5
const defaultAnnualSalaryMultiplier = 12 * 840

const getMultipliers = (ticketPerHour: string | undefined) => {
    const hourlyRateMultiplier = ticketPerHour
        ? Number(ticketPerHour)
        : defaultHourlyRateMultiplier

    return {
        hourlyRateMultiplier,
        annualSalaryMultiplier: 12 * 21 * 8 * hourlyRateMultiplier,
    }
}

const agentCostTypeOptions: {
    label: string
    value: AccountSettingAgentCostType
}[] = [
    {label: 'Annual Salary', value: 'yearly'},
    {label: 'Hourly Rate', value: 'hourly'},
]

type Props = {
    resolutionTime: Maybe<number>
    firstResponseTime: Maybe<number>
    monthlySupportTickets: Maybe<number>
    ticketHandleTime: Maybe<number>
    hasAgentCosts: boolean
}

export type AutomateExploreDataModalHandle = {
    open: () => void
}

const AutomateExploreDataModal = forwardRef<
    AutomateExploreDataModalHandle,
    Props
>(
    (
        {
            firstResponseTime,
            resolutionTime,
            monthlySupportTickets,
            ticketHandleTime,
            hasAgentCosts,
        },
        ref
    ) => {
        const defaultAgentHourlyRate = (
            defaultAgentCostPerTicket * defaultHourlyRateMultiplier
        ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        const defaultAgentAnnualSalary = (
            defaultAgentCostPerTicket * defaultAnnualSalaryMultiplier
        ).toLocaleString(undefined, {maximumFractionDigits: 2})

        const dispatch = useAppDispatch()
        const agentCosts = useAppSelector(getAgentCostsSettings)

        const [isOpen, setIsOpen] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const [isCostValueDirty, setIsCostValueDirty] = useState(false)

        const [ticketPerHour, setTicketPerHour] = useState<string>(
            agentCosts?.data.agent_ticket_per_hour
                ? String(agentCosts?.data.agent_ticket_per_hour)
                : '5'
        )

        const [costPerTicket, setCostPerTicket] = useState<number | undefined>(
            agentCosts?.data.agent_cost_per_ticket
        )

        const [costType, setCostType] = useState<AccountSettingAgentCostType>(
            agentCosts?.data.agent_cost_type || 'hourly'
        )

        const {hourlyRateMultiplier, annualSalaryMultiplier} =
            getMultipliers(ticketPerHour)

        const hourlyCostValue = costPerTicket
            ? (costPerTicket * hourlyRateMultiplier).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : defaultAgentHourlyRate
        const annualSalaryCostValue = costPerTicket
            ? (costPerTicket * annualSalaryMultiplier).toLocaleString(
                  undefined,
                  {
                      maximumFractionDigits: 2,
                  }
              )
            : defaultAgentAnnualSalary

        const [costValue, setCostValue] = useState<string>(
            hasAgentCosts
                ? '****'
                : agentCosts?.data.agent_cost_type === 'yearly'
                  ? annualSalaryCostValue
                  : hourlyCostValue
        )

        const [initialValues, setInitialValues] = useState({
            costType,
            costPerTicket,
            ticketPerHour,
        })

        const onCostTypeChange = (val: AccountSettingAgentCostType) => {
            setCostType(val)
            setCostValue(
                costValue === '****'
                    ? '****'
                    : val === 'yearly'
                      ? annualSalaryCostValue
                      : hourlyCostValue
            )
        }

        useImperativeHandle(
            ref,
            () => ({
                open: () => {
                    setIsOpen(true)
                    setInitialValues({
                        costType,
                        costPerTicket,
                        ticketPerHour,
                    })
                },
            }),
            [costType, costPerTicket, ticketPerHour]
        )

        const onClose = () => {
            setCostValue('****')
            setIsOpen(false)
        }

        const onSubmit = async () => {
            if (costPerTicket === undefined) {
                return
            }

            setIsLoading(true)

            const data = {
                agent_cost_type: costType,
                agent_cost_per_ticket: costPerTicket,
                agent_ticket_per_hour: Number(ticketPerHour),
            }

            const resp = await (agentCosts
                ? updateAccountSetting({
                      ...agentCosts,
                      data: {
                          ...agentCosts.data,
                          ...data,
                      },
                  } as AccountSettingAgentCosts)
                : createAccountSetting({
                      type: AccountSettingType.AgentCosts,
                      data,
                  }))

            dispatch(submitSettingSuccess(resp.data, !!agentCosts))

            setInitialValues({
                costType,
                costPerTicket,
                ticketPerHour,
            })

            setIsLoading(false)
            onClose()
        }

        const isDirty =
            initialValues.costType !== costType ||
            initialValues.ticketPerHour !== ticketPerHour ||
            isCostValueDirty

        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalHeader title="Explore Data" />
                <ModalBody>
                    <div className={css.fields}>
                        <div>
                            <Label className={css.label}>
                                Agent wages{' '}
                                <span
                                    id="agent-wages-tooltip"
                                    className={css.infoIcon}
                                >
                                    <i className="material-icons">
                                        info_outline
                                    </i>
                                </span>
                                <Tooltip
                                    target="agent-wages-tooltip"
                                    className={css.tooltip}
                                >
                                    Average hourly rate or annual salary of a
                                    support agent, in USD. By default, we use
                                    the industry average hourly rate ($
                                    {defaultAgentHourlyRate}). Wage information
                                    will not be stored in our system.
                                </Tooltip>
                            </Label>
                            <div className={css.fieldsRow}>
                                <SelectField
                                    value={costType}
                                    onChange={(val) =>
                                        onCostTypeChange(
                                            val as AccountSettingAgentCostType
                                        )
                                    }
                                    options={agentCostTypeOptions}
                                    dropdownMenuClassName={
                                        css.selectFieldDropdown
                                    }
                                />
                                <InputField
                                    placeholder={
                                        costType === 'hourly'
                                            ? defaultAgentHourlyRate
                                            : defaultAgentAnnualSalary
                                    }
                                    value={costValue}
                                    onChange={(val) => {
                                        setIsCostValueDirty(true)
                                        setCostValue(formatValue(val))
                                        setCostPerTicket(
                                            parseFloat(
                                                val.replace(/[^0-9.]/g, '')
                                            ) /
                                                (costType === 'hourly'
                                                    ? hourlyRateMultiplier
                                                    : annualSalaryMultiplier)
                                        )
                                    }}
                                    step="0.01"
                                    prefix="$"
                                    lang="en"
                                    aria-label="Agent cost"
                                />
                            </div>
                        </div>
                        <div className={css.fieldsRow}>
                            <div>
                                <Label className={css.label}>
                                    Tickets handled per hour{' '}
                                    <HintTooltip title="Average number of tickets handled by one agent in an hour over the last 28 days" />
                                </Label>
                                <InputField
                                    value={ticketPerHour}
                                    placeholder="5"
                                    onChange={(val) => {
                                        const ticketPerHour = val.replace(
                                            /[^0-9.]/g,
                                            ''
                                        )
                                        const costValueFloat = parseFloat(
                                            costValue.replace(/[^0-9.]/g, '')
                                        )

                                        const {
                                            hourlyRateMultiplier,
                                            annualSalaryMultiplier,
                                        } = getMultipliers(ticketPerHour)

                                        setTicketPerHour(ticketPerHour)
                                        setCostPerTicket(
                                            costValueFloat /
                                                (costType === 'hourly'
                                                    ? hourlyRateMultiplier
                                                    : annualSalaryMultiplier)
                                        )
                                    }}
                                    aria-label="Tickets closed per hour"
                                />
                            </div>
                            <div>
                                <Label className={css.label}>
                                    Monthly support tickets{' '}
                                    <span
                                        id="monthly-support-tickets-tooltip"
                                        className={css.infoIcon}
                                    >
                                        <i className="material-icons">
                                            info_outline
                                        </i>
                                    </span>
                                    <Tooltip
                                        target="monthly-support-tickets-tooltip"
                                        className={css.tooltip}
                                    >
                                        Total number of support tickets in the
                                        last 28 days on your helpdesk.
                                    </Tooltip>
                                </Label>
                                <InputField
                                    value={monthlySupportTickets || 'N/A'}
                                    isDisabled
                                    aria-label="Monthly support tickets"
                                />
                            </div>
                        </div>
                        <div className={css.fieldsRow}>
                            <div>
                                <Label className={css.label}>
                                    Current resolution time{' '}
                                    <span
                                        id="current-resolution-time-tooltip"
                                        className={css.infoIcon}
                                    >
                                        <i className="material-icons">
                                            info_outline
                                        </i>
                                    </span>
                                    <Tooltip
                                        target="current-resolution-time-tooltip"
                                        className={css.tooltip}
                                    >
                                        Resolution time for non-automated
                                        tickets in the last 28 days pulled from
                                        Support Performance statistics.
                                    </Tooltip>
                                </Label>
                                <InputField
                                    value={
                                        resolutionTime
                                            ? formatMetricValue(
                                                  resolutionTime,
                                                  'duration'
                                              )
                                            : '0h 0m'
                                    }
                                    isDisabled
                                    aria-label="Current resolution time"
                                />
                            </div>
                            <div>
                                <Label className={css.label}>
                                    Current first response time{' '}
                                    <span
                                        id="current-first-response-time-tooltip"
                                        className={css.infoIcon}
                                    >
                                        <i className="material-icons">
                                            info_outline
                                        </i>
                                    </span>
                                    <Tooltip
                                        target="current-first-response-time-tooltip"
                                        className={css.tooltip}
                                    >
                                        First response time for non-automated
                                        tickets in the last 28 days pulled from
                                        Support Performance statistics.
                                    </Tooltip>
                                </Label>
                                <InputField
                                    value={
                                        firstResponseTime
                                            ? formatMetricValue(
                                                  firstResponseTime,
                                                  'duration'
                                              )
                                            : '0h 0m'
                                    }
                                    isDisabled
                                    aria-label="Current first response time"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className={css.label}>
                                Average ticket handle time{' '}
                                <HintTooltip
                                    title={
                                        <>
                                            <div>
                                                Average amount of time spent by
                                                any agent on tickets closed in
                                                the last 28 days
                                            </div>
                                            <a
                                                href="https://link.gorgias.com/eq6"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                How is it calculated?
                                            </a>
                                        </>
                                    }
                                />
                            </Label>
                            <InputField
                                value={
                                    resolutionTime
                                        ? formatMetricValue(
                                              ticketHandleTime,
                                              'duration'
                                          )
                                        : '0h 0m'
                                }
                                isDisabled
                                aria-label="Ticket handle time"
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button onClick={onClose} intent="secondary">
                        Cancel
                    </Button>
                    <Button
                        isDisabled={
                            !isDirty ||
                            !costPerTicket ||
                            !ticketPerHour ||
                            isNaN(costPerTicket)
                        }
                        isLoading={isLoading}
                        onClick={onSubmit}
                    >
                        Update
                    </Button>
                </ModalActionsFooter>
            </Modal>
        )
    }
)

export default AutomateExploreDataModal
