import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import { toast } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { createJob } from 'models/job/resources'
import { JobType } from 'models/job/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import MacrosCSVImportPopover from './MacrosCSVImportPopover'

export function MacrosCreateDropdown(): JSX.Element {
    const [isImportOpen, setImportOpen] = useState(false)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const hasAgentPrivileges = useHasAgentPrivileges()

    const _downloadMacros = () => {
        logEvent(SegmentEvent.MacrosExportClicked, {
            account_domain: currentAccount.get('domain'),
        })

        const requestPayload = {
            type: JobType.ExportMacro,
            params: {},
        }

        toast.success(
            'All the macros will be exported. You will receive the download link via email once the export is done.',
        )

        createJob(requestPayload).catch((error) => {
            toast.error('Failed to export macros. Please try again.')
            throw error
        })
    }

    return (
        <>
            <UncontrolledButtonDropdown
                className="mr-2 h-100"
                disabled={!hasAgentPrivileges}
            >
                <Button
                    color="primary"
                    onClick={() => {
                        history.push(`/app/settings/macros/new`)
                    }}
                    type="button"
                    disabled={!hasAgentPrivileges}
                >
                    Create macro
                </Button>
                <DropdownToggle
                    caret
                    color="primary"
                    disabled={!hasAgentPrivileges}
                    aria-label="Open macro actions"
                />
                <DropdownMenu>
                    <DropdownItem onClick={() => setImportOpen(true)}>
                        <i
                            className="icon material-icons md-2 align-text-bottom"
                            aria-hidden="true"
                        >
                            cloud_upload
                        </i>
                        Import macros from CSV
                    </DropdownItem>
                    <DropdownItem onClick={_downloadMacros}>
                        <i
                            className="icon material-icons md-2 align-text-bottom"
                            aria-hidden="true"
                        >
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
