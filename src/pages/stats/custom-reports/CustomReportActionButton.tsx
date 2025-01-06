import React, {useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {CustomReportsPageActions} from 'pages/stats/custom-reports/CustomReportsPageActions'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'

export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReportActionButton = ({
    customReport,
    setOpenModal,
}: {
    customReport?: CustomReportSchema
    setOpenModal: (isOpen: boolean) => void
}) => {
    const [actionsOpen, setActionsOpen] = useState<boolean>(false)

    const actionsToggleRef = useRef<HTMLButtonElement | null>(null)

    const toggleActions = () => {
        setActionsOpen(!actionsOpen)
    }

    return (
        <Button
            ref={actionsToggleRef}
            onClick={() => toggleActions()}
            trailingIcon="more_vert"
            intent="secondary"
            fillStyle="ghost"
        >
            {CUSTOM_REPORT_ID_CTA}

            <CustomReportsPageActions
                showDropdown={actionsOpen}
                toggleRef={actionsToggleRef}
                handleToggleDropdown={toggleActions}
                setOpenModal={setOpenModal}
                customReport={customReport}
            />
        </Button>
    )
}
