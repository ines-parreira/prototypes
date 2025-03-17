import React, { useRef, useState } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/ticket-insights/tags/TagActionsMenu.less'
import { useDownloadTagsReportData } from 'services/reporting/tagsReportingService'

export const TAG_ACTIONS_TRIGGER_LABEL = 'Actions'
export const TAG_ACTIONS_DOWNLOAD_OPTION_LABEL = 'Download Data'

export function TagActionsMenu() {
    const triggerRef = useRef<HTMLButtonElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    const { download, isLoading } = useDownloadTagsReportData()

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
