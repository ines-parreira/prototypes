import {isEmpty} from 'lodash'
import React from 'react'
import {Link, Redirect} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import {EmailMigrationStatus} from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import {getEmailMigrationStatus} from 'state/integrations/selectors'

import MigrationComplete from './MigrationComplete'
import MigrationInProgress from './MigrationInProgress'
import StartMigration from './StartMigration'

export default function EmailMigration() {
    const migrationStatus = useAppSelector(getEmailMigrationStatus)

    if (!migrationStatus || isEmpty(migrationStatus)) {
        return <Loader data-testid="loader" />
    }

    if (!migrationStatus.status) return <Redirect to="/app" />

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/channels/email">Email</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Email migration</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            {migrationStatus.status === EmailMigrationStatus.Enabled && (
                <StartMigration />
            )}
            {migrationStatus.status === EmailMigrationStatus.Pending && (
                <MigrationInProgress />
            )}
            {migrationStatus.status === EmailMigrationStatus.Completed && (
                <MigrationComplete />
            )}
        </div>
    )
}
