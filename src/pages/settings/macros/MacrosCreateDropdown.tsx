import React, {useState} from 'react'
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {createJob} from 'models/job/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {JobType} from 'models/job/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import history from '../../history'

import MacrosCSVImportPopover from './MacrosCSVImportPopover'

export function MacrosCreateDropdown(): JSX.Element {
    const dispatch = useAppDispatch()
    const [isImportOpen, setImportOpen] = useState(false)
    const currentAccount = useAppSelector(getCurrentAccountState)

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
                <Button
                    color="primary"
                    onClick={() => {
                        history.push('/app/settings/macros/new')
                    }}
                    type="button"
                >
                    Create macro
                </Button>
                <DropdownToggle caret color="primary" />
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
