import React, {forwardRef, useImperativeHandle, useState} from 'react'

import {formatMetricValue} from 'pages/stats/common/utils'
import {formatValue} from 'pages/settings/billing/automate/ROICalculator/utils'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {getAgentCostsSettings} from 'state/currentAccount/selectors'
import {createAccountSetting, updateAccountSetting} from 'models/account'
import {submitSettingSuccess} from 'state/currentAccount/actions'
import {
    AccountSettingAgentCostType,
    AccountSettingAgentCosts,
    AccountSettingType,
} from 'state/currentAccount/types'

import Label from 'pages/common/forms/Label/Label'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import css from './AutomateExploreDataModal.less'

const defaultAgentCostPerTicket = 3.1
const hourlyRateMultiplier = 5
const annualSalaryMultiplier = 12 * 840

const defaultAgentHourlyRate = (
    defaultAgentCostPerTicket * hourlyRateMultiplier
).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})
const defaultAgentAnnualSalary = (
    defaultAgentCostPerTicket * annualSalaryMultiplier
).toLocaleString(undefined, {maximumFractionDigits: 2})

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
            hasAgentCosts,
        },
        ref
    ) => {
        const dispatch = useAppDispatch()
        const agentCosts = useAppSelector(getAgentCostsSettings)

        const [isOpen, setIsOpen] = useState(false)
        const [isLoading, setIsLoading] = useState(false)

        const [costPerTicket, setCostPerTicket] = useState<number | undefined>(
            agentCosts?.data.agent_cost_per_ticket
        )

        const [costType, setCostType] = useState<AccountSettingAgentCostType>(
            agentCosts?.data.agent_cost_type || 'hourly'
        )

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
                    })
                },
            }),
            [costType, costPerTicket]
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
            })

            setIsLoading(false)
            onClose()
        }

        const isDirty =
            initialValues.costType !== costType ||
            initialValues.costPerTicket !== costPerTicket

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
                                    data-testid="agent-cost"
                                />
                            </div>
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
                                    Total number of support tickets in the last
                                    28 days on your helpdesk.
                                </Tooltip>
                            </Label>
                            <InputField
                                value={monthlySupportTickets || 'N/A'}
                                isDisabled
                                data-testid="monthly-support-tickets"
                            />
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
                                    data-testid="current-resolution-time"
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
                                    data-testid="current-first-response-time"
                                />
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button onClick={onClose} intent="secondary">
                        Cancel
                    </Button>
                    <Button
                        isDisabled={
                            !isDirty || !costPerTicket || isNaN(costPerTicket)
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
