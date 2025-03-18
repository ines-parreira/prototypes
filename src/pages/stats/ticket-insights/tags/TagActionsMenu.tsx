import React, { useEffect, useRef, useState } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import { useTagResultsSelection } from 'pages/stats/ticket-insights/tags/helpers'
import css from 'pages/stats/ticket-insights/tags/TagActionsMenu.less'
import { useDownloadTagsReportData } from 'services/reporting/tagsReportingService'

export const TAG_ACTIONS_TRIGGER_LABEL = 'Actions'
export const TAG_ACTIONS_DOWNLOAD_OPTION_LABEL = 'Download Data'
export const INCLUDE_TAGS_IN_RESULTS = 'Include related tags in results'
export const INCLUDE_TAGS_IN_RESULTS_SUBTITLE =
    'Show all related tags within filter results'
export const EXCLUDE_TAGS_IN_RESULTS = 'Exclude related tags in results'
export const EXCLUDE_TAGS_IN_RESULTS_SUBTITLE =
    'Do not show tags outside of selected'

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

export function TagActionsMenu() {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const tagResultsSelection = useTagResultsSelection()

    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] =
        useState<TagSelection>(tagResultsSelection)

    useEffect(() => {
        setSelectedOption(tagResultsSelection)
    }, [tagResultsSelection])

    const { download, isLoading } = useDownloadTagsReportData()

    const includeTagsAction = () => {
        setSelectedOption(TagSelection.includeTags)
    }
    const excludeTagsAction = () => {
        setSelectedOption(TagSelection.excludeTags)
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
                    <div className={css.category}>Set Tag Results</div>
                    <TagDropdownItem
                        label={INCLUDE_TAGS_IN_RESULTS}
                        subtitle={INCLUDE_TAGS_IN_RESULTS_SUBTITLE}
                        onClick={includeTagsAction}
                        isSelected={selectedOption === TagSelection.includeTags}
                    />
                    <TagDropdownItem
                        label={EXCLUDE_TAGS_IN_RESULTS}
                        subtitle={EXCLUDE_TAGS_IN_RESULTS_SUBTITLE}
                        onClick={excludeTagsAction}
                        isSelected={selectedOption === TagSelection.excludeTags}
                    />
                    <div className={css.separator} />
                    <DropdownItem
                        onClick={download}
                        option={{
                            label: TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
                            value: '',
                        }}
                        shouldCloseOnSelect
                        isDisabled={isLoading}
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
