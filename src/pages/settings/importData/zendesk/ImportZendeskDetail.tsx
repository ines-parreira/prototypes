import {Tooltip} from '@gorgias/ui-kit'
import {fromJS} from 'immutable'
import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useParams} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Popover,
    PopoverBody,
    Table,
} from 'reactstrap'
import {bindActionCreators} from 'redux'

import {useAppNode} from 'appNode'
import {DateAndTimeFormatting} from 'constants/datetime'
import {ZENDESK_INTEGRATION_TYPE} from 'constants/integration'
import useEffectOnce from 'hooks/useEffectOnce'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {IntegrationType} from 'models/integration/constants'
import {ZendeskIntegration} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import {getTimezone} from 'state/currentUser/selectors'
import {
    fetchIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {RootState, StoreDispatch} from 'state/types'

import EditCredentialsForm from './EditCredentialsForm'
import ImportStatusAlert from './ImportStatusAlert'
import css from './ImportZendeskDetail.less'
import {ImportStatus} from './types'
import {getImportCompletionDate} from './utils'

export const ImportZendeskDetail = ({
    fetchIntegration,
    updateOrCreateIntegration,
    integrations,
    loading,
    timezone,
}: ConnectedProps<typeof connector>) => {
    const [isPopoverOpened, setIsPopoverOpened] = useState(false)
    const {integrationId} = useParams<{integrationId: string}>()
    const appNode = useAppNode()

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDateWithTime
    )

    useEffectOnce(() => {
        fetchIntegration(integrationId, ZENDESK_INTEGRATION_TYPE)
    })

    const integration = integrations.find(
        (integration) => integration.id === parseInt(integrationId, 10)
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
    const shouldDisplayPercentage =
        !synchronizationEnabled || importStatus !== ImportStatus.Success
    const importedTicketsPercentage =
        shouldDisplayPercentage &&
        accountTicketsCount &&
        displayImportStats &&
        ticketsCount > 0
            ? ~~((ticketsCount * 100) / accountTicketsCount)
            : null

    const displayStatisticsValue = (value: number | null): string => {
        if (typeof value === 'number') {
            return value.toLocaleString()
        }
        return 'N/A'
    }
    const handleSyncClick = () => {
        const integrationData = fromJS({
            id: integration.id,
            meta: {continuous_import_enabled: !synchronizationEnabled},
        })

        updateOrCreateIntegration(integrationData)
    }
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/import-data">
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
                            >
                                <ButtonIconLabel icon="info_outline">
                                    Learn
                                </ButtonIconLabel>
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
                                        href="https://docs.gorgias.com/migrating-helpdesks/switching-from-zendesk"
                                    >
                                        <Button size="small" intent="secondary">
                                            <ButtonIconLabel
                                                icon="arrow_forward"
                                                position="right"
                                            >
                                                Learn more
                                            </ButtonIconLabel>
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
                                                ticketsCount
                                            )}
                                            {importedTicketsPercentage ? (
                                                <span className="text-muted">
                                                    {` / ${
                                                        importedTicketsPercentage >
                                                        100
                                                            ? 100
                                                            : importedTicketsPercentage
                                                    } %`}
                                                </span>
                                            ) : null}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta?.sync_macros
                                                    ?.count || 0
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta?.sync_users
                                                    ?.customers_count || 0
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta?.sync_users
                                                    ?.users_count || 0
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <span className="text-muted">
                                {getImportCompletionDate(
                                    integration,
                                    datetimeFormat,
                                    timezone
                                )}
                            </span>
                        </div>
                    </div>
                ) : null}
                {importStatus === ImportStatus.Success &&
                    (synchronizationEnabled ? (
                        <Button onClick={handleSyncClick}>
                            <ButtonIconLabel icon="pause_circle_filled">
                                Pause
                            </ButtonIconLabel>
                        </Button>
                    ) : (
                        <Button onClick={handleSyncClick}>
                            <ButtonIconLabel icon="play_circle_filled">
                                Resume
                            </ButtonIconLabel>
                        </Button>
                    ))}
            </div>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    integrations: getIntegrationsByType<ZendeskIntegration>(
        IntegrationType.Zendesk
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
        dispatch
    )

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(ImportZendeskDetail)
