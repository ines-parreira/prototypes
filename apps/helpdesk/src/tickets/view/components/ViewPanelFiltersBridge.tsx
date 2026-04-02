import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { getTicketsListQueryKey } from '@repo/tickets/ticket-list'
import { useQueryClient } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import type { List } from 'immutable'
import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Icon,
    Menu,
    MenuItem,
    MultiButton,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { queryKeys } from '@gorgias/helpdesk-queries'

import * as viewsConfig from 'config/views'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { JobType } from 'models/job/types'
import type { View } from 'models/view/types'
import { EntityType, ViewCategory, ViewVisibility } from 'models/view/types'
import ViewSharingButton from 'pages/common/components/ViewSharing/ViewSharingButton'
import { AddFilterDropdown } from 'pages/common/components/ViewTable/AddFilterDropdown'
import { getDefaultCustomFieldOperator } from 'pages/common/components/ViewTable/Filters/utils'
import ViewFilters from 'pages/common/components/ViewTable/Filters/ViewFilters'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from 'state/entities/views/actions'
import { getSchemas } from 'state/schemas/selectors'
import { activeViewIdSet } from 'state/ui/views/actions'
import {
    addFieldFilter,
    createJob,
    deleteView,
    resetView,
    setViewActive,
    setViewEditMode,
    submitView,
} from 'state/views/actions'
import {
    getActiveView,
    areFiltersValid as getAreFiltersValid,
    isDirty as getIsDirty,
    getPristineActiveView,
} from 'state/views/selectors'
import type { ViewImmutable } from 'state/views/types'
import { fieldPath, getDefaultOperator, slugify } from 'utils'

import css from './ViewPanelFiltersBridge.less'

type Props = {
    viewId: number
    isExpanded: boolean
    onExpandedChange: (isExpanded: boolean) => void
}

type SaveMenuButtonProps = Pick<
    ComponentProps<typeof Button>,
    'isDisabled' | 'size' | 'variant'
> & {
    onSaveAsNew: () => void
}

function SaveMenuButton({
    isDisabled,
    onSaveAsNew,
    size,
    variant,
}: SaveMenuButtonProps) {
    return (
        <Menu
            placement="bottom right"
            trigger={
                <Button
                    aria-label="More save actions"
                    isDisabled={isDisabled}
                    icon="arrow-chevron-down"
                    size={size}
                    variant={variant}
                />
            }
        >
            <MenuItem
                id="save-as-new"
                label="Save new view"
                onAction={onSaveAsNew}
            />
        </Menu>
    )
}

function isViewResponse(response: unknown): response is View {
    return (
        typeof response === 'object' &&
        response !== null &&
        'id' in response &&
        typeof response.id === 'number'
    )
}

