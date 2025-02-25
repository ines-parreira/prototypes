import React, { useState } from 'react'

import cn from 'classnames'
import { useHistory, useLocation } from 'react-router-dom'

import { useCustomReportActions } from 'hooks/reporting/custom-reports/useCustomReportActions'
import { useDownloadCustomReportData } from 'hooks/reporting/custom-reports/useDownloadCustomReportData'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { ConfirmationModal } from 'pages/settings/helpCenter/components/ConfirmationModal'
import css from 'pages/stats/custom-reports/CustomReportsPageActions.less'
import { CustomReportSchema } from 'pages/stats/custom-reports/types'

export const DOWNLOAD_REPORT_LABEL = 'Download Data'
export const DELETE_REPORT_LABEL = 'Delete Dashboard'
export const ADD_OR_REMOVE_REPORT_LABEL = 'Add or Remove Charts'

export const DELETE_CONFIRMATION_BUTTON_LABEL = 'Delete'
export const CANCEL_CONFIRMATION_BUTTON_LABEL = 'Cancel'
export const getDeleteConfirmationTitle = (customReportName: string) =>
    `Delete ${customReportName}?`

const getDeleteConfirmationContent = (customReportName: string) => (
    <>
        {`Deleting ${customReportName} will remove it from Dashboards for all users. This action cannot be undone.`}
        <br />
        <br />
        <br />
    </>
)

interface Props {
    showDropdown: boolean
    toggleRef: React.RefObject<HTMLElement>
    handleToggleDropdown: () => void
    customReport?: CustomReportSchema
    setOpenModal: (isOpen: boolean) => void
}

export const CustomReportsPageActions = ({
    showDropdown,
    toggleRef,
    handleToggleDropdown,
    customReport,
    setOpenModal,
}: Props) => {
    const history = useHistory()
    const location = useLocation()
    const { deleteReportHandler } = useCustomReportActions()
    const { triggerDownload, isLoading } =
        useDownloadCustomReportData(customReport)

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const basePath = location.pathname.split('/').slice(0, 3).join('/')

    const historyPush = () => history.push(`${basePath}/live-overview`)

    const deleteConfirmationHandler = () => {
        if (customReport) {
            deleteReportHandler({
                id: customReport.id,
                name: customReport.name,
                onSuccess: historyPush,
            })
        }
    }

    const actions = [
        {
            label: ADD_OR_REMOVE_REPORT_LABEL,
            callback: () => setOpenModal(true),
            icon: 'edit',
            disabled: false,
        },
        {
            label: DELETE_REPORT_LABEL,
            callback: () => {
                setShowDeleteConfirmation(true)
            },
            icon: 'delete_outline',
            disabled: false,
        },
        {
            label: DOWNLOAD_REPORT_LABEL,
            callback: triggerDownload,
            icon: 'get_app',
            disabled: isLoading,
        },
    ]
    return (
        <>
            <Dropdown
                isOpen={showDropdown}
                offset={4}
                placement="bottom-end"
                target={toggleRef}
                onToggle={handleToggleDropdown}
            >
                <DropdownBody>
                    {actions.map(({ label, callback, icon, disabled }) => {
                        return (
                            <DropdownItem
                                key={label}
                                onClick={callback}
                                isDisabled={!!disabled}
                                option={{ label, value: '' }}
                                shouldCloseOnSelect
                            >
                                <div className={css.dropdownItemContent}>
                                    <i
                                        className={cn(
                                            'material-icons',
                                            css.actionIcon,
                                        )}
                                    >
                                        {icon}
                                    </i>
                                    {label}
                                </div>
                            </DropdownItem>
                        )
                    })}
                </DropdownBody>
            </Dropdown>

            <ConfirmationModal
                confirmIntent="destructive"
                confirmText={DELETE_CONFIRMATION_BUTTON_LABEL}
                title={getDeleteConfirmationTitle(customReport?.name || '')}
                onConfirm={() => {
                    deleteConfirmationHandler()
                    setShowDeleteConfirmation(false)
                }}
                isOpen={showDeleteConfirmation}
                onClose={() => {
                    setShowDeleteConfirmation(false)
                }}
                className={css.confirmationModal}
            >
                {getDeleteConfirmationContent(customReport?.name || '')}
            </ConfirmationModal>
        </>
    )
}
