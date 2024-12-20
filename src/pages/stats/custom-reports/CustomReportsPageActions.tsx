import {AnalyticsCustomReport} from '@gorgias/api-queries'
import cn from 'classnames'
import debounce from 'lodash/debounce'
import React, {useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {ConfirmationModal} from 'pages/settings/helpCenter/components/ConfirmationModal'
import css from 'pages/stats/custom-reports/CustomReportsPageActions.less'

export const DOWNLOAD_REPORT_LABEL = 'Download Data'
export const DELETE_REPORT_LABEL = 'Delete Report'
export const ADD_OR_REMOVE_REPORT_LABEL = 'Add or Remove Report'

export const DELETE_CONFIRMATION_BUTTON_LABEL = 'Delete'
export const CANCEL_CONFIRMATION_BUTTON_LABEL = 'Cancel'
export const getDeleteConfirmationTitle = (customReportName: string) =>
    `Delete ${customReportName}?`

const getDeleteConfirmationContent = (customReportName: string) => (
    <>
        {`Deleting ${customReportName} will remove it from Custom Reports for all users. This action cannot be undone.`}
        <br />
        <br />
        <br />
    </>
)

interface Props {
    showDropdown: boolean
    toggleRef: React.RefObject<HTMLElement>
    handleToggleDropdown: () => void
    customReport: AnalyticsCustomReport | undefined
}

export const CustomReportsPageActions = ({
    showDropdown,
    toggleRef,
    handleToggleDropdown,
    customReport,
}: Props) => {
    const history = useHistory()
    const location = useLocation()
    const {deleteReportHandler} = useCustomReportActions()

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const basePath = location.pathname.split('/').slice(0, 3).join('/')

    //added this, because of the notification didn't show up
    const debouncedHistoryPush = debounce(() => {
        history.push(`${basePath}/live-overview`)
    }, 500)

    const deleteConfirmationHandler = () => {
        if (customReport) {
            deleteReportHandler({
                id: customReport.id,
                name: customReport.name,
            })

            debouncedHistoryPush()
        }
    }

    const actions = [
        {
            label: ADD_OR_REMOVE_REPORT_LABEL,
            callback: () => {},
            icon: 'edit',
        },
        {
            label: DELETE_REPORT_LABEL,
            callback: () => {
                setShowDeleteConfirmation(true)
            },
            icon: 'delete_outline',
        },
        {
            label: DOWNLOAD_REPORT_LABEL,
            callback: () => {},
            icon: 'get_app',
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
                    {actions.map(({label, callback, icon}) => {
                        return (
                            <DropdownItem
                                key={label}
                                onClick={callback}
                                option={{label, value: ''}}
                                shouldCloseOnSelect
                            >
                                <div className={css.dropdownItemContent}>
                                    <i
                                        className={cn(
                                            'material-icons',
                                            css.actionIcon
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
