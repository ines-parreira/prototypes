import React, {useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {CustomReportsPageActions} from 'pages/stats/custom-reports/CustomReportsPageActions'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'

export const CUSTOM_REPORT_ID_CTA = 'Actions'
export const CUSTOM_REPORT_ADD_CHARTS_CTA = 'Add Charts'

export const CustomReportActionButton = ({
    customReport,
    setOpenModal,
    isModalOpen,
    isEditMode,
}: {
    customReport?: CustomReportSchema
    isModalOpen: boolean
    setOpenModal: (isOpen: boolean) => void
    isEditMode: boolean
}) => {
    const [actionsOpen, setActionsOpen] = useState<boolean>(false)

    const actionsToggleRef = useRef<HTMLButtonElement | null>(null)

    const toggleActions = () => {
        setActionsOpen(!actionsOpen)
    }

    return isEditMode ? (
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
    ) : (
        <Button
            onClick={() => setOpenModal(true)}
            intent={isModalOpen ? 'secondary' : 'primary'}
        >
            {CUSTOM_REPORT_ADD_CHARTS_CTA}
        </Button>
    )
}
