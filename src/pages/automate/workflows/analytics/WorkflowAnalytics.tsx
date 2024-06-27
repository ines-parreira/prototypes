import React from 'react'
import {Container} from 'reactstrap'

import moment from 'moment'
import PageHeader from 'pages/common/components/PageHeader'
import TextInput from 'pages/common/forms/input/TextInput'
import {withSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'

import {Notification, NotificationStatus} from 'state/notifications/types'

import {formatDatetime} from 'utils'
import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import {last28DaysStatsFilters} from 'pages/automate/common/utils/last28DaysStatsFilters'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import {
    useWorkflowEditorContext,
    withWorkflowEditorContext,
} from '../hooks/useWorkflowEditor'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../hooks/useWorkflowChannelSupport'

import {WorkflowToggle} from '../models/workflowConfiguration.types'
import useWorkflowsAnalyticsDateRange from '../hooks/useWorkflowAnalyticsDateRange'
import css from './WorkflowAnalytics.less'
import {WorkflowAnalyticsActionButtons} from './WorkflowAnalyticsActionButtons'
import WorkflowVisualBuilder from './visualBuilder/WorkflowVisualBuilder'
import {WorkflowOverviewMetrics} from './WorkflowOverviewMetrics'

type WorkflowAnalyticsProps = {
    currentAccountId: number
    isNewWorkflow: boolean
    shopType: string
    shopName: string
    workflowId: string
    notifyMerchant: (message: Notification) => void
    goToWorkflowEditorPage: () => void
}

function WorkflowAnalyticsWrapped({
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

    /* TODO: Add data once available in CubeJS
    mention: data types might be different (metric instead of number, etc.) */
    const workflowAnalyticsDateRange = useWorkflowsAnalyticsDateRange({
        start_datetime: '2024-06-01',
        end_datetime: '2024-06-23',
        flow_update_datetime:
            workflowEditorContext.configuration.updated_datetime,
    })

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
                                    maxSpan: 365,
                                    minDate: moment(
                                        workflowAnalyticsDateRange.start_datetime
                                    ),
                                    maxDate: moment(
                                        workflowAnalyticsDateRange.end_datetime
                                    ),
                                }}
                                value={last28DaysStatsFilters().period}
                                variant="ghost"
                            />
                        </div>
                    </div>
                </PageHeader>
                <Container className={css.pageContainer} fluid>
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

                    {/* TODO: Add data once available in CubeJS
                    mention: data types might be different (metric instead of number, etc.) */}
                    <WorkflowOverviewMetrics
                        views={0}
                        automationRate={0}
                        trendAutomationRate={{
                            data: {
                                value: 10,
                                prevValue: 5,
                            },
                            isFetching: false,
                            isError: false,
                        }}
                        automated={0}
                        dropOff={0}
                        ticketCreated={0}
                    />
                    <WorkflowVisualBuilder />
                </Container>
            </div>
        </WorkflowChannelSupportContext.Provider>
    )
}

export default withWorkflowEditorContext(
    withSelfServiceStoreIntegrationContext(WorkflowAnalyticsWrapped)
)
