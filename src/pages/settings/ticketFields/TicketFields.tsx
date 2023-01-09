import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useState} from 'react'
import {Container} from 'reactstrap'

import {Link, NavLink, useParams} from 'react-router-dom'
import {useHistory} from 'react-router'
import {FeatureFlagKey} from 'config/featureFlags'
import useTitle from 'hooks/useTitle'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import List from 'pages/settings/ticketFields/components/List'
import {getCustomFields} from 'models/customField/resources'
import {CursorMeta} from 'models/api/types'
import {CustomField} from 'models/customField/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Loader from 'pages/common/components/Loader/Loader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import css from './TicketFields.less'

export enum TicketFieldsTab {
    Active = 'active',
    Archived = 'archived',
}

export default function TicketFields() {
    useTitle('Ticket fields')
    const {activeTab} = useParams<{activeTab: string}>()
    const dispatch = useAppDispatch()
    const history = useHistory()

    const [isLoadingActive, setLoadingActive] = useState(true)
    const [isLoadingArchived, setLoadingArchived] = useState(true)

    const [activeTicketFields, setActiveTicketFields] = useState<CustomField[]>(
        []
    )
    const [activePaginationMeta, setActivePaginationMeta] =
        useState<CursorMeta | null>(null)

    const [archivedTicketFields, setArchivedTicketFields] = useState<
        CustomField[]
    >([])
    const [archivedPaginationMeta, setArchivedPaginationMeta] =
        useState<CursorMeta | null>(null)

    const [hasTicketFields, setHasTicketFields] = useState(
        activeTicketFields.length > 0 || archivedTicketFields.length > 0
    )

    const handleGetCustomFields = useCallback(
        async (archived: boolean, cursor?: string) => {
            if (archived) {
                setLoadingArchived(true)
            } else {
                setLoadingActive(true)
            }
            try {
                const {data, meta} = await getCustomFields({
                    archived,
                    object_type: 'Ticket',
                    cursor: cursor,
                })

                if (!hasTicketFields && data.length) {
                    setHasTicketFields(true)
                }

                if (archived) {
                    setArchivedTicketFields(data)
                    setArchivedPaginationMeta(meta)
                } else {
                    setActiveTicketFields(data)
                    setActivePaginationMeta(meta)
                }
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch ticket custom fields list',
                        status: NotificationStatus.Error,
                    })
                )
            } finally {
                if (archived) {
                    setLoadingArchived(false)
                } else {
                    setLoadingActive(false)
                }
            }
        },
        [dispatch, hasTicketFields]
    )

    useEffect(() => {
        async function initialFetch() {
            await handleGetCustomFields(false)
            await handleGetCustomFields(true)
        }

        // Limit fetch when switching tabs
        if (hasTicketFields) {
            if (activeTab === TicketFieldsTab.Active) {
                return void handleGetCustomFields(false)
            }
            if (activeTab === TicketFieldsTab.Archived) {
                return void handleGetCustomFields(true)
            }
        }
        // we need to load both active and archived custom fields here
        // in order to display the appropriate component if they don't have
        // any ticket fields defined
        return void initialFetch()
        // We do 1 additional unnecessary call at first render because of dependencies
        // Can be fixed by using caching techniques
    }, [activeTab, handleGetCustomFields, hasTicketFields])

    // Only show this page if the ticket fields feature flag is on
    const ticketFieldsEnabled = useFlags()[FeatureFlagKey.TicketFields]
    if (!ticketFieldsEnabled) {
        return null
    }

    const renderListByTab = () => {
        let ticketFields: CustomField[] = []
        let paginationMeta: CursorMeta | null = null
        let isArchived = false

        if (activeTab === TicketFieldsTab.Active) {
            ticketFields = activeTicketFields
            paginationMeta = activePaginationMeta
        }

        if (activeTab === TicketFieldsTab.Archived) {
            isArchived = true
            ticketFields = archivedTicketFields
            paginationMeta = archivedPaginationMeta
        }

        if (ticketFields.length === 0) {
            return null
        }

        return (
            <>
                <List
                    ticketFields={ticketFields}
                    onFieldChange={() => {
                        void handleGetCustomFields(false)
                        void handleGetCustomFields(true)
                    }}
                ></List>
                <Navigation
                    className={css.navigation}
                    hasNextItems={!!paginationMeta?.next_cursor}
                    hasPrevItems={!!paginationMeta?.prev_cursor}
                    fetchNextItems={() => {
                        paginationMeta?.next_cursor &&
                            handleGetCustomFields(
                                isArchived,
                                paginationMeta.next_cursor
                            )
                    }}
                    fetchPrevItems={() => {
                        paginationMeta?.prev_cursor &&
                            handleGetCustomFields(
                                isArchived,
                                paginationMeta.prev_cursor
                            )
                    }}
                />
            </>
        )
    }

    return (
        <div className={`full-width overflow-auto ${css.pageContainer}`}>
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Ticket Fields">
                    <div className={css.headerContainer}>
                        {hasTicketFields && (
                            <Link to="/app/settings/ticket-fields/add">
                                <Button className="float-right">
                                    Create Field
                                </Button>
                            </Link>
                        )}
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

            {(isLoadingActive || isLoadingArchived) && (
                <Loader minHeight="60px" />
            )}

            {!(isLoadingActive || isLoadingArchived) && (
                <>
                    {activeTicketFields.length === 0 &&
                        archivedTicketFields.length === 0 && (
                            <div className={css.emptyViewContainer}>
                                <h2 className={css.emptyViewContainerHeader}>
                                    Get started with Ticket Fields
                                </h2>
                                <p className={css.emptyViewContainerText}>
                                    Set up custom fields to make sure your team
                                    handle tickets efficiently and consistently.
                                    You can create a custom field to track the
                                    contact reason, product or even the
                                    resolution provided in the ticket.
                                </p>
                                <Button
                                    className="mt-2"
                                    onClick={() =>
                                        history.push(
                                            '/app/settings/ticket-fields/add'
                                        )
                                    }
                                >
                                    Create Field
                                </Button>
                            </div>
                        )}
                    {(activeTicketFields.length > 0 ||
                        archivedTicketFields.length > 0) && (
                        <Container fluid className="p-0">
                            {activeTicketFields.length === 0 &&
                                archivedTicketFields.length > 0 &&
                                activeTab === TicketFieldsTab.Active && (
                                    <div className={css.emptyListTextWrapper}>
                                        You don't have any active ticket fields
                                        at the moment
                                    </div>
                                )}
                            {activeTicketFields.length > 0 &&
                                archivedTicketFields.length === 0 &&
                                activeTab === TicketFieldsTab.Archived && (
                                    <div className={css.emptyListTextWrapper}>
                                        You don't have any archived ticket
                                        fields at the moment
                                    </div>
                                )}

                            {renderListByTab()}
                        </Container>
                    )}
                </>
            )}
        </div>
    )
}
