import classnames from 'classnames'

import { AutomateStatsMeasureLabelMap } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import type {
    AutomateTimeseries,
    GreyArea,
} from 'domains/reporting/hooks/automate/types'
import {
    addZeroValueTimeSeriesForGreyArea,
    sortByAutomateFeatureLabels,
} from 'domains/reporting/hooks/automate/utils'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import css from 'domains/reporting/pages/automate/overview/AutomateOverview.less'
import {
    formatLabeledTimeSeriesData,
    formatTimeSeriesData,
} from 'domains/reporting/pages/common/utils'
import {
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
} from 'domains/reporting/pages/self-service/constants'
import type { AutomatedInteractionByFeatures } from 'domains/reporting/pages/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

export function getGreyAreaHint(showGreyArea: GreyArea | null) {
    return (
        showGreyArea && {
            titleExtra: (
                <div className={css.noDataHint}>
                    <i
                        className={classnames(
                            'material-icons-outlined',
                            css.crossLine,
                        )}
                    >
                        {'texture'}
                    </i>
                    Data not yet available
                    <IconTooltip className={css.tooltip}>
                        Data is not yet available because interactions are
                        considered automated after 72 hours have passed without
                        a customer reply.
                    </IconTooltip>
                </div>
            ),
        }
    )
}

export const formatAutomationRateTimeSeriesData = (
    automationRateTimeSeries: TimeSeriesDataItem[][],
    granularity: ReportingGranularity,
    showGreyArea: GreyArea | null,
) => {
    const automationRateTimeSeriesData = formatTimeSeriesData(
        automationRateTimeSeries,
        AUTOMATION_RATE_LABEL,
        granularity,
    )

    return addZeroValueTimeSeriesForGreyArea(
        showGreyArea,
        automationRateTimeSeriesData,
    )
}

export function getTimeSeriesFormattedData(
    timeSeries: AutomateTimeseries,
    granularity: ReportingGranularity,
    showGreyArea: GreyArea | null,
) {
    const {
        automationRateTimeSeries,
        automatedInteractionByEventTypesTimeSeries,
        automatedInteractionTimeSeries,
    } = timeSeries

    const automatedInteractionTimeSeriesData = formatTimeSeriesData(
        automatedInteractionTimeSeries,
        AUTOMATED_INTERACTIONS_LABEL,
        granularity,
    )

    const hasAutomatedInteractionsByAutoResponders =
        automatedInteractionByEventTypesTimeSeries.some((item) =>
            item.some(
                (item) =>
                    (item.label as AutomatedInteractionByFeatures) ===
                        AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders &&
                    item.value > 0,
            ),
        )
    const hasAutomatedInteractionsByQuickResponse =
        automatedInteractionByEventTypesTimeSeries.some((item) =>
            item.some(
                (item) =>
                    (item.label as AutomatedInteractionByFeatures) ===
                        AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse &&
                    item.value > 0,
            ),
        )

    const automatedInteractionByEventTypesTimeSeriesData =
        formatLabeledTimeSeriesData(
            automatedInteractionByEventTypesTimeSeries,
            automatedInteractionByEventTypesTimeSeries.map((item) =>
                item[0].label
                    ? AutomateStatsMeasureLabelMap[
                          item[0].label as AutomatedInteractionByFeatures
                      ]
                    : 'Others',
            ),
            granularity,
        )
            .filter((item) => {
                if (
                    !hasAutomatedInteractionsByAutoResponders &&
                    item.label ===
                        AutomateStatsMeasureLabelMap[
                            AutomationBillingEventMeasure
                                .AutomatedInteractionsByAutoResponders
                        ]
                ) {
                    return false
                } else if (
                    !hasAutomatedInteractionsByQuickResponse &&
                    item.label ===
                        AutomateStatsMeasureLabelMap[
                            AutomationBillingEventMeasure
                                .AutomatedInteractionsByQuickResponse
                        ]
                ) {
                    return false
                }
                return true
            })
            .sort(sortByAutomateFeatureLabels(AutomateStatsMeasureLabelMap))

    return {
        automationRateTimeSeriesData: formatAutomationRateTimeSeriesData(
            automationRateTimeSeries,
            granularity,
            showGreyArea,
        ),
        automatedInteractionTimeSeriesData: addZeroValueTimeSeriesForGreyArea(
            showGreyArea,
            automatedInteractionTimeSeriesData,
        ),
        automatedInteractionByEventTypesTimeSeriesData:
            addZeroValueTimeSeriesForGreyArea(
                showGreyArea,
                automatedInteractionByEventTypesTimeSeriesData,
            ),
        exportableData: {
            automationRateTimeSeries,
            automatedInteractionTimeSeries,
            automatedInteractionByEventTypesTimeSeries,
        },
    }
}
