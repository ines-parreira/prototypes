import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { GorgiasAppAuthService } from '@repo/api-resources/gorgiasAppsAuth'
import type { AxiosError } from 'axios'
import { parse as parseQueryString } from 'qs'
import { useHistory, useLocation } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import type { CsvColumnPreview } from '../../../../models/helpCenter/types'
import { Loader } from '../../../common/components/Loader/Loader'
import { PageHeader } from '../../../common/components/PageHeader'
import { HELP_CENTER_BASE_PATH } from '../constants'
import { useCurrentHelpCenter } from '../hooks/useCurrentHelpCenter'
import { useHelpCenterApi } from '../hooks/useHelpCenterApi'
import { useMigrationApi } from '../hooks/useMigrationApi'
import { useSupportedLocales } from '../providers/SupportedLocales'
import { HelpCenterDetailsBreadcrumb } from './HelpCenterDetailsBreadcrumb'
import { CsvColumnMatching } from './Imports/components/CsvColumnMatching/CsvColumnMatching'
import type { GorgiasFieldsMappingsLocalized } from './Imports/components/CsvColumnMatching/types'
import { mapCSVLocalValuesToAPIPayload } from './Imports/components/CsvColumnMatching/utils'
import type { AutoOpenSessionLocationState } from './Imports/components/ImportSection/types'
import {
    getErrorMessage,
    responseIsSession,
} from './Imports/components/ImportSection/utils'

const urlToArticles = (
    helpCenterId: number,
    locationPathname: string,
): string => {
    const helpCenterRootPath = locationPathname.split(
        helpCenterId.toString(),
    )[0]

    return `${helpCenterRootPath}${helpCenterId}/articles`
}

export const HelpCenterImportCsvColumnMatchingView: React.FC = () => {
    const locales = useSupportedLocales()
    const location = useLocation()
    const helpCenter = useCurrentHelpCenter()
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const { client } = useHelpCenterApi()
    const migrationClient = useMigrationApi()
    const [csvColumns, setCsvColumns] = useState<CsvColumnPreview[] | null>(
        null,
    )
    const history = useHistory()
    const [importInProgress, setImportInProgress] = useState(false)
    const authServiceRef = useRef(new GorgiasAppAuthService())

    useEffect(() => {
        const queryString = parseQueryString(location.search, {
            ignoreQueryPrefix: true,
        })
        const rawFileUrl = queryString.file_url

        if (typeof rawFileUrl === 'string' && rawFileUrl.length > 0) {
            setFileUrl(rawFileUrl)
        } else {
            toast.error(
                'Could not load CSV file: missing URL parameter file_url',
                { duration: Infinity },
            )
        }
    }, [location.search])

    useEffect(() => {
        if (!migrationClient || !fileUrl || !helpCenter) return
        if (csvColumns) return

        void (async () => {
            try {
                const { data } = await migrationClient.analysis(undefined, {
                    file_url: fileUrl,
                })
                if (!('result' in data)) return

                if (data.result.status === 'FAILED' || !data.result.columns) {
                    let error = 'internal error'

                    switch (data.result.error) {
                        case 'MALFORMED_FILE':
                            error = 'the file is not valid'
                            break
                        case 'FILE_OVER_400_ROWS':
                            error =
                                'the file contains more than 400 articles, please split it into several smaller files.'
                    }

                    toast.error(`Could not analyse CSV file: ${error}`, {
                        duration: Infinity,
                    })

                    history.push(
                        urlToArticles(helpCenter.id, location.pathname),
                    )
                } else {
                    setCsvColumns(data.result.columns)
                }
            } catch (e) {
                const error = e as AxiosError
                if (error.response?.status === 408) {
                    toast.error(
                        'The CSV analysis took too long, your file may be too big. Try to split it into several smaller files.',
                        { duration: Infinity },
                    )
                    return
                }

                toast.error(
                    `Could not load CSV file from url ${fileUrl}, please check that the URL is valid`,
                    { duration: Infinity },
                )
            }
        })()
    }, [
        migrationClient,
        csvColumns,
        history,
        location.pathname,
        fileUrl,
        helpCenter,
    ])

    // locales == [] can only occur if the locales haven't been retrieved yet
    if (
        locales.length === 0 ||
        csvColumns === null ||
        !client ||
        fileUrl === null
    ) {
        return <Loader />
    }

    const handleOnImport = async (mappings: GorgiasFieldsMappingsLocalized) => {
        const providerPayload = mapCSVLocalValuesToAPIPayload(fileUrl, mappings)
        if (!migrationClient || !providerPayload) return

        setImportInProgress(true)

        try {
            const { data } = await migrationClient.sessionCreate(undefined, {
                migration: {
                    provider: providerPayload,
                    receiver: {
                        type: 'Gorgias',
                        access_token:
                            // the gorgias apps token is prefixed with Bearer, strip it for the payload
                            (
                                await authServiceRef.current.getAccessToken()
                            )?.replace('Bearer ', '') || '',
                        help_center_id: helpCenter.id,
                    },
                },
            })
            if (!responseIsSession(data)) return

            const locationState: AutoOpenSessionLocationState = {
                autoOpenSession: data,
            }
            history.push(
                `${HELP_CENTER_BASE_PATH}/${helpCenter.id}/articles`,
                locationState,
            )
        } catch (error) {
            let message = 'There was an error importing your CSV file'

            const errorMessage = getErrorMessage(error)
            if (errorMessage) message += ': ' + errorMessage

            toast.error(message)
        } finally {
            setImportInProgress(false)
        }
    }

    const handleOnCancel = () => {
        history.push(urlToArticles(helpCenter.id, location.pathname))
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
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
