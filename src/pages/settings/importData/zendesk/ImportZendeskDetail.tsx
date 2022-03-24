import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {bindActionCreators} from 'redux'
import {fromJS, Map} from 'immutable'
import {useEffectOnce} from 'react-use'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Popover,
    PopoverBody,
    Table,
} from 'reactstrap'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {
    fetchIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import {getTimezone} from 'state/currentUser/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {ZENDESK_INTEGRATION_TYPE} from 'constants/integration'
import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Tooltip from 'pages/common/components/Tooltip'
import settingsCss from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {ImportStatus} from './types'
import {getImportCompletionDate} from './utils'
import ImportStatusAlert from './ImportStatusAlert'
import css from './ImportZendeskDetail.less'

export const ImportZendeskDetail = (
    props: RouteComponentProps<{integrationId: string}> &
        ConnectedProps<typeof connector>
) => {
    const {
        fetchIntegration,
        updateOrCreateIntegration,
        match: {
            params: {integrationId},
        },
        integration,
        loading,
        timezone,
    } = props
    const [isPopoverOpened, setIsPopoverOpened] = useState(false)

    useEffectOnce(() => {
        fetchIntegration(integrationId, ZENDESK_INTEGRATION_TYPE)
    })

    if (loading) {
        return <Loader />
    }
    const integrationMeta = integration.get('meta', fromJS({})) as Map<any, any>
    const importStatus = integrationMeta.get('status')

    const displayImportStats = integrationMeta.get(
        'display_import_stats',
        false
    )
    const accountTicketsCount = integrationMeta.getIn([
        'account_stats',
        'tickets_count',
    ])
    const ticketsCount = integrationMeta.getIn(['sync_tickets', 'count'], 0)
    const synchronizationEnabled = integrationMeta.get(
        'continuous_import_enabled',
        false
    )
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
            id: integration.get('id'),
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
                            {integration.get('name')}{' '}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={settingsCss.pageContainer}>
                <div className="row mb-5">
                    <div className="col-sm-12 col-md-7 col-lg-4">
                        <ImportStatusAlert integrationMeta={integrationMeta} />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-sm-12 col-md-7 col-lg-4">
                        <div className="md-4">
                            <DEPRECATED_InputField
                                readOnly
                                type="text"
                                name="domain"
                                value={integration.get('name')}
                                label="Account name"
                                rightAddon=".zendesk.com"
                                disabled
                            />
                        </div>
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
                                className={css.learnPopover}
                                placement="bottom-start"
                                isOpen={isPopoverOpened}
                                target="learn-button"
                                toggle={() => {
                                    setIsPopoverOpened(false)
                                }}
                                trigger="legacy"
                            >
                                <PopoverBody>
                                    <div className="align-content-center mb-1">
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
                                                integrationMeta.getIn(
                                                    ['sync_macros', 'count'],
                                                    0
                                                ) as number
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta.getIn(
                                                    [
                                                        'sync_users',
                                                        'customers_count',
                                                    ],
                                                    0
                                                ) as number
                                            )}
                                        </td>
                                        <td>
                                            {displayStatisticsValue(
                                                integrationMeta.getIn(
                                                    [
                                                        'sync_users',
                                                        'users_count',
                                                    ],
                                                    0
                                                ) as number
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <span className="text-muted">
                                {getImportCompletionDate(integration, timezone)}
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
            </Container>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    integration: state.integrations.get('integration', fromJS({})) as Map<
        any,
        any
    >,
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
export default withRouter(connector(ImportZendeskDetail))
