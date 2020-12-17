import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router'
import {bindActionCreators} from 'redux'
import {fromJS, Map} from 'immutable'
import {useEffectOnce} from 'react-use'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Popover,
    PopoverBody,
    Table,
} from 'reactstrap'

import * as IntegrationsActions from '../../../../state/integrations/actions'
import {RootState, StoreDispatch} from '../../../../state/types'
import {ZENDESK_INTEGRATION_TYPE} from '../../../../constants/integration'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField.js'
import Loader from '../../../common/components/Loader/Loader.js'
import Tooltip from '../../../common/components/Tooltip.js'

import {ImportStatus} from './types'
import {getImportCompletionDate} from './utils'
import './ImportZendeskDetail.less'

export interface ImportZendeskDetailProps
    extends ConnectedProps<typeof connector> {
    params: {
        integrationId: string
    }
}

export const ImportZendeskDetail = (props: ImportZendeskDetailProps) => {
    const {fetchIntegration, params, integration, loading} = props
    const [isPopoverOpened, setIsPopoverOpened] = useState(false)

    useEffectOnce(() => {
        fetchIntegration(params.integrationId, ZENDESK_INTEGRATION_TYPE)
    })

    if (loading) {
        return <Loader />
    }

    const integrationMeta = integration.get('meta', fromJS({})) as Map<any, any>
    const displayImportStats = integrationMeta.get(
        'display_import_stats',
        false
    )
    const accountTicketsCount = integrationMeta.getIn([
        'account_stats',
        'tickets_count',
    ])
    const ticketsCount = integrationMeta.getIn(['sync_tickets', 'count'], 0)

    const importedTicketsPercentage =
        accountTicketsCount && displayImportStats && ticketsCount > 0
            ? ~~((ticketsCount * 100) / accountTicketsCount)
            : null

    const renderImportStatus = (): React.ReactChild => {
        const importStatus = integration.getIn(['meta', 'status'])

        if (importStatus === ImportStatus.Pending) {
            return (
                <Alert color="info">
                    <span>
                        <b className="alert-heading">
                            <i className="material-icons md-spin mr-2">
                                refresh
                            </i>
                            Importing your Zendesk data
                        </b>
                    </span>
                </Alert>
            )
        } else if (importStatus === ImportStatus.Success) {
            return (
                <Alert color="success">
                    <span>
                        <b className="alert-heading">
                            <i className="material-icons mr-2">
                                check_circle_outline
                            </i>
                            Import from Zendesk completed
                        </b>
                    </span>
                </Alert>
            )
        }
        return (
            <Alert color="danger">
                <span>
                    <b className="alert-heading">
                        <i className="material-icons mr-2">error_outline</i>
                        {integrationMeta.get(
                            'error',
                            'Import failed. Please contact our support.'
                        )}
                    </b>
                </span>
            </Alert>
        )
    }
    const displayStatisticsValue = (value: number | null): string => {
        if (typeof value === 'number') {
            return value.toLocaleString()
        }
        return 'N/A'
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
            <Container fluid className="page-container">
                <div className="row mb-3">
                    <div className="col-sm-12 col-md-7 col-lg-4">
                        {renderImportStatus()}
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-sm-12 col-md-7 col-lg-4">
                        <div className="md-4">
                            <InputField
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
                                active={false}
                                id="learn-button"
                                onClick={() => {
                                    setIsPopoverOpened(!isPopoverOpened)
                                }}
                            >
                                <i className="material-icons">info_outline</i>{' '}
                                Learn
                            </Button>
                            <Popover
                                className="learn-popover"
                                placement="bottom-start"
                                isOpen={isPopoverOpened}
                                target="learn-button"
                                toggle={() => {
                                    setIsPopoverOpened(false)
                                }}
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
                                    <Button
                                        size="sm"
                                        className="mb-1"
                                        active={false}
                                        href="https://docs.gorgias.com/migrating-helpdesks/switching-from-zendesk"
                                    >
                                        Learn more{' '}
                                        <i className="material-icons">
                                            arrow_forward
                                        </i>
                                    </Button>
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
                    <div className="row no-gutters">
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
                                                    {` / ${importedTicketsPercentage} %`}
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
                                {getImportCompletionDate(integration)}
                            </span>
                        </div>
                    </div>
                ) : null}
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
})

const mapDispatchToProps = (dispatch: StoreDispatch) => ({
    fetchIntegration: bindActionCreators(
        IntegrationsActions.fetchIntegration,
        dispatch
    ),
})

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(ImportZendeskDetail)
