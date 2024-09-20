import React, {useState} from 'react'
import {Link, NavLink, useParams} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import useTitle from 'hooks/useTitle'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {useUpdateCustomFieldDefinitions} from 'hooks/customField/useUpdateCustomFieldDefinitions'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import List from 'pages/settings/customFields/components/List'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Loader from 'pages/common/components/Loader/Loader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Search from 'pages/common/components/Search'
import {ListParams} from 'models/customField/types'
import useCallbackRef from 'hooks/useCallbackRef'
import useDebouncedValue from 'hooks/useDebouncedValue'

import css from './CustomFields.less'

const MAX_TICKET_FIELDS = 25

export default function CustomFields() {
    useTitle('Ticket fields')
    const {activeTab} = useParams<{activeTab: string}>()
    const [activeCursor, setActiveCursor] = useState<Maybe<string>>(null)
    const [archivedCursor, setArchivedCursor] = useState<Maybe<string>>(null)
    const [listingNode, setListingNode] = useCallbackRef()
    const [landingNode, setLandingNode] = useCallbackRef()

    useInjectStyleToCandu(listingNode)
    useInjectStyleToCandu(landingNode)

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, 300)

    const activeParams: ListParams = {
        archived: false,
        object_type: 'Ticket',
        cursor: activeCursor,
        search: debouncedSearch,
    }
    const {
        data: {data: activeFields = [], meta: activeFieldsPaginationMeta} = {},
        isLoading: isLoadingActive,
    } = useCustomFieldDefinitions(activeParams)

    const {mutate: mutateCustomFieldPriorities} =
        useUpdateCustomFieldDefinitions(activeParams)

    const {
        data: {
            data: archivedFields = [],
            meta: archivedFieldsPaginationMeta,
        } = {},
        isLoading: isLoadingArchived,
    } = useCustomFieldDefinitions({
        archived: true,
        object_type: 'Ticket',
        cursor: archivedCursor,
        search: debouncedSearch,
    })

    const ticketFields = activeTab === 'active' ? activeFields : archivedFields

    const paginationMeta =
        activeTab === 'active'
            ? activeFieldsPaginationMeta
            : archivedFieldsPaginationMeta

    const hasActiveFields = activeFields.length > 0
    const hasArchivedFields = archivedFields.length > 0

    const hasCustomFields = hasActiveFields || hasArchivedFields
    const shouldDisplayListingPage = hasCustomFields || debouncedSearch
    const isLoading = isLoadingActive || isLoadingArchived

    const createFieldButton =
        activeFields.length >= MAX_TICKET_FIELDS ? (
            <Button isDisabled>Create Field</Button>
        ) : (
            <Link
                to="/app/settings/ticket-fields/add"
                onClick={() =>
                    logEvent(SegmentEvent.CustomFieldTicketCreateFieldClicked)
                }
            >
                <Button>Create Field</Button>
            </Link>
        )

    return (
        <div className={`full-width overflow-auto ${css.pageContainer}`}>
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Ticket Fields">
                    <div className={css.headerContainer}>
                        {shouldDisplayListingPage && (
                            <>
                                <Search
                                    id="custom-fields-search"
                                    name="custom-fields-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search ticket fields..."
                                    className="mr-2"
                                />
                                {createFieldButton}
                            </>
                        )}
                    </div>
                </PageHeader>
                {shouldDisplayListingPage && (
                    <>
                        <div
                            ref={setListingNode}
                            data-candu-id="ticket-fields-listing-educational-material"
                        />
                        <SecondaryNavbar>
                            <NavLink
                                to="/app/settings/ticket-fields/active"
                                exact
                            >
                                Active
                            </NavLink>
                            <NavLink
                                to="/app/settings/ticket-fields/archived"
                                exact
                            >
                                Archived
                            </NavLink>
                        </SecondaryNavbar>
                    </>
                )}
            </div>

            {isLoading ? (
                <Loader minHeight="60px" />
            ) : (
                <>
                    {!shouldDisplayListingPage ? (
                        <div className={css.emptyViewContainer}>
                            <h2 className={css.emptyViewContainerHeader}>
                                Get started with Ticket Fields
                            </h2>
                            <p className={css.emptyViewContainerText}>
                                Create custom fields to track and report common
                                ticket categories.
                            </p>
                            <div
                                ref={setLandingNode}
                                data-candu-id="ticket-fields-landing-educational-material"
                            />
                            {createFieldButton}
                        </div>
                    ) : (
                        <div className="p-0">
                            {debouncedSearch && !hasActiveFields ? (
                                <div className={css.emptyListTextWrapper}>
                                    No results found.
                                </div>
                            ) : (activeTab === 'active' && !hasActiveFields) ||
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
                                        activeFields.length >=
                                            MAX_TICKET_FIELDS && (
                                            <Alert
                                                type={AlertType.Info}
                                                icon
                                                className="m-4"
                                            >
                                                {`You can only have ${MAX_TICKET_FIELDS}
                                                 active fields
                                                at a time. Please archive some
                                                fields before creating a new
                                                one.`}
                                            </Alert>
                                        )}
                                    <List
                                        ticketFields={ticketFields}
                                        canReorder={
                                            !debouncedSearch &&
                                            activeTab !== 'archived' &&
                                            ticketFields.length > 1
                                        }
                                        onReorder={mutateCustomFieldPriorities}
                                    />
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
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
