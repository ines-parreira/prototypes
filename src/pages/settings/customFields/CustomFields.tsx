import React, {useState} from 'react'
import {Link, NavLink, useParams} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {OBJECT_TYPE_SETTINGS} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {useUpdateCustomFieldDefinitions} from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinitions'
import {CustomFieldObjectTypes, ListParams} from 'custom-fields/types'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useTitle from 'hooks/useTitle'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import List from 'pages/settings/customFields/components/List'

import {CUSTOM_FIELD_ROUTES} from 'routes/constants'

import css from './CustomFields.less'

export default function CustomFields({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const customFieldLabel = OBJECT_TYPE_SETTINGS[objectType].LABEL
    const customFieldTitleLabel = OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
    const MAX_FIELDS = OBJECT_TYPE_SETTINGS[objectType].MAX_FIELDS
    useTitle(`${customFieldTitleLabel} fields`)
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
        object_type: objectType,
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
        object_type: objectType,
        cursor: archivedCursor,
        search: debouncedSearch,
    })

    const customFields = activeTab === 'active' ? activeFields : archivedFields

    const paginationMeta =
        activeTab === 'active'
            ? activeFieldsPaginationMeta
            : archivedFieldsPaginationMeta

    const hasActiveFields = activeFields.length > 0
    const hasArchivedFields = archivedFields.length > 0
    const hasFieldInCurrentTab =
        activeTab === 'active' ? hasActiveFields : hasArchivedFields

    const hasCustomFields = hasActiveFields || hasArchivedFields
    const shouldDisplayListingPage = hasCustomFields || debouncedSearch
    const isLoading = isLoadingActive || isLoadingArchived

    const createFieldButton =
        activeFields.length >= MAX_FIELDS ? (
            <Button isDisabled>Create Field</Button>
        ) : (
            <Link
                to={`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/add`}
                onClick={() => {
                    logEvent(SegmentEvent.CustomFieldCreateFieldClicked, {
                        objectType,
                    })
                }}
            >
                <Button>Create Field</Button>
            </Link>
        )

    return (
        <div className={`full-width overflow-auto ${css.pageContainer}`}>
            <div className={css.pageHeaderContainer}>
                <PageHeader title={`${customFieldTitleLabel} Fields`}>
                    <div className={css.headerContainer}>
                        {shouldDisplayListingPage && (
                            <>
                                <Search
                                    id="custom-fields-search"
                                    name="custom-fields-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder={`Search ${customFieldLabel} fields...`}
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
                            data-candu-id="custom-fields-listing-educational-material"
                        />
                        <SecondaryNavbar>
                            <NavLink
                                to={`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/active`}
                                exact
                            >
                                Active
                            </NavLink>
                            <NavLink
                                to={`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/archived`}
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
                                Get started with {customFieldTitleLabel} Fields
                            </h2>
                            <p className={css.emptyViewContainerText}>
                                Create custom fields to track and report common{' '}
                                {customFieldLabel} categories.
                            </p>
                            <div
                                ref={setLandingNode}
                                data-candu-id="custom-fields-landing-educational-material"
                            />
                            {createFieldButton}
                        </div>
                    ) : (
                        <div className="p-0">
                            {debouncedSearch && !hasFieldInCurrentTab ? (
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
                                    {customFieldLabel} fields at the moment
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'active' &&
                                        activeFields.length >= MAX_FIELDS && (
                                            <Alert
                                                type={AlertType.Info}
                                                icon
                                                className="m-4"
                                            >
                                                {`You can only have ${MAX_FIELDS}
                                                 active fields
                                                at a time. Please archive some
                                                fields before creating a new
                                                one.`}
                                            </Alert>
                                        )}
                                    <List
                                        customFields={customFields}
                                        canReorder={
                                            !debouncedSearch &&
                                            activeTab !== 'archived' &&
                                            customFields.length > 1
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
