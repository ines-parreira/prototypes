import React, { useRef, useState } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import {
    TimeframePreferenceSelection,
    useTimeframePreferenceSelection,
} from 'hooks/reporting/ticket-insights/useTimeframePreferenceSelection'
import { useNotify } from 'hooks/useNotify'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/common/components/SharedActionsMenu/SharedActionsMenu.less'
import { TAGS_TITLE } from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import { TICKET_INSIGHTS_PAGE_TITLE } from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'

export enum ReportName {
    Tags = 'tags',
    TicketFields = 'ticketFields',
}

export const TAG_ACTIONS_TRIGGER_LABEL = 'Actions'
export const TAG_ACTIONS_DOWNLOAD_OPTION_LABEL = 'Download Data'
export const SHARED_LABELS = {
    [ReportName.Tags]: {
        includeTags: 'Include related tags in results',
        includeTagsSubtitle: 'Show all related tags within filter results',
        excludeTags: 'Exclude related tags in results',
        excludeTagsSubtitle: 'Do not show tags outside of selected',
        allStatuses: 'Show results with tags based on all ticket statuses',
        allStatusesSubtitle:
            'Display tags from all tickets within selected date range',
        creationDate: 'Show results with tags based on ticket creation date',
        creationDateSubtitle:
            'Only display tags from created tickets within selected date range',
    },
    [ReportName.TicketFields]: {
        allStatuses:
            'Show results with ticket fields based on all ticket statuses',
        allStatusesSubtitle:
            'Display ticket fields from all tickets within selected date range',
        creationDate:
            'Show results with ticket fields based on ticket creation date',
        creationDateSubtitle:
            'Only display ticket fields from created tickets within selected date range',
    },
}

const RESULTS_BASED_ON_ALL_STATUSES_NOTIFICATION =
    'results will now display based on all ticket statuses'
const RESULTS_BASED_ON_CREATION_DATE_NOTIFICATION =
    'results will now display based on ticket creation date'

export const createNotificationMessage = (
    reportName: ReportName,
    selection: TimeframePreferenceSelection,
) => {
    const entity =
        reportName === ReportName.Tags ? TAGS_TITLE : TICKET_INSIGHTS_PAGE_TITLE
    const notification =
        selection === TimeframePreferenceSelection.basedOnTicketStatuses
            ? RESULTS_BASED_ON_ALL_STATUSES_NOTIFICATION
            : RESULTS_BASED_ON_CREATION_DATE_NOTIFICATION

    return `${entity} ${notification}`
}

const TagDropdownItem = ({
    label,
    subtitle,
    onClick,
    isSelected,
}: {
    label: string
    subtitle: string
    onClick: () => void
    isSelected: boolean
}) => {
    return (
        <DropdownItem
            onClick={onClick}
            option={{
                label,
                value: '',
            }}
            shouldCloseOnSelect
            className={css.tagItem}
        >
            <div>
                {label}
                <div className={css.subtitle}>{subtitle}</div>
            </div>
            {isSelected && <IconInput icon="check" className={css.itemIcon} />}
        </DropdownItem>
    )
}

