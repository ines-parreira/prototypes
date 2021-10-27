import React, {useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {parse as parseQueryString} from 'query-string'

import {AxiosError} from 'axios'

import {CsvColumnPreview} from '../../../../models/helpCenter/types'

import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import {useHelpcenterApi} from '../hooks/useHelpcenterApi'

import {useLocales} from '../hooks/useLocales'

import Loader from '../../../common/components/Loader/Loader'

import PageHeader from '../../../common/components/PageHeader'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {notify} from '../../../../state/notifications/actions'
import {
    Notification,
    NotificationStatus,
} from '../../../../state/notifications/types'

import {HELP_CENTER_BASE_PATH} from '../constants'

import {Components} from '../../../../../../../rest_api/help_center_api/client.generated'

import CsvColumnMatching from './Imports/components/CsvColumnMatching/CsvColumnMatching'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {GorgiasFieldsMappingsLocalized} from './Imports/components/CsvColumnMatching/types'
import {gorgiasFieldsMappingsLocalizedToDto} from './Imports/components/CsvColumnMatching/utils'

import {
    importFailed,
    importPartial,
    importSuccessful,
} from './Imports/utils/import-response-type'

const urlToInstallation = (
    helpCenterId: number,
    locationPathname: string
): string => {
    const helpCenterRootPath = locationPathname.split(
        helpCenterId.toString()
    )[0]

    return `${helpCenterRootPath}${helpCenterId}/installation`
}

const notifyPartialImport = (
    reportPartial: Components.Schemas.ProcessCsvResponsePartialDto
): Notification => {
    const {
        num_erroneous_csv_rows,
        num_imported_csv_rows,
        erroneous_csv_rows_file_url: reportUrl,
    } = reportPartial

    const totalRows = num_imported_csv_rows + num_erroneous_csv_rows

    const linkToFile =
        reportUrl === undefined
            ? ''
            : ` <a href="${reportUrl}" target="_blank">Download a file with just the missing articles</a>, correct them and try uploading again to complete your import.`

    return {
        status: NotificationStatus.Error,
        message: `\
${num_imported_csv_rows}/${totalRows} articles successfully imported. \
There was an error importing ${num_erroneous_csv_rows} articles.${linkToFile}`,
        noAutoDismiss: true,
        allowHTML: true,
    }
}

export const HelpCenterImportCsvColumnMatchingView = (): JSX.Element | null => {
    const locales = useLocales()
    const location = useLocation()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const {isReady, client} = useHelpcenterApi()
    const [csvColumns, setCsvColumns] = useState<CsvColumnPreview[] | null>(
        null
    )
    const history = useHistory()
    const dispatch = useAppDispatch()
    const [importInProgress, setImportInProgress] = useState(false)

    useEffect(() => {
        const queryString = parseQueryString(location.search)
        const rawFileUrl = queryString.file_url

        if (typeof rawFileUrl === 'string' && rawFileUrl.length > 0) {
            setFileUrl(rawFileUrl)
        } else {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Could not load CSV file: missing URL parameter file_url',
                    noAutoDismiss: true,
                })
            )
        }
    }, [dispatch, location.search])

    useEffect(() => {
        if (client && isReady && fileUrl && helpCenter && csvColumns === null) {
            void client
                .analyseCsv(
                    {
                        help_center_id: helpCenter.id,
                    },
                    {file_url: fileUrl}
                )
                .then((response) => {
                    if (response.data.result.status === 'FAILED') {
                        const error =
                            response.data.result.error === 'MALFORMED_FILE'
                                ? 'the file is not valid'
                                : 'internal error'

                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message: `Could not analyse CSV file: ${error}`,
                                noAutoDismiss: true,
                            })
                        )

                        console.error('error analysing CSV file', {
                            error,
                            fileUrl,
                        })

                        history.push(
                            urlToInstallation(helpCenter.id, location.pathname)
                        )
                    } else {
                        setCsvColumns(response.data.result.columns)
                    }
                })
                .catch((error: AxiosError) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: `Could not load CSV file from url ${fileUrl}, please check that the URL is valid`,
                            noAutoDismiss: true,
                        })
                    )
                    console.error('error downloading CSV file', {
                        error,
                        fileUrl,
                    })
                })
        }
    }, [
        client,
        csvColumns,
        dispatch,
        history,
        location.pathname,
        isReady,
        fileUrl,
        helpCenter,
    ])

    // locales == [] can only occur if the locales haven't been retrieved yet
    if (
        helpCenter === null ||
        locales.length === 0 ||
        csvColumns === null ||
        client === undefined ||
        !isReady ||
        fileUrl === null
    ) {
        return <Loader />
    }

    const handleOnImport = async (mappings: GorgiasFieldsMappingsLocalized) => {
        const mappingsDto = gorgiasFieldsMappingsLocalizedToDto(
            fileUrl,
            mappings
        )

        if (mappingsDto !== undefined) {
            setImportInProgress(true)

            try {
                const response = await client.importCsv(
                    {
                        help_center_id: helpCenter.id,
                    },
                    mappingsDto
                )

                setImportInProgress(false)

                const {report} = response.data
                const baseHelpCenterPath = `${HELP_CENTER_BASE_PATH}/${helpCenter.id}`

                if (importSuccessful(report)) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: `Successfully imported ${report.num_imported_csv_rows}/${report.num_imported_csv_rows} articles.`,
                        })
                    )

                    return history.push(`${baseHelpCenterPath}/articles`)
                } else if (importPartial(report)) {
                    void dispatch(notify(notifyPartialImport(report)))

                    return history.push(`${baseHelpCenterPath}/installation`)
                } else if (importFailed(report)) {
                    // should be else, not else if, but TypeScript fails to infer it
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'There was an error importing your CSV file. Please review it and try again.',
                        })
                    )

                    return history.push(`${baseHelpCenterPath}/installation`)
                }
            } catch (e) {
                setImportInProgress(false)

                console.error(e)

                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'An internal error occurred while importing the CSV, please try again later.',
                        noAutoDismiss: true,
                    })
                )
            }
        }
    }

    const handleOnCancel = () => {
        history.push(urlToInstallation(helpCenter.id, location.pathname))
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={helpCenter.name}
                        activeLabel="Import CSV"
                    />
                }
            />

            {importInProgress ? (
                <Loader />
            ) : (
                <CsvColumnMatching
                    csvColumns={csvColumns}
                    helpCenter={helpCenter}
                    locales={locales}
                    onCancel={handleOnCancel}
                    onImport={handleOnImport}
                />
            )}
        </div>
    )
}

export default HelpCenterImportCsvColumnMatchingView
