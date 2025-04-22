import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import {
    ReportName,
    useNotifyOnTimeReferenceChange,
} from 'hooks/reporting/ticket-insights/useNotifyOnTimeReferenceChange'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import { TicketTimeReference } from 'models/stat/types'
import IconInput from 'pages/common/forms/input/IconInput'
import {
    ActionMenu,
    ActionMenuItem,
    ActionMenuLabel,
    ActionMenuSelectGroup,
    ActionMenuSelectItem,
    ActionMenuSeparator,
} from 'pages/stats/common/components/ActionMenu'
import { useDownloadTagsReportData } from 'services/reporting/tagsReportingService'

export const TAGS_LABEL = 'Set Tag Results'
export const TAGS_REFERENCE_LABEL = 'Set Reference Timeframe'

export const TAGS_INCLUDE_TAGS_LABEL = 'Include related Tags in results'
export const TAGS_INCLUDE_TAGS_SUBTITLE =
    'Show all related Tags within filter results'
export const TAGS_EXCLUDE_TAGS_LABEL = 'Exclude related Tags in results'
export const TAGS_EXCLUDE_TAGS_SUBTITLE =
    'Do not show Tags outside of selected date range'
export const TAGS_ALL_STATUSES_LABEL =
    'Show results with Tags based on all ticket statuses'
export const TAGS_ALL_STATUSES_SUBTITLE =
    'Display Tags from all tickets within selected date range'
export const TAGS_CREATION_DATE_LABEL =
    'Show results with Tags based on when tag was applied'
export const TAGS_CREATION_DATE_SUBTITLE =
    'Only display Tags from created tickets within selected date range'

export const TAG_ACTIONS_DOWNLOAD_OPTION_LABEL = 'Download Data'

const CANDU_ID = 'tags-report-action-menu'

export const TagsActionMenu = () => {
    const isReportingExtendFieldAndTagEnabled = useFlag(
        FeatureFlagKey.ReportingExtendFieldAndTag,
    )

    const [tagResultsSelection, setTagResultsSelection] =
        useTagResultsSelection()

    const [ticketTimeReference, setTicketTimeReference] =
        useTicketTimeReference(Entity.Tag)

    const { download, isLoading } = useDownloadTagsReportData()

    useNotifyOnTimeReferenceChange(ReportName.Tags, ticketTimeReference)

    return (
        <ActionMenu canduId={CANDU_ID}>
            <ActionMenuLabel>{TAGS_LABEL}</ActionMenuLabel>
            <ActionMenuSelectGroup
                value={tagResultsSelection}
                onValueChange={setTagResultsSelection}
            >
                <ActionMenuSelectItem
                    value={TagSelection.includeTags}
                    label={TAGS_INCLUDE_TAGS_LABEL}
                    description={TAGS_INCLUDE_TAGS_SUBTITLE}
                />
                <ActionMenuSelectItem
                    value={TagSelection.excludeTags}
                    label={TAGS_EXCLUDE_TAGS_LABEL}
                    description={TAGS_EXCLUDE_TAGS_SUBTITLE}
                />
            </ActionMenuSelectGroup>

            {isReportingExtendFieldAndTagEnabled && (
                <>
                    <ActionMenuSeparator />

                    <ActionMenuLabel>{TAGS_REFERENCE_LABEL}</ActionMenuLabel>
                    <ActionMenuSelectGroup
                        value={ticketTimeReference}
                        onValueChange={setTicketTimeReference}
                    >
                        <ActionMenuSelectItem
                            value={TicketTimeReference.TaggedAt}
                            label={TAGS_ALL_STATUSES_LABEL}
                            description={TAGS_ALL_STATUSES_SUBTITLE}
                        />
                        <ActionMenuSelectItem
                            value={TicketTimeReference.CreatedAt}
                            label={TAGS_CREATION_DATE_LABEL}
                            description={TAGS_CREATION_DATE_SUBTITLE}
                        />
                    </ActionMenuSelectGroup>
                </>
            )}

            <ActionMenuSeparator />

            <ActionMenuItem
                label={TAG_ACTIONS_DOWNLOAD_OPTION_LABEL}
                prefix={<IconInput icon="get_app" />}
                onClick={download}
                isDisabled={isLoading}
            />
        </ActionMenu>
    )
}
