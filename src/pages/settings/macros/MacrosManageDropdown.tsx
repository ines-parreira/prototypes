import React, {useState} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import {useSelector} from 'react-redux'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {createJob} from 'models/job/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import {JobType} from 'models/job/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import MacrosCSVImportPopover from './MacrosCSVImportPopover'

export function MacrosManageDropdown(): JSX.Element {
    const dispatch = useAppDispatch()
    const [isImportOpen, setImportOpen] = useState(false)
    const currentAccount = useSelector(getCurrentAccountState)

    const _downloadMacros = () => {
        logEvent(SegmentEvent.MacrosExportClicked, {
            account_domain: currentAccount.get('domain'),
        })

        const requestPayload = {
            type: JobType.ExportMacro,
            params: {},
        }

        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message:
                    'All the macros will be exported. You will receive the download link via email once the export is done.',
            })
        )

        createJob(requestPayload).catch((error) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to export macros. Please try again.',
                })
            )
            throw error
        })
    }

    return (
        <>
            <UncontrolledButtonDropdown className="mr-2">
                <DropdownToggle caret>Manage Macros</DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={() => setImportOpen(true)}>
                        <i className="icon material-icons md-2 align-text-bottom">
                            cloud_upload
                        </i>
                        Import macros from CSV
                    </DropdownItem>
                    <DropdownItem onClick={_downloadMacros}>
                        <i className="icon material-icons md-2 align-text-bottom">
                            download
                        </i>
                        Export macros as CSV
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
            <MacrosCSVImportPopover
                isOpen={isImportOpen}
                onClose={() => setImportOpen(false)}
            />
        </>
    )
}
