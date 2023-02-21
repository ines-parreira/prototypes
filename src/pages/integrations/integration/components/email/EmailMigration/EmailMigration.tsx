import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Link, Redirect} from 'react-router-dom'
import {isEmpty} from 'lodash'
import PageHeader from 'pages/common/components/PageHeader'
import useAppSelector from 'hooks/useAppSelector'
import {getEmailMigrationStatus} from 'state/integrations/selectors'
import {EmailMigrationStatus} from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import StartMigration from './StartMigration'
import MigrationInProgress from './MigrationInProgress'

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
                <div data-testid="migration-complete"></div>
            )}
        </div>
    )
}