export function ViewPanelFiltersBridge({
    viewId,
    isExpanded,
    onExpandedChange,
}: Props) {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const queryClient = useQueryClient()
    const filterMenuContainer =
        typeof document === 'undefined' ? undefined : document.body

    const activeView = useAppSelector(getActiveView)
    const pristineActiveView = useAppSelector(getPristineActiveView)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const isDirty = useAppSelector(getIsDirty)
    const schemas = useAppSelector(getSchemas)
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLaunchingExport, setIsLaunchingExport] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [viewName, setViewName] = useState(
        activeView.get('name', '') as string,
    )

    useEffect(() => {
        setViewName(activeView.get('name', '') as string)
    }, [activeView])

    const config = useMemo(
        () => viewsConfig.getConfigByName(EntityType.Ticket),
        [],
    )

    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: 'Ticket',
    })

    const activeCustomFields = useMemo(
        () =>
            customFields.data?.data.filter(
                (field) => !field.deactivated_datetime,
            ) || [],
        [customFields.data?.data],
    )

    const firstCustomField = activeCustomFields[0]

    const filterableFields = useMemo(
        () =>
            (config.get('fields') as List<Map<string, unknown>>)
                .filter((field?: Map<string, unknown>) => {
                    if (!field) {
                        return false
                    }

                    const filterConfig = field.get('filter')
                    if (!filterConfig) {
                        return false
                    }

                    return !(field.get('name') === 'feedback' && !hasAutomate)
                })
                .sortBy((field?: Map<string, unknown>) => field?.get('title')),
        [config, hasAutomate],
    )

    const isSystemView = activeView.get('category') === ViewCategory.System
    const isExistingView = !!activeView.get('id')
    const isViewNameValid = viewName.trim().length > 0
    const isSaveDisabled =
        isSubmitting || !areFiltersValid || !isViewNameValid || isSystemView
    const canExportTickets = isExistingView

    const refreshViewData = useCallback(
        async (targetViewId: number = viewId) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: queryKeys.views.all(),
                }),
                queryClient.invalidateQueries({
                    queryKey: getTicketsListQueryKey(targetViewId),
                }),
            ])
        },
        [queryClient, viewId],
    )

    const buildViewPayload = useCallback(
        (source = activeView) => {
            let nextView = source
                .set('name', viewName.trim())
                .set('slug', slugify(viewName.trim()))

            if (nextView.get('visibility') === ViewVisibility.Private) {
                nextView = nextView.set('shared_with_users', [
                    currentUser.get('id'),
                ])
            }

            if (nextView.get('visibility') === ViewVisibility.Shared) {
                nextView = nextView
                    .set(
                        'shared_with_users',
                        nextView
                            .get('shared_with_users', fromJS([]))
                            .map((user: any) =>
                                typeof user === 'number'
                                    ? user
                                    : user.get('id'),
                            ),
                    )
                    .set(
                        'shared_with_teams',
                        nextView
                            .get('shared_with_teams', fromJS([]))
                            .map((team: any) =>
                                typeof team === 'number'
                                    ? team
                                    : team.get('id'),
                            ),
                    )
            }

            return nextView
        },
        [activeView, currentUser, viewName],
    )

    const handleAddFilter = useCallback(
        (field: any) => {
            const path = fieldPath(field)
            const left = `${config.get('singular') as string}.${path}`
            const operator =
                path === 'custom_fields'
                    ? getDefaultCustomFieldOperator(schemas, firstCustomField)
                    : getDefaultOperator(left, schemas)

            if (!operator) {
                return
            }

            dispatch(
                addFieldFilter(field.toJS(), {
                    left,
                    operator,
                }),
            )
        },
        [config, dispatch, firstCustomField, schemas],
    )

    const handleExpandedChange = useCallback(
        (nextExpanded: boolean) => {
            if (nextExpanded) {
                dispatch(setViewEditMode(activeView))
            } else {
                setIsDeleteConfirmOpen(false)
            }

            onExpandedChange(nextExpanded)
        },
        [activeView, dispatch, onExpandedChange],
    )

    const handleCancel = useCallback(async () => {
        dispatch(resetView())
        setIsDeleteConfirmOpen(false)
        onExpandedChange(false)
        await refreshViewData()
    }, [dispatch, onExpandedChange, refreshViewData])

    const handleSave = useCallback(async () => {
        if (isSaveDisabled) {
            return
        }

        setIsSubmitting(true)
        try {
            const nextView = buildViewPayload()
            const response = await dispatch(submitView(nextView))

            if (!isViewResponse(response)) {
                return
            }

            dispatch(viewUpdated(response))
            dispatch(activeViewIdSet(response.id))
            dispatch(setViewActive(fromJS(response)))
            setIsDeleteConfirmOpen(false)
            await refreshViewData(response.id)
        } finally {
            setIsSubmitting(false)
        }
    }, [buildViewPayload, dispatch, isSaveDisabled, refreshViewData])

    const handleSaveAsNew = useCallback(async () => {
        if (isSaveDisabled) {
            return
        }

        setIsSubmitting(true)
        try {
            let nextView = buildViewPayload(activeView.delete('id'))

            if (pristineActiveView.get('name') === nextView.get('name')) {
                const copiedName = `(Copy) ${nextView.get('name') as string}`
                nextView = nextView
                    .set('name', copiedName)
                    .set('slug', slugify(copiedName))
            }

            const response = await dispatch(submitView(nextView))

            if (!isViewResponse(response)) {
                return
            }

            dispatch(viewCreated(response))
            dispatch(activeViewIdSet(response.id))
            dispatch(setViewActive(fromJS(response)))
            setIsDeleteConfirmOpen(false)
            onExpandedChange(false)
            await refreshViewData(response.id)
            history.push(`/app/views/${response.id}`)
        } finally {
            setIsSubmitting(false)
        }
    }, [
        activeView,
        buildViewPayload,
        dispatch,
        history,
        isSaveDisabled,
        onExpandedChange,
        pristineActiveView,
        refreshViewData,
    ])

    const handleDelete = useCallback(async () => {
        if (!isExistingView || isSystemView) {
            return
        }

        setIsSubmitting(true)
        try {
            const destinationView = await dispatch(deleteView(activeView))
            if (!Map.isMap(destinationView)) {
                return
            }

            const nextActiveView = destinationView as ViewImmutable
            const nextViewId = nextActiveView.get('id') as number

            dispatch(viewDeleted(activeView.get('id')))
            dispatch(activeViewIdSet(nextViewId))
            dispatch(setViewActive(nextActiveView))
            onExpandedChange(false)
            setIsDeleteConfirmOpen(false)
            await refreshViewData(nextViewId)
            history.push(`/app/views/${nextViewId}`)
        } finally {
            setIsSubmitting(false)
        }
    }, [
        activeView,
        dispatch,
        history,
        isExistingView,
        isSystemView,
        onExpandedChange,
        refreshViewData,
    ])

    const handleExportTickets = useCallback(async () => {
        if (!canExportTickets) {
            return
        }

        setIsLaunchingExport(true)
        try {
            logEvent(SegmentEvent.TicketExport, {
                type: 'views-export-button',
            })
            await dispatch(createJob(activeView, JobType.ExportTicket, {}))
        } finally {
            setIsLaunchingExport(false)
        }
    }, [activeView, canExportTickets, dispatch])

    if (activeView.isEmpty()) {
        return null
    }

    return (
        <div className={css.container}>
            <Disclosure
                isExpanded={isExpanded}
                onExpandedChange={handleExpandedChange}
            >
                <div className={css.header}>
                    <DisclosureHeader
                        title="Filters"
                        leadingSlot="slider-filter"
                        trailingSlot={({ isExpanded: disclosureExpanded }) => (
                            <Box alignItems="center" gap="sm">
                                {isDirty && !isExpanded && (
                                    <Text
                                        size="sm"
                                        color="content-neutral-secondary"
                                    >
                                        Live ticket updates are paused while
                                        filters are being edited
                                    </Text>
                                )}
                                <Icon
                                    name={
                                        disclosureExpanded
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    size="sm"
                                />
                            </Box>
                        )}
                    />
                </div>
                <div>
                    <DisclosurePanel>
                        <Box
                            className={css.panel}
                            flexDirection="column"
                            gap="md"
                            width="100%"
                        >
                            <Box flexDirection="column" gap="xxs" width="100%">
                                <Box
                                    flexDirection="row"
                                    alignItems="flex-end"
                                    justifyContent="space-between"
                                    gap="sm"
                                    width="100%"
                                    flexWrap="wrap"
                                >
                                    <Box width="40%">
                                        <TextField
                                            label="View name"
                                            value={viewName}
                                            onChange={setViewName}
                                            isDisabled={
                                                isSubmitting || isSystemView
                                            }
                                        />
                                    </Box>
                                    {isExistingView && (
                                        <Box
                                            flexDirection="row"
                                            alignItems="flex-end"
                                            gap="sm"
                                            flexWrap="wrap"
                                        >
                                            <Tooltip
                                                trigger={
                                                    <Button
                                                        variant="secondary"
                                                        aria-label="Export tickets"
                                                        icon="comm-share-i-os-export"
                                                        onClick={() => {
                                                            void handleExportTickets()
                                                        }}
                                                        isDisabled={
                                                            isLaunchingExport ||
                                                            !canExportTickets
                                                        }
                                                        isLoading={
                                                            isLaunchingExport
                                                        }
                                                    />
                                                }
                                            >
                                                <TooltipContent title="Export tickets" />
                                            </Tooltip>
                                            <ViewSharingButton
                                                view={activeView}
                                            />
                                        </Box>
                                    )}
                                </Box>
                                {!areFiltersValid && (
                                    <Text
                                        size="sm"
                                        color="content-error-default"
                                    >
                                        Fix incomplete filters before saving
                                        this view.
                                    </Text>
                                )}
                                {isSystemView && (
                                    <Text
                                        size="sm"
                                        color="content-neutral-secondary"
                                    >
                                        System views can be edited for
                                        previewing, but they cannot be saved.
                                    </Text>
                                )}
                            </Box>

                            <Box
                                className={css.filtersBody}
                                flexDirection="column"
                                gap="md"
                                width="100%"
                            >
                                <Box
                                    className={css.filtersRows}
                                    flexDirection="column"
                                    gap="sm"
                                    width="100%"
                                >
                                    <ViewFilters
                                        menuContainer={filterMenuContainer}
                                    />
                                </Box>
                                <div className={css.addFilter}>
                                    <AddFilterDropdown
                                        filterableFields={filterableFields}
                                        handleClickFilter={handleAddFilter}
                                    />
                                </div>
                            </Box>

                            <Box
                                className={css.footer}
                                flexDirection="column"
                                alignItems="stretch"
                                gap="sm"
                            >
                                {isDirty && (
                                    <Text
                                        size="sm"
                                        color="content-neutral-secondary"
                                    >
                                        Live ticket updates are paused while
                                        filters are being edited
                                    </Text>
                                )}
                                <Box
                                    flexDirection="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    gap="sm"
                                    flexWrap="wrap"
                                >
                                    <Box
                                        flexDirection="row"
                                        gap="sm"
                                        flexWrap="wrap"
                                    >
                                        <div className={css.saveActions}>
                                            <MultiButton>
                                                <Button
                                                    onClick={() => {
                                                        void handleSave()
                                                    }}
                                                    isLoading={isSubmitting}
                                                    isDisabled={
                                                        isSaveDisabled ||
                                                        !isExistingView
                                                    }
                                                >
                                                    Update view
                                                </Button>
                                                <SaveMenuButton
                                                    isDisabled={isSaveDisabled}
                                                    onSaveAsNew={
                                                        handleSaveAsNew
                                                    }
                                                />
                                            </MultiButton>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={handleCancel}
                                            isDisabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>

                                    <Box
                                        flexDirection="row"
                                        gap="sm"
                                        flexWrap="wrap"
                                    >
                                        {isDeleteConfirmOpen ? (
                                            <>
                                                <Button
                                                    intent="destructive"
                                                    variant="secondary"
                                                    onClick={handleDelete}
                                                    isLoading={isSubmitting}
                                                >
                                                    Confirm delete
                                                </Button>
                                                <Button
                                                    variant="tertiary"
                                                    onClick={() =>
                                                        setIsDeleteConfirmOpen(
                                                            false,
                                                        )
                                                    }
                                                    isDisabled={isSubmitting}
                                                >
                                                    Keep view
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                intent="destructive"
                                                variant="tertiary"
                                                onClick={() =>
                                                    setIsDeleteConfirmOpen(true)
                                                }
                                                isDisabled={
                                                    isSubmitting ||
                                                    !isExistingView ||
                                                    isSystemView
                                                }
                                            >
                                                Delete view
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </DisclosurePanel>
                </div>
            </Disclosure>
        </div>
    )
}
