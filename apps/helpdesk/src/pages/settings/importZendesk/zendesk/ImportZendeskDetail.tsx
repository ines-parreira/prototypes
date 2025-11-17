import React, { useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import classNames from 'classnames'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Popover,
    PopoverBody,
    Table,
} from 'reactstrap'
import { bindActionCreators } from 'redux'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { IntegrationType } from 'models/integration/constants'
import type { ZendeskIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import { getTimezone } from 'state/currentUser/selectors'
import {
    fetchIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import { getIntegrationsByType } from 'state/integrations/selectors'
import type { RootState, StoreDispatch } from 'state/types'

import EditCredentialsForm from './EditCredentialsForm'
import ImportStatusAlert from './ImportStatusAlert'
import { ImportStatus } from './types'
import { getImportCompletionDate } from './utils'

import css from './ImportZendeskDetail.less'

export const ImportZendeskDetail = ({
    fetchIntegration,
    updateOrCreateIntegration,
    integrations,
    loading,
    timezone,
}: ConnectedProps<typeof connector>) => {
    const [isPopoverOpened, setIsPopoverOpened] = useState(false)
    const { integrationId } = useParams<{ integrationId: string }>()
    const appNode = useAppNode()

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDateWithTime,
    )

    useEffectOnce(() => {
        fetchIntegration(integrationId, IntegrationType.Zendesk)
    })

    const integration = integrations.find(
        (integration) => integration.id === parseInt(integrationId, 10),
    )

    if (loading || integration === undefined) {
        return <Loader />
    }
    const integrationMeta = integration.meta
    const importStatus = integrationMeta.status

    const displayImportStats = integrationMeta.display_import_stats || false
    const accountTicketsCount = integrationMeta.account_stats.tickets_count
    const ticketsCount = integrationMeta.sync_tickets.count || 0
    const synchronizationEnabled =
        integrationMeta.continuous_import_enabled || false
    const shouldDisplayProgress =
        !synchronizationEnabled || importStatus !== ImportStatus.Success
    const showImportedTicketsProgress =
        shouldDisplayProgress &&
        accountTicketsCount &&
        displayImportStats &&
        ticketsCount > 0

    const currentNumberOfTicketsImported = ticketsCount === accountTicketsCount

    const displayStatisticsValue = (value: number | null): string => {
        if (typeof value === 'number') {
            return value.toLocaleString()
        }
        return 'N/A'
    }
    const handleSyncClick = () => {
        const integrationData = fromJS({
            id: integration.id,
            meta: { continuous_import_enabled: !synchronizationEnabled },
        })

        updateOrCreateIntegration(integrationData)
    }
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/import-zendesk">
                                Import data
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.name}{' '}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={settingsCss.pageContainer}>
                <div className="row mb-5">
                    <div className="col-sm-12 col-md-7 col-lg-4">
                        <ImportStatusAlert integrationMeta={integrationMeta} />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-sm-12 col-md-7 col-lg-4">
                        <EditCredentialsForm integration={integration} />
                    </div>
                </div>
                <div className="row mb-5">
                    <div className="col-sm-12 col-md-8 col-lg-5">
                        <h4>
                            Import summary{' '}
                            <Button
                                id="learn-button"
                                className={css.learnButton}
                                intent="secondary"
                                onClick={() => {
                                    setIsPopoverOpened(!isPopoverOpened)
                                }}
                                leadingIcon="info_outline"
                            >
                                Learn
                            </Button>
                            <Popover
                                placement="bottom-start"
                                isOpen={isPopoverOpened}
                                target="learn-button"
                                toggle={() => {
                                    setIsPopoverOpened(false)
                                }}
                                trigger="legacy"
                                container={appNode ?? undefined}
                            >
                                <PopoverBody>
                                    <div className="align-content-center mb-3">
                                        You’ve made the decision to transform
                                        the way your organization executes
                                        support. Now it’s time to implement that
                                        change. Here are the steps and resources
                                        required for successfully launching
                                        Gorgias with a Zendesk import. Please
                                        note that we can only import about 2,500
                                        tickets per hour from Zendesk.
                                        Therefore, if there is a lot of Zendesk
                                        data, the import can take a few days.
                                    </div>
                                    <a
                                        className="mb-1"
                                        href="https://link.gorgias.com/89f03c"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            size="small"
                                            intent="secondary"
                                            trailingIcon="arrow_forward"
                                        >
                                            Learn more
                                        </Button>
                                    </a>
                                </PopoverBody>
                            </Popover>
                        </h4>
                        <p>
                            The past 2 weeks of ticket history is imported
                            first. The rest is imported starting from 2 years in
                            the past and ending when we reach the 2-week mark
                            imported previously.
                        </p>
                    </div>
                </div>

                {displayImportStats ? (
                    <div className="row no-gutters mb-5">
                        <div className="col-sm-12 col-md-8 col-lg-5">
                            <Table
                                className="table"
                                hover={true}
                                responsiveTag="div"
                                tag="table"
                            >
                                <thead className="table-active">
                                    <tr>
                                        <th>
                                            Tickets{' '}
                                            <i
                                                className="material-icons"
                                                id="tickets-info"
                                            >
                                                info_outline
                                            </i>
                                            <Tooltip
                                                placement="top"
                                                target="tickets-info"
                                            >
                                                Relative to all tickets
                                            </Tooltip>
                                        </th>
                                        <th>Macros</th>
                                        <th>Customers</th>
                                        <th>Users</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {displayStatisticsValue(
                                                ticketsCount,
                                            )}
                                            {showImportedTicketsProgress && (
                                                <>
                                                    <span className="text-muted">
                                                        {` / ${accountTicketsCount}`}
                                                    </span>
                                                    {currentNumberOfTicketsImported && (
                                                        <i
                                                            className={classNames(
                                                                'material-icons-outlined',
                                                                'pl-2',
                                                                css.icon,
                                                                css.success,
                                                            )}
                                                        >
                                                            check_circle
                                                        </i>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta?.sync_macros
                                                    ?.count || 0,
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta?.sync_users
                                                    ?.customers_count || 0,
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta?.sync_users
                                                    ?.users_count || 0,
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <span className="text-muted">
                                {getImportCompletionDate(
                                    integration,
                                    datetimeFormat,
                                    timezone,
                                )}
                            </span>
                        </div>
                    </div>
                ) : null}
                {importStatus === ImportStatus.Success && (
                    <Button
                        onClick={handleSyncClick}
                        leadingIcon={
                            synchronizationEnabled
                                ? 'pause_circle_filled'
                                : 'play_circle_filled'
                        }
                    >
                        {synchronizationEnabled ? 'Pause' : 'Resume'}
                    </Button>
                )}
            </div>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    integrations: getIntegrationsByType<ZendeskIntegration>(
        IntegrationType.Zendesk,
    )(state),
    loading: state.integrations.getIn(['state', 'loading', 'integration']),
    timezone: getTimezone(state),
})

const mapDispatchToProps = (dispatch: StoreDispatch) =>
    bindActionCreators(
        {
            fetchIntegration,
            updateOrCreateIntegration,
        },
        dispatch,
    )

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(ImportZendeskDetail)
