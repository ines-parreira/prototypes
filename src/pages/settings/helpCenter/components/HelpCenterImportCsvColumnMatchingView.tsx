import React, {useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {parse as parseQueryString} from 'query-string'

import {CsvColumnPreview} from '../../../../models/helpCenter/types'

import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import {useHelpcenterApi} from '../hooks/useHelpcenterApi'

import {useLocales} from '../hooks/useLocales'

import Loader from '../../../common/components/Loader/Loader'

import PageHeader from '../../../common/components/PageHeader'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import CsvColumnMatching from './Imports/components/CsvColumnMatching/CsvColumnMatching'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'

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
                    setCsvColumns(response.data.columns)
                })
                .catch((error) => {
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
    }, [client, csvColumns, dispatch, isReady, fileUrl, helpCenter])

    // locales == [] can only occur if the locales haven't been retrieved yet
    if (helpCenter === null || locales.length === 0 || csvColumns === null) {
        return <Loader />
    }

    const handleOnImport = () => {
        // TODO: implemented in SS-810
    }

    const handleOnCancel = () => {
        const helpCenterRootPath = location.pathname.split(
            helpCenter.id.toString()
        )[0]

        const pathToHelpCenterInstallation = `${helpCenterRootPath}${helpCenter.id}/installation`

        history.push(pathToHelpCenterInstallation)
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

            <CsvColumnMatching
                csvColumns={csvColumns}
                helpCenter={helpCenter}
                locales={locales}
                onCancel={handleOnCancel}
                onImport={handleOnImport}
            />
        </div>
    )
}

export default HelpCenterImportCsvColumnMatchingView
