import type { ChangeEvent } from 'react'
import type React from 'react'
import { useRef, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { saveFileAsDownloaded } from '@repo/utils'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import { uploadFiles } from 'common/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasApiError } from 'models/api/types'
import { createJob } from 'models/job/resources'
import { JobType } from 'models/job/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './MacrosCSVImportPopover.less'

const MAXIMUM_FILE_SIZE_MB = 10
const fileIsTooBig = (file: File) => file.size / 1e6 >= MAXIMUM_FILE_SIZE_MB

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const MacrosCSVImportPopover = ({ isOpen, onClose }: Props) => {
    const [pickedFile, setPickedFile] = useState<File | null>(null)
    const hiddenFileInputRef = useRef<HTMLInputElement>(null)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const dispatch = useAppDispatch()
    const appNode = useAppNode()

    const [{ loading: isImporting }, handleImport] = useAsyncFn(async () => {
        if (!pickedFile) return

        logEvent(SegmentEvent.MacrosImportClicked, {
            account_domain: currentAccount.get('domain'),
        })

        let uploadedFiles
        try {
            uploadedFiles = await uploadFiles([pickedFile])
        } catch (e) {
            const error = e as GorgiasApiError
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        error.response?.status === 413
                            ? 'Failed to upload file because its size is bigger than 10MB. Try splitting it into several smaller files.'
                            : (error.response?.data.error.msg ??
                              'Failed to upload file. Please try again later.'),
                }),
            )
            return
        }
        const requestPayload = {
            type: JobType.ImportMacro,
            params: { url: uploadedFiles[0].url },
        }
        try {
            await createJob(requestPayload)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        'All the macros will be imported. You will receive a notification via email once the import is done.',
                }),
            )
            onClose()
            setPickedFile(null)
        } catch (e) {
            const error = e as GorgiasApiError
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        error.response?.data.error.msg ??
                        'Failed to import macros. Please try again later.',
                }),
            )
        }
    }, [pickedFile])

    const openFileDialog = () => hiddenFileInputRef.current?.click()

    const handleFileDropped = (event: React.DragEvent) => {
        event.preventDefault()
        const file = event.dataTransfer.items[0].getAsFile()
        if (file && file.name.toLocaleLowerCase().endsWith('.csv'))
            setPickedFile(file)
    }

    const handleFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) setPickedFile(event.target.files[0])
    }

    const shouldShowModalFooter =
        pickedFile && !fileIsTooBig(pickedFile) && !isImporting
    const toggleModal = !isImporting ? onClose : undefined

    return (
        <Modal
            size="lg"
            isOpen={isOpen}
            onClose={onClose}
            centered
            toggle={toggleModal}
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={toggleModal}>
                Import macros from CSV
            </ModalHeader>
            <ModalBody>
                {isImporting ? (
                    <Loader minHeight="100px" />
                ) : (
                    <div>
                        <p>
                            You can import your macros into gorgias using a CSV.
                            More information on macros variables{' '}
                            <a
                                href="https://docs.gorgias.com/macros/macro-variables"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                here.
                            </a>
                        </p>
                        <p>
                            You can{' '}
                            <Link
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    saveFileAsDownloaded(
                                        'template.csv',
                                        'name,body_text,tags\r\nGreet customer,Hello dear customer...,"tag1, tag2"',
                                        'text/csv',
                                    )
                                }}
                            >
                                download this CSV template
                            </Link>{' '}
                            with the proper column names.
                        </p>
                        <Alert type={AlertType.Warning} icon>
                            This process will update your macro if we find a
                            macro in the CSV with the same ID as an existing
                            macro in your account. If no ID is provided we will
                            create a new macro.
                        </Alert>
                        <br />
                        <Alert type={AlertType.Warning} icon>
                            Text formatting will be lost when updating an
                            existing macro.
                        </Alert>
                        <br />
                        <Alert type={AlertType.Warning} icon>
                            CSV file must be encoded in UTF-8.
                        </Alert>
                        <br />
                        <input
                            type="file"
                            accept=".csv"
                            ref={hiddenFileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChosen}
                        />
                        {pickedFile ? (
                            <div>
                                <div className={css.fileSelectedArea}>
                                    <div>
                                        <i className="material-icons mr-2">
                                            insert_drive_file
                                        </i>
                                        {pickedFile.name}
                                    </div>

                                    <div>
                                        <Button
                                            intent="secondary"
                                            size="small"
                                            onClick={openFileDialog}
                                        >
                                            Change File
                                        </Button>
                                    </div>
                                </div>

                                {fileIsTooBig(pickedFile) ? (
                                    <div className="text-danger">
                                        The size of your file is over{' '}
                                        {MAXIMUM_FILE_SIZE_MB}MB, please select
                                        another file.
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className={css.dropAreasContainer}>
                                <div
                                    className={css.fileDropArea}
                                    onClick={openFileDialog}
                                    onDrop={handleFileDropped}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.modalCloudIcon,
                                        )}
                                    >
                                        cloud_upload
                                    </i>

                                    <b className={css.dropAreaText}>
                                        Drop your CSV here, or{' '}
                                        <a
                                            href=""
                                            onClick={(ev) => {
                                                ev.preventDefault()
                                            }}
                                        >
                                            browse
                                        </a>
                                    </b>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>
            {shouldShowModalFooter && (
                <ModalFooter className={css.modalFooter}>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={() => handleImport()}>Import File</Button>
                </ModalFooter>
            )}
        </Modal>
    )
}

export default MacrosCSVImportPopover
