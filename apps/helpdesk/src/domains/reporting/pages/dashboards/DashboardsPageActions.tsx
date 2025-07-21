import React, { useState } from 'react'

import cn from 'classnames'
import { useHistory, useLocation } from 'react-router-dom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDownloadDashboardData } from 'domains/reporting/hooks/dashboards/useDownloadDashboardData'
import css from 'domains/reporting/pages/dashboards/DashboardsPageActions.less'
import { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { ConfirmationModal } from 'pages/settings/helpCenter/components/ConfirmationModal'

export const DOWNLOAD_REPORT_LABEL = 'Download Data'
export const DELETE_REPORT_LABEL = 'Delete Dashboard'
export const ADD_OR_REMOVE_REPORT_LABEL = 'Add or Remove Charts'

export const DELETE_CONFIRMATION_BUTTON_LABEL = 'Delete'
export const CANCEL_CONFIRMATION_BUTTON_LABEL = 'Cancel'
export const getDeleteConfirmationTitle = (dashboardName: string) =>
    `Delete ${dashboardName}?`

const getDeleteConfirmationContent = (dashboardName: string) => (
    <>
        {`Deleting ${dashboardName} will remove it from Dashboards for all users. This action cannot be undone.`}
        <br />
        <br />
        <br />
    </>
)

interface Props {
    showDropdown: boolean
    toggleRef: React.RefObject<HTMLElement>
    handleToggleDropdown: () => void
    dashboard?: DashboardSchema
    setOpenModal: (isOpen: boolean) => void
}

export const DashboardsPageActions = ({
    showDropdown,
    toggleRef,
    handleToggleDropdown,
    dashboard,
    setOpenModal,
}: Props) => {
    const history = useHistory()
    const location = useLocation()
    const { deleteReportHandler } = useDashboardActions()
    const { triggerDownload, isLoading } = useDownloadDashboardData(dashboard)

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const basePath = location.pathname.split('/').slice(0, 3).join('/')

    const historyPush = () => history.push(`${basePath}/live-overview`)

    const deleteConfirmationHandler = () => {
        if (dashboard) {
            deleteReportHandler({
                id: dashboard.id,
                name: dashboard.name,
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
                                isDisabled={disabled}
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
                title={getDeleteConfirmationTitle(dashboard?.name || '')}
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
                {getDeleteConfirmationContent(dashboard?.name || '')}
            </ConfirmationModal>
        </>
    )
}