export function SharedActionsMenu({
    downloadAction,
    isDownloadLoading,
    reportName,
}: {
    downloadAction: () => void
    isDownloadLoading: boolean
    reportName: ReportName
}) {
    const isTagsReport = reportName === ReportName.Tags
    const isTicketFieldsReport = reportName === ReportName.TicketFields

    const notify = useNotify()
    const [tagResultsSelection, setTagResultsSelection] =
        useTagResultsSelection()
    const [timeframePreferenceSelection, seTimeframePreferenceSelection] =
        useTimeframePreferenceSelection(isTagsReport)

    const triggerRef = useRef<HTMLButtonElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    const includeTagsAction = () => {
        logEvent(SegmentEvent.StatTagsIncludeRelatedClicked)
        setTagResultsSelection(TagSelection.includeTags)
    }

    const excludeTagsAction = () => {
        logEvent(SegmentEvent.StatTagsExcludeRelatedClicked)
        setTagResultsSelection(TagSelection.excludeTags)
    }

    const resultBasedOnAllStatusesAction = () => {
        const timeFrame = TimeframePreferenceSelection.basedOnTicketStatuses
        logEvent(SegmentEvent.StatTimeframePreferenceSelection, {
            value: timeFrame,
            report: reportName,
        })
        seTimeframePreferenceSelection(
            TimeframePreferenceSelection.basedOnTicketStatuses,
        )
        void notify.success(createNotificationMessage(reportName, timeFrame))
    }

    const resultBaseOnCreationDateAction = () => {
        const timeFrame = TimeframePreferenceSelection.basedOnTicketCreationDate
        logEvent(SegmentEvent.StatTimeframePreferenceSelection, {
            value: timeFrame,
            report: reportName,
        })
        seTimeframePreferenceSelection(
            TimeframePreferenceSelection.basedOnTicketCreationDate,
        )
        void notify.success(createNotificationMessage(reportName, timeFrame))
    }

    return (
        <>
            <IconButton
                as="button"
                ref={triggerRef}
                intent="secondary"
                fillStyle="ghost"
                icon="more_vert"
                onClick={() => setIsOpen(true)}
                aria-label={TAG_ACTIONS_TRIGGER_LABEL}
            />
            <Dropdown
                target={triggerRef}
                isOpen={isOpen}
                onToggle={setIsOpen}
                placement="bottom-end"
                offset={4}
            >
                <DropdownBody>
                    {isTagsReport && (
                        <>
                            <div className={css.category}>Set Tag Results</div>
                            <TagDropdownItem
                                label={SHARED_LABELS.tags.includeTags}
                                subtitle={
                                    SHARED_LABELS.tags.includeTagsSubtitle
                                }
                                onClick={includeTagsAction}
                                isSelected={
                                    tagResultsSelection ===
                                    TagSelection.includeTags
                                }
                            />
                            <TagDropdownItem
                                label={SHARED_LABELS.tags.excludeTags}
                                subtitle={
                                    SHARED_LABELS.tags.excludeTagsSubtitle
                                }
                                onClick={excludeTagsAction}
                                isSelected={
                                    tagResultsSelection ===
                                    TagSelection.excludeTags
                                }
                            />
                            <div className={css.separator} />
                        </>
                    )}
                    {(isTagsReport || isTicketFieldsReport) && (
                        <>
                            <div className={css.category}>
                                Set Reference Timeframe
                            </div>

                            <TagDropdownItem
                                label={SHARED_LABELS[reportName].allStatuses}
                                subtitle={
                                    SHARED_LABELS[reportName]
                                        .allStatusesSubtitle
                                }
                                onClick={resultBasedOnAllStatusesAction}
                                isSelected={
                                    timeframePreferenceSelection ===
                                    TimeframePreferenceSelection.basedOnTicketStatuses
                                }
                            />
                            <TagDropdownItem
                                label={SHARED_LABELS[reportName].creationDate}
                                subtitle={
                                    SHARED_LABELS[reportName]
                                        .creationDateSubtitle
                                }
                                onClick={resultBaseOnCreationDateAction}
                                isSelected={
                                    timeframePreferenceSelection ===
                                    TimeframePreferenceSelection.basedOnTicketCreationDate
                                }
                            />

                            <div className={css.separator} />
                        </>
                    )}
                    <DropdownItem
                        onClick={downloadAction}
                        option={{
                            label: TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
                            value: '',
                        }}
                        shouldCloseOnSelect
                        isDisabled={isDownloadLoading}
                        className={css.item}
                    >
                        <IconInput icon="get_app" className={css.itemIcon} />
                        {TAG_ACTIONS_DOWNLOAD_OPTION_LABEL}
                    </DropdownItem>
                </DropdownBody>
            </Dropdown>
        </>
    )
}
