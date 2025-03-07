import React, { useCallback, useRef, useState } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { BusiestTimeOfDaysMetrics } from 'pages/stats/support-performance/busiest-times-of-days/types'
import {
    metricLabels,
    metrics,
    metricsWithMessagesReceived,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import css from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect.less'
import {
    getSelectedMetric,
    setSelectedMetric,
} from 'state/ui/stats/busiestTimesSlice'

export const BusiestTimesOfDaysMetricSelect = () => {
    const isReportingMessagesReceivedMetricEnabled = useFlag(
        FeatureFlagKey.ReportingMessagesReceivedMetric,
    )
    const dispatch = useAppDispatch()
    const selectedMetric = useAppSelector(getSelectedMetric)
    const handleSelectMetric = useCallback(
        (opt: BusiestTimeOfDaysMetrics) => {
            dispatch(setSelectedMetric(opt))
        },
        [dispatch],
    )
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)
    const availableMetrics = isReportingMessagesReceivedMetricEnabled
        ? metricsWithMessagesReceived
        : metrics

    return (
        <div className={css.wrapper}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                ref={buttonRef}
                intent={'secondary'}
                className={css.button}
            >
                <span className={css.buttonText}>
                    {metricLabels[selectedMetric]}
                </span>
                <i className={'material-icons'}>arrow_drop_down</i>
            </Button>
            <Dropdown
                isOpen={isOpen}
                onToggle={setIsOpen}
                target={buttonRef}
                value={selectedMetric}
            >
                {availableMetrics.map((field) => (
                    <DropdownItem
                        key={field}
                        className={css.dropdownItem}
                        onClick={() => {
                            handleSelectMetric(field)
                            setIsOpen(false)
                        }}
                        option={{ value: field, label: metricLabels[field] }}
                    >
                        <span className={css.dropdownItemContent}>
                            {metricLabels[field]}
                        </span>
                    </DropdownItem>
                ))}
            </Dropdown>
        </div>
    )
}
