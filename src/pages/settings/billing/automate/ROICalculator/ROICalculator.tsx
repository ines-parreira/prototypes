import React, {useRef, useState} from 'react'

import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Label from 'pages/common/forms/Label/Label'
import Tooltip from 'pages/common/components/Tooltip'

import css from './ROICalculator.less'
import {SUPPORT_METRICS_TYPES, SALARY_TYPES} from './constants'

const ROICalculator = () => {
    const agentWagesRef = useRef(null)
    const currentResolutionTimeRef = useRef(null)
    const currentFirstResponseRef = useRef(null)

    const [metricsType, setMetricsType] = useState('monthly_support_tickets')
    const [salaryType, setSalaryType] = useState('annual_salary')

    const [metricsValue, setMetricsValue] = useState('0')
    const [salaryValue, setSalaryValue] = useState('15.5')

    const formatValue = (setValue: (val: string) => void, val: string) => {
        const inputNumber = Number(val.replace(/[^0-9.]/g, ''))

        const hasDecimalTail = val.slice(-1) === '.'

        const costValue =
            inputNumber.toLocaleString() + (hasDecimalTail ? '.' : '')

        setValue(costValue)
    }

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
                        />
                        <InputField
                            placeholder="0"
                            onChange={(val) =>
                                formatValue(setMetricsValue, val)
                            }
                            value={metricsValue}
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
                            Tooltip agent wages
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
                                formatValue(setSalaryValue, value)
                            }
                            value={salaryValue}
                            className={css.salaryValue}
                            prefix="$"
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
                            Tooltip current resolution time
                        </Tooltip>
                    </div>
                    <div className={css.inputsContainer}>
                        <InputField
                            className={css.inputField}
                            value="4hrs"
                            isDisabled
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
                            Tooltip first response time
                        </Tooltip>
                    </div>
                    <div className={css.inputsContainer}>
                        <InputField
                            className={css.inputField}
                            value="12hrs"
                            isDisabled
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
                            <div>Without Automate</div>
                            <div className={css.withoutAutomateCost}>
                                $8,200USD
                            </div>
                        </div>
                    </div>
                    <div className={css.resultRowBackground}>
                        <div className={css.withAutomate}>
                            <div>With Automate</div>
                            <div className={css.withAutomateCost}>
                                $7,240USD
                            </div>
                        </div>
                        <div className={css.savePercentage}>Save 12%</div>
                    </div>
                    <div className={css.reduceTimeContainer}>
                        <div className={css.reduceResolutionTime}>
                            <div className={css.reducePercentage}>
                                Reduce resolution time by 30%
                            </div>
                            <div className={css.reduceTime}>to 2.8hrs</div>
                        </div>
                        <div className={css.reduceFirstResponseTime}>
                            <div className={css.reducePercentage}>
                                Reduce first response time by 67%
                            </div>
                            <div className={css.reduceTime}>to 4hrs</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ROICalculator
