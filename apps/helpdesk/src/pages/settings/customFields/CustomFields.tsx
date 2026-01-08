import { useState } from 'react'

import { useCallbackRef, useDebouncedValue, useTitle } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Container } from 'reactstrap'

import { Button } from '@gorgias/axiom'
import type { ListCustomFieldsParams } from '@gorgias/helpdesk-queries'

import { AI_MANAGED_TYPES, OBJECT_TYPE_SETTINGS } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useUpdateCustomFieldDefinitions } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinitions'
import type {
    CustomFieldAIManagedType,
    CustomFieldObjectTypes,
} from 'custom-fields/types'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Video from 'pages/common/components/Video/Video'
import List from 'pages/settings/customFields/components/List'
import settingsCss from 'pages/settings/settings.less'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import css from './CustomFields.less'

const EDUCATIONAL_CONTENT = {
    Ticket: {
        description:
            'Use Ticket Fields to track and report common ticket categories.',
        links: [
            {
                href: 'https://link.gorgias.com/gx3',
                text: 'How to set up Ticket Fields',
            },
            {
                href: 'http://link.gorgias.com/ticket-fields-playbook',
                text: 'Ticket Fields playbook',
            },
        ],
    },
    Customer: {
        description:
            'Use Customer Fields to capture consistent details about your customers.',
        links: [
            {
                href: 'https://docs.gorgias.com/en-US/create-and-manage-customer-fields-969165',
                text: 'Learn how to manage Customer Fields',
            },
        ],
    },
} as const

export default function CustomFields({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const customFieldLabel = OBJECT_TYPE_SETTINGS[objectType].LABEL
    const customFieldTitleLabel = OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
    const MAX_FIELDS = OBJECT_TYPE_SETTINGS[objectType].MAX_FIELDS
    useTitle(`${customFieldTitleLabel} fields`)
    const { activeTab } = useParams<{ activeTab: string }>()
    const [activeCursor, setActiveCursor] = useState<Maybe<string>>(null)
    const [archivedCursor, setArchivedCursor] = useState<Maybe<string>>(null)
    const [listingNode, setListingNode] = useCallbackRef()
    const [landingNode, setLandingNode] = useCallbackRef()

    useInjectStyleToCandu(listingNode)
    useInjectStyleToCandu(landingNode)

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, 300)

    const activeParams: ListCustomFieldsParams = {
        archived: false,
        object_type: objectType,
        cursor: activeCursor ?? undefined,
        search: debouncedSearch,
    }
    const {
        data: {
            data: activeFields = [],
            meta: activeFieldsPaginationMeta,
        } = {},
        isLoading: isLoadingActive,
    } = useCustomFieldDefinitions(activeParams)

    const { mutate: mutateCustomFieldPriorities } =
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
        cursor: archivedCursor ?? undefined,
        search: debouncedSearch || undefined,
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
    const customFieldsCountingTowardsTheLimit = activeFields.filter(
        (field) =>
            !field.managed_type ||
            !Object.values(AI_MANAGED_TYPES).includes(
                field.managed_type as CustomFieldAIManagedType,
            ),
    )

    const createFieldButton =
        customFieldsCountingTowardsTheLimit.length >= MAX_FIELDS ? (
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
                    <Container
                        fluid
                        className={classNames(
                            css.info,
                            settingsCss.pageContainer,
                        )}
                    >
                        <div
                            ref={setListingNode}
                            data-candu-id="custom-fields-listing-educational-material"
                            className="pr-4"
                        >
                            <p className="mb-3">
                                {EDUCATIONAL_CONTENT[objectType].description}
                            </p>
                            {EDUCATIONAL_CONTENT[objectType].links.map(
                                (link) => (
                                    <a
                                        key={link.href}
                                        className="d-block"
                                        href={link.href}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <i className="material-icons">
                                            menu_book
                                        </i>{' '}
                                        <span>{link.text}</span>
                                    </a>
                                ),
                            )}
                        </div>
                        <div className="d-flex">
                            <Video
                                legend="Setting up Fields in Gorgias"
                                videoURL="https://fast.wistia.net/embed/iframe/ufxg4vhwja"
                                previewURL="https://embed-ssl.wistia.com/deliveries/fd894e547dd8b4644c8be54a1932438e.jpg"
                            />
                        </div>
                    </Container>
                )}
                {shouldDisplayListingPage && (
                    <>
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
                                    {`You don't have any`}{' '}
                                    {activeTab === 'active'
                                        ? 'active'
                                        : 'archived'}{' '}
                                    {customFieldLabel} fields at the moment
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'active' &&
                                        customFieldsCountingTowardsTheLimit.length >=
                                            MAX_FIELDS && (
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
                                                      paginationMeta?.prev_cursor,
                                                  )
                                                : setArchivedCursor(
                                                      paginationMeta?.prev_cursor,
                                                  )
                                        }}
                                        fetchNextItems={() => {
                                            activeTab === 'active'
                                                ? setActiveCursor(
                                                      paginationMeta?.next_cursor,
                                                  )
                                                : setArchivedCursor(
                                                      paginationMeta?.next_cursor,
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
