import React, {useEffect, useMemo, useState} from 'react'

import {fetchAppErrorLogs} from 'models/integration/resources'
import {AppDetail, AppErrorLog} from 'models/integration/types/app'
import Loader from 'pages/common/components/Loader/Loader'
import {scopesToPermissions} from '../../../config/oauthPermissions'
import AppErrorRow from './AppErrorRow'
import AppPermissions from './AppPermissions'

export default function AppAdvanced(props: AppDetail) {
    const [isLoading, setLoading] = useState(false)
    const [errorLogs, setErrorLogs] = useState<AppErrorLog[] | null>(null)

    const permissions = useMemo(
        () => scopesToPermissions(props.grantedScopes || []),
        [props.grantedScopes]
    )

    // Load error logs
    useEffect(() => {
        async function loadErrorLogs(appId: string) {
            setLoading(true)
            try {
                const logs = await fetchAppErrorLogs(appId)
                setErrorLogs(logs)
            } catch (error) {
                console.error('Error loading error logs', error)
            } finally {
                setLoading(false)
            }
        }
        void loadErrorLogs(props.appId)
    }, [props.appId])

    // Show a loader until the loading finishes
    if (isLoading || errorLogs === null) {
        return <Loader minHeight="300px" />
    }

    return (
        <div className="p-4">
            <h2 className="mb-4">Granted permissions</h2>
            <AppPermissions permissions={permissions} />

            <h2 className="mb-4 mt-5">Error Logs</h2>
            {errorLogs.length === 0 && (
                <p>No errors to show from the past 7 days.</p>
            )}
            {errorLogs.map((errorLog, index) => (
                <AppErrorRow key={index} {...errorLog} />
            ))}
        </div>
    )
}
