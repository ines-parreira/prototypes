import React, {useState} from 'react'
import {Container} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {Link, NavLink, useParams} from 'react-router-dom'
import {FeatureFlagKey} from 'config/featureFlags'
import useTitle from 'hooks/useTitle'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import List from 'pages/settings/ticketFields/components/List'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Loader from 'pages/common/components/Loader/Loader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import css from './TicketFields.less'

type TicketFieldsTab = 'active' | 'archived'

export default function TicketFields() {
    useTitle('Ticket fields')
    const {activeTab} = useParams<{activeTab: TicketFieldsTab | string}>()
    const [activeCursor, setActiveCursor] = useState<Maybe<string>>(null)
    const [archivedCursor, setArchivedCursor] = useState<Maybe<string>>(null)

    const {
        data: {data: activeFields = [], meta: activeFieldsPaginationMeta} = {},
        isLoading: isLoadingActive,
    } = useGetCustomFieldDefinitions({
        archived: false,
        object_type: 'Ticket',
        cursor: activeCursor,
    })

    const {
        data: {
            data: archivedFields = [],
            meta: archivedFieldsPaginationMeta,
        } = {},
        isLoading: isLoadingArchived,
    } = useGetCustomFieldDefinitions({
        archived: true,
        object_type: 'Ticket',
        cursor: archivedCursor,
    })

    // Only show this page if the ticket fields feature flag is on
    const ticketFieldsEnabled = useFlags()[FeatureFlagKey.TicketFields]
    if (!ticketFieldsEnabled) {
        return null
    }

    const ticketFields = activeTab === 'active' ? activeFields : archivedFields

    const paginationMeta =
        activeTab === 'active'
            ? activeFieldsPaginationMeta
            : archivedFieldsPaginationMeta

    const hasActiveFields = activeFields.length > 0
    const hasArchivedFields = archivedFields.length > 0

    const hasTicketFields = hasActiveFields || hasArchivedFields
    const isLoading = isLoadingActive || isLoadingArchived

    const createFieldButton =
        activeFields.length >= 4 ? (
            <Button isDisabled>Create Field</Button>
        ) : (
            <Link to="/app/settings/ticket-fields/add">
                <Button>Create Field</Button>
            </Link>
        )

    return (
        <div className={`full-width overflow-auto ${css.pageContainer}`}>
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Ticket Fields">
                    <div className={css.headerContainer}>
                        {hasTicketFields && createFieldButton}
                    </div>
                </PageHeader>
                {hasTicketFields && (
                    <SecondaryNavbar>
                        <NavLink to="/app/settings/ticket-fields/active" exact>
                            Active
                        </NavLink>
                        <NavLink
                            to="/app/settings/ticket-fields/archived"
                            exact
                        >
                            Archived
                        </NavLink>
                    </SecondaryNavbar>
                )}
            </div>

            {isLoading ? (
                <Loader minHeight="60px" />
            ) : (
                <>
                    {!hasTicketFields ? (
                        <div className={css.emptyViewContainer}>
                            <h2 className={css.emptyViewContainerHeader}>
                                Get started with Ticket Fields
                            </h2>
                            <p className={css.emptyViewContainerText}>
                                Create custom fields to track and report common
                                ticket categories.
                            </p>
                            {createFieldButton}
                        </div>
                    ) : (
                        hasTicketFields && (
                            <Container fluid className="p-0">
                                {(activeTab === 'active' && !hasActiveFields) ||
                                (activeTab === 'archived' &&
                                    !hasArchivedFields) ? (
                                    <div className={css.emptyListTextWrapper}>
                                        You don't have any{' '}
                                        {activeTab === 'active'
                                            ? 'active'
                                            : 'archived'}{' '}
                                        ticket fields at the moment
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'active' &&
                                            activeFields.length >= 4 && (
                                                <Alert
                                                    type={AlertType.Info}
                                                    icon
                                                    className="m-4"
                                                >
                                                    You can only have 4 active
                                                    fields at a time. Please
                                                    archive some fields before
                                                    creating a new one.
                                                </Alert>
                                            )}
                                        <List ticketFields={ticketFields} />
                                        <Navigation
                                            className={css.navigation}
                                            hasNextItems={
                                                !!paginationMeta?.next_cursor
                                            }
                                            hasPrevItems={
                                                !!paginationMeta?.prev_cursor
                                            }
                                            fetchPrevItems={() => {
                                                activeTab === 'active'
                                                    ? setActiveCursor(
                                                          paginationMeta?.prev_cursor
                                                      )
                                                    : setArchivedCursor(
                                                          paginationMeta?.prev_cursor
                                                      )
                                            }}
                                            fetchNextItems={() => {
                                                activeTab === 'active'
                                                    ? setActiveCursor(
                                                          paginationMeta?.next_cursor
                                                      )
                                                    : setArchivedCursor(
                                                          paginationMeta?.next_cursor
                                                      )
                                            }}
                                        />
                                    </>
                                )}
                            </Container>
                        )
                    )}
                </>
            )}
        </div>
    )
}
