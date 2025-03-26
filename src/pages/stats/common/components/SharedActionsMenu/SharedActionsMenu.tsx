import React, { useRef, useState } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { useTagResultsSelection } from 'hooks/useTagResultsSelection'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/common/components/SharedActionsMenu/SharedActionsMenu.less'

export const TAG_ACTIONS_TRIGGER_LABEL = 'Actions'
export const TAG_ACTIONS_DOWNLOAD_OPTION_LABEL = 'Download Data'
export const INCLUDE_TAGS_IN_RESULTS = 'Include related tags in results'
export const INCLUDE_TAGS_IN_RESULTS_SUBTITLE =
    'Show all related tags within filter results'
export const EXCLUDE_TAGS_IN_RESULTS = 'Exclude related tags in results'
export const EXCLUDE_TAGS_IN_RESULTS_SUBTITLE =
    'Do not show tags outside of selected'
export const RESULTS_BASED_ON_ALL_STATUSES =
    'Show results with tags based on all ticket statuses'
export const RESULTS_BASED_ON_ALL_STATUSES_SUBTITLE =
    'Display tags from all tickets within selected date range'
export const RESULTS_BASED_ON_CREATION_DATE =
    'Show results with tags based on ticket creation date'
export const RESULTS_BASED_ON_CREATION_DATE_SUBTITLE =
    'Only display tags from created tickets within selected date range'

export enum TagSelection {
    includeTags = 'include_tags',
    excludeTags = 'exclude_tags',
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
    isTagsReport,
    isTicketFieldsReport,
}: {
    downloadAction: () => void
    isDownloadLoading: boolean
    isTagsReport?: boolean
    isTicketFieldsReport?: boolean
}) {
    const [tagResultsSelection, setTagResultsSelection] =
        useTagResultsSelection()

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
    const resultBasedOnAllStatusesAction = () => {}
    const resultBaseOnCreationDateAction = () => {}

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
                                label={INCLUDE_TAGS_IN_RESULTS}
                                subtitle={INCLUDE_TAGS_IN_RESULTS_SUBTITLE}
                                onClick={includeTagsAction}
                                isSelected={
                                    tagResultsSelection ===
                                    TagSelection.includeTags
                                }
                            />
                            <TagDropdownItem
                                label={EXCLUDE_TAGS_IN_RESULTS}
                                subtitle={EXCLUDE_TAGS_IN_RESULTS_SUBTITLE}
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
                                label={RESULTS_BASED_ON_ALL_STATUSES}
                                subtitle={
                                    RESULTS_BASED_ON_ALL_STATUSES_SUBTITLE
                                }
                                onClick={resultBasedOnAllStatusesAction}
                                isSelected={true}
                            />
                            <TagDropdownItem
                                label={RESULTS_BASED_ON_CREATION_DATE}
                                subtitle={
                                    RESULTS_BASED_ON_CREATION_DATE_SUBTITLE
                                }
                                onClick={resultBaseOnCreationDateAction}
                                isSelected={false}
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
