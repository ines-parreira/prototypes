import React, {useEffect, useMemo, useRef} from 'react'
import {Container} from 'reactstrap'

import {isEqual} from 'lodash'
import moment from 'moment'
import PageHeader from 'pages/common/components/PageHeader'
import TextInput from 'pages/common/forms/input/TextInput'

import {Notification, NotificationStatus} from 'state/notifications/types'

import {formatDatetime} from 'utils'
import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import {useWorkflowDataset} from 'hooks/reporting/automate/useWorkflowDataset'
import {WorkflowStatsFilters} from 'models/stat/types'
import {getStatsFilters} from 'state/stats/selectors'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {useWorkflowEditorContext} from '../hooks/useWorkflowEditor'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../hooks/useWorkflowChannelSupport'

import {WorkflowToggle} from '../models/workflowConfiguration.types'
import css from './WorkflowAnalytics.less'
import {WorkflowAnalyticsActionButtons} from './WorkflowAnalyticsActionButtons'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'
import {WorkflowOverviewMetrics} from './WorkflowOverviewMetrics'
import WorkflowAnalyticsBanner from './WorkflowAnalyticsBanner'
import {getWorkflowAnalyticsDateRange} from './visualBuilder/utils'

type WorkflowAnalyticsProps = {
    shopType: string
    shopName: string
    workflowId: string
    notifyMerchant: (message: Notification) => void
    goToWorkflowEditorPage: () => void
}

export default function WorkflowAnalytics({
    workflowId,
    shopName,
    shopType,
    notifyMerchant,
    goToWorkflowEditorPage,
}: WorkflowAnalyticsProps) {
    const workflowEditorContext = useWorkflowEditorContext()
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortMonthDayWithTime
    )
    const workflowChannelSupportContext = useWorkflowChannelSupport(
        shopType,
        shopName
    )

    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)

    const filters = useMemo<WorkflowStatsFilters>(() => {
        const period = getWorkflowAnalyticsDateRange({
            startDatetime: statsFilters.period.start_datetime,
            endDatetime: statsFilters.period.end_datetime,
            flowUpdateDatetime:
                workflowEditorContext.configuration.updated_datetime!,
        })
        return {
            workflowId,
            period,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowId, statsFilters.period])

    const isDirty = workflowEditorContext.isDirty

    const handleTest = (isTestable: boolean) => {
        if (isTestable) {
            workflowEditorContext.setIsTesting(true)
        } else {
            const configurationError =
                workflowEditorContext.handleValidate(true)

            if (configurationError) {
                workflowEditorContext.setShouldShowErrors(true)
                notifyMerchant({
                    message:
                        'Complete steps and save in order to test this Flow',
                    status: NotificationStatus.Error,
                })
            } else {
                notifyMerchant({
                    message:
                        'Save as draft or publish in order to test this Flow',
                    status: NotificationStatus.Error,
                })
            }
        }
    }

    const onToggleChange = (value: WorkflowToggle) => {
        if (value === WorkflowToggle.Editor) {
            goToWorkflowEditorPage()
        }
    }

    const data = useWorkflowDataset(
        filters,
        userTimezone,
        workflowEditorContext.configuration.steps,
        workflowEditorContext.configuration.updated_datetime!
    )

    const {isFetching, workflowMetrics, workflowStepMetrics, previousPeriod} =
        data

    const prevWorkflowStepMetricsRef = useRef()

    useEffect(() => {
        if (!isEqual(prevWorkflowStepMetricsRef.current, workflowStepMetrics)) {
            prevWorkflowStepMetricsRef.current = workflowStepMetrics as any
            if (workflowEditorContext.setWorkflowStepMetrics) {
                workflowEditorContext.setWorkflowStepMetrics(
                    workflowStepMetrics
                )
            }
        }
    }, [workflowEditorContext, workflowStepMetrics])

    return (
        <WorkflowChannelSupportContext.Provider
            value={workflowChannelSupportContext}
        >
            <div className={css.page}>
                <PageHeader
                    className={css.pageHeader}
                    title={
                        <div className={css.headerLeft}>
                            <div className={css.headerInner}>
                                <TextInput
                                    className={css.headerLeftInput}
                                    value={
                                        workflowEditorContext.visualBuilderGraph
                                            .name
                                    }
                                    isDisabled
                                />
                            </div>
                            <span className={css.headerLeftdescription}>
                                Flow name will not be visible to customers
                            </span>
                        </div>
                    }
                >
                    <div className={css.filterHeader}>
                        <div className={css.headerRight}>
                            <WorkflowAnalyticsActionButtons
                                isTestDisabled={
                                    chatChannels.filter(
                                        (chat) =>
                                            !chat.value.deactivated_datetime &&
                                            !chat.value.deleted_datetime
                                    ).length === 0
                                }
                                isDirty={isDirty}
                                onTest={handleTest}
                            />
                        </div>
                        <div className={css.headerRight}>
                            {workflowEditorContext.configuration
                                .updated_datetime && (
                                <div className={css.lastSaved}>
                                    Last saved{' '}
                                    {formatDatetime(
                                        workflowEditorContext.configuration
                                            .updated_datetime,
                                        datetimeFormat,
                                        userTimezone
                                    )}
                                </div>
                            )}
                            <PeriodStatsFilter
                                initialSettings={{
                                    ranges: undefined,
                                    minDate: moment(
                                        workflowEditorContext.configuration
                                            .updated_datetime
                                    ),
                                }}
                                value={statsFilters.period}
                                variant="ghost"
                            />
                        </div>
                    </div>
                </PageHeader>
                <Container className={css.pageContainer} fluid>
                    {!isFetching && (
                        <WorkflowAnalyticsBanner
                            workflowUpdatedDatetime={
                                workflowEditorContext.configuration
                                    .updated_datetime!
                            }
                            hasDataAvailable={
                                !!(
                                    data.workflowStepMetrics &&
                                    Object.keys(data.workflowStepMetrics)
                                        .length > 0
                                )
                            }
                        />
                    )}
                    <ToggleButton.Wrapper
                        className={css.workflowToggle}
                        type={ToggleButton.Type.Label}
                        value={WorkflowToggle.Analytics}
                        onChange={onToggleChange}
                    >
                        <ToggleButton.Option value={WorkflowToggle.Editor}>
                            Editor
                        </ToggleButton.Option>
                        <ToggleButton.Option value={WorkflowToggle.Analytics}>
                            Analysis
                        </ToggleButton.Option>
                    </ToggleButton.Wrapper>
                    <WorkflowOverviewMetrics
                        metrics={workflowMetrics}
                        previousPeriod={previousPeriod}
                    />
                    <WorkflowVisualBuilder />
                </Container>
            </div>
        </WorkflowChannelSupportContext.Provider>
    )
}
