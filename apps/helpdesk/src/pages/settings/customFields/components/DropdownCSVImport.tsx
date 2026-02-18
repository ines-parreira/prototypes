// eslint-disable-line import/no-unresolved
import { useState } from 'react'

import { useAsyncFn, useId } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { CsvError, parse } from 'csv-parse/sync'
import { Link } from 'react-router-dom'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import {
    DROPDOWN_CSV_TEMPLATE,
    DROPDOWN_NESTING_DELIMITER,
    OBJECT_TYPE_SETTINGS,
} from 'custom-fields/constants'
import type { CustomFieldObjectTypes } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import LinkButton from 'pages/common/components/button/LinkButton'
import Loader from 'pages/common/components/Loader/Loader'
import { ConfirmationModal } from 'pages/settings/helpCenter/components/ConfirmationModal'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getText, saveFileAsDownloaded } from 'utils/file'

import { DropdownCSVImportDropZone } from './DropdownCSVImportDropZone'

import css from './DropdownCSVImport.less'

type Props = {
    isOpen: boolean
    onImport: (choices: string[]) => void
    onClose: () => void
    needsConfirmation?: boolean
    objectType: CustomFieldObjectTypes
}

function validate(lines: string[]): string[] {
    const errors: string[] = []
    if (lines.length !== new Set(lines).size) {
        errors.push('File has duplicates')
    }
    if (lines.length > 2000) {
        errors.push('File has more than 2,000 values')
    }
    for (const line of lines) {
        if (line.split(DROPDOWN_NESTING_DELIMITER).length > 5) {
            errors.push('Some values have more than 5 nested children levels')
            break
        }
    }
    return errors
}

export const DropdownCSVImport = ({
    isOpen,
    onImport,
    onClose,
    needsConfirmation,
    objectType,
}: Props) => {
    const dispatch = useAppDispatch()
    const customFieldTypeLabel = OBJECT_TYPE_SETTINGS[objectType].LABEL
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
    const [pickedFile, setPickedFile] = useState<File | null>(null)
    const tooltipId = 'app-permission-tooltip-' + useId()
    const appNode = useAppNode()

    const [{ loading: isImporting }, handleImport] = useAsyncFn(async () => {
        if (!pickedFile) {
            return
        }

        let lines: string[] = []
        let errors: string[] = []

        try {
            // Read the file directly in the browser
            const contents = await getText(pickedFile)

            // Parse CSV
            const parsed = parse(contents) as string[][]
            lines = parsed.map((row: string[]) =>
                row.filter(Boolean).join(DROPDOWN_NESTING_DELIMITER),
            )

            // Validate the new choices
            errors = validate(lines)
        } catch (e) {
            const prefix = e instanceof CsvError ? 'Invalid CSV file: ' : ''
            const msg = (e as Error).message
            errors = [prefix + msg]
        }

        // Report result
        if (errors.length === 0) {
            onImport(lines)

            logEvent(SegmentEvent.CustomFieldDropdownCsvImportSuccessful, {
                count: lines.length,
                objectType,
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `${lines.length} values successfully imported.`,
                }),
            )
        } else {
            logEvent(SegmentEvent.CustomFieldDropdownCsvImportError, {
                objectType,
            })

            const errorMsg =
                errors.length > 1
                    ? '<ul><li>' + errors.join('</li><li>') + '</li></ul>'
                    : errors[0]
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Import was unsuccessful: ' + errorMsg,
                    allowHTML: true,
                }),
            )
        }

        onClose()
    }, [pickedFile])

    // Prevent closing the modal during imports
    const toggleModal = !isImporting ? onClose : undefined

    return (
        <>
            <Modal
                isOpen={isOpen && !isConfirmationOpen}
                onClose={onClose}
                toggle={toggleModal}
                centered
                className={css.modal}
                container={appNode ?? undefined}
            >
                <ModalHeader toggle={toggleModal}>
                    Import values from CSV
                </ModalHeader>
                <ModalBody>
                    {isImporting ? (
                        <Loader minHeight="100px" />
                    ) : (
                        <div>
                            <p>
                                Download a{' '}
                                <Link
                                    to="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        saveFileAsDownloaded(
                                            'dropdown-template.csv',
                                            DROPDOWN_CSV_TEMPLATE,
                                            'text/csv',
                                        )
                                    }}
                                >
                                    CSV template
                                </Link>{' '}
                                to see an example of format required.
                                <span id={tooltipId} className="ml-2">
                                    <i className="material-icons">
                                        info_outline
                                    </i>
                                </span>
                                <Tooltip
                                    target={tooltipId}
                                    container=".modal-body"
                                    placement="top"
                                    innerProps={{
                                        innerClassName: css.tooltip,
                                    }}
                                >
                                    <ul>
                                        <li>UTF-8 format</li>
                                        <li>Max 2,000 lines</li>
                                        <li>No duplicates</li>
                                        <li>Max 5 nested children levels</li>
                                        <li>
                                            Each nested level in a separate
                                            column
                                        </li>
                                    </ul>
                                </Tooltip>
                            </p>
                            <DropdownCSVImportDropZone
                                file={pickedFile}
                                setFile={setPickedFile}
                            />
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className={css.footer}>
                    <LinkButton
                        href="https://docs.gorgias.com/en-US/216129-a33a5ec5120f4fbebc16e92a678631d1"
                        target="_blank"
                        rel="noopener noreferrer"
                        fillStyle="ghost"
                        className="mr-auto"
                    >
                        <i className="material-icons mr-2">menu_book</i>
                        Learn more
                    </LinkButton>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={
                            needsConfirmation
                                ? () => setIsConfirmationOpen(true)
                                : handleImport
                        }
                        isDisabled={!pickedFile}
                        isLoading={isImporting}
                    >
                        Import File
                    </Button>
                </ModalFooter>
            </Modal>

            <ConfirmationModal
                isOpen={isOpen && isConfirmationOpen}
                title="Overwrite dropdown values"
                confirmText="Overwrite"
                confirmIntent="primary"
                confirmIsLoading={isImporting}
                onConfirm={async () => {
                    await handleImport()
                    setIsConfirmationOpen(false)
                }}
                onClose={() => {
                    setIsConfirmationOpen(false)
                    onClose()
                }}
            >
                <p>
                    Importing new values will overwrite the old ones. Existing
                    {customFieldTypeLabel}s using the old values will keep them.
                </p>
                <p className="mb-0">
                    Are you sure you want to overwrite the values?
                </p>
            </ConfirmationModal>
        </>
    )
}

export default DropdownCSVImport
