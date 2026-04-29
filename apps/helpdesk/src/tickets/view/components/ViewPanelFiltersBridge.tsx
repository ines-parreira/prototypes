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
    Icon,
    Menu,
    MenuItem,
    Modal,
    ModalSize,
    MultiButton,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { ViewField } from '@gorgias/helpdesk-types'

import * as viewsConfig from 'config/views'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { JobType } from 'models/job/types'
import type { View } from 'models/view/types'
import {
    EntityType,
    ViewCategory,
    ViewType,
    ViewVisibility,
} from 'models/view/types'
import ViewSharingButton from 'pages/common/components/ViewSharing/ViewSharingButton'
import { AddFilterDropdown } from 'pages/common/components/ViewTable/AddFilterDropdown'
import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import { getDefaultCustomFieldOperator } from 'pages/common/components/ViewTable/Filters/utils'
import ViewFilters from 'pages/common/components/ViewTable/Filters/ViewFilters'
import { useSplitTicketView } from 'split-ticket-view-toggle'
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
    submitView,
    updateView,
} from 'state/views/actions'
import {
    getActiveView,
    areFiltersValid as getAreFiltersValid,
    isDirty as getIsDirty,
    getLastViewId,
    getPristineActiveView,
    getViewIdToDisplay,
} from 'state/views/selectors'
import type { ViewImmutable } from 'state/views/types'
import { fieldPath, getDefaultOperator, slugify } from 'utils'

import css from './ViewPanelFiltersBridge.less'

type Props = {
    viewId: number
    draftFields?: ViewField[]
    onExpandedChange: (isExpanded: boolean) => void
    isExpanded?: boolean
    hideViewNameInput?: boolean
    hideFooterActions?: boolean
    isSearchMode?: boolean
    searchResultCount?: number
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
    draftFields,
    onExpandedChange,
    isExpanded = true,
    hideViewNameInput = false,
    hideFooterActions = false,
    isSearchMode = false,
    searchResultCount,
}: Props) {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { setIsEnabled } = useSplitTicketView()
    const queryClient = useQueryClient()
    const filterMenuContainer =
        typeof document === 'undefined' ? undefined : document.body

    const activeView = useAppSelector(getActiveView)
    const pristineActiveView = useAppSelector(getPristineActiveView)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const isDirty = useAppSelector(getIsDirty)
    const lastViewId = useAppSelector(getLastViewId)
    const suggestedPreviousViewId = useAppSelector((state) =>
        getViewIdToDisplay(state)(ViewType.TicketList, lastViewId?.toString()),
    )
    const schemas = useAppSelector(getSchemas)
    const currentUser = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLaunchingExport, setIsLaunchingExport] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isSharedUpdateConfirmOpen, setIsSharedUpdateConfirmOpen] =
        useState(false)
    const activeViewName = activeView.get('name', '') as string
    const activeViewEmoji = activeView.getIn(
        ['decoration', 'emoji'],
        '',
    ) as string
    const [viewName, setViewName] = useState(activeViewName)

    const activeViewId = activeView.get('id')

    useEffect(() => {
        setViewName(activeViewName)
    }, [activeViewId, activeViewName])

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
    const isNonPrivateView =
        activeView.get('visibility') !== ViewVisibility.Private
    const isViewNameValid = viewName.trim().length > 0
    const invalidFiltersMessage =
        'Fix incomplete filters before saving this view.'
    const isSaveDisabled = isSubmitting || !areFiltersValid || !isViewNameValid
    const canExportTickets = isExistingView
    const totalSearchResources = searchResultCount
    const searchResultCountLabel =
        totalSearchResources == null
            ? null
            : `${totalSearchResources >= 5000 ? '5000+' : totalSearchResources} ${totalSearchResources === 1 ? 'ticket' : 'tickets'}`

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

            if (draftFields !== undefined) {
                nextView = nextView.set('fields', fromJS(draftFields))
            }

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
        [activeView, currentUser, draftFields, viewName],
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

    const handleCancel = useCallback(async () => {
        if (!isExistingView) {
            dispatch(activeViewIdSet(suggestedPreviousViewId))
            history.push(`/app/tickets/${suggestedPreviousViewId || ''}`)
            return
        }

        dispatch(resetView())
        setIsDeleteConfirmOpen(false)
        setIsSharedUpdateConfirmOpen(false)
        onExpandedChange(false)
        await refreshViewData()
    }, [
        dispatch,
        history,
        isExistingView,
        onExpandedChange,
        refreshViewData,
        suggestedPreviousViewId,
    ])

    const handleSave = useCallback(async () => {
        if (isSaveDisabled || isSystemView) {
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
            setIsSharedUpdateConfirmOpen(false)
            await refreshViewData(response.id)
        } finally {
            setIsSubmitting(false)
        }
    }, [
        buildViewPayload,
        dispatch,
        isSaveDisabled,
        isSystemView,
        refreshViewData,
    ])

    const handleSaveAsNew = useCallback(async () => {
        if (isSaveDisabled || isSystemView) {
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
            setIsSharedUpdateConfirmOpen(false)
            onExpandedChange(false)
            await refreshViewData(response.id)
            if (!isExistingView) {
                setIsEnabled(false)
                history.push(`/app/tickets/${response.id}`)
                return
            }
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
        isExistingView,
        isSystemView,
        onExpandedChange,
        pristineActiveView,
        refreshViewData,
        setIsEnabled,
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

    const handleUpdateClick = useCallback(() => {
        if (isExistingView && isNonPrivateView) {
            setIsSharedUpdateConfirmOpen(true)
            return
        }

        void handleSave()
    }, [handleSave, isExistingView, isNonPrivateView])

    if (activeView.isEmpty()) {
        return null
    }

    const statusLabel = searchResultCountLabel
        ? searchResultCountLabel
        : !isSearchMode && isDirty
          ? 'Live ticket updates are paused while filters are being edited'
          : null

    return (
        <div className={css.container}>
            {statusLabel && (
                <Box px="lg" pb="xs">
                    <Text size="sm" color="content-neutral-secondary">
                        {statusLabel}
                    </Text>
                </Box>
            )}
            {isExpanded && (
                <Box
                    className={css.panel}
                    flexDirection="column"
                    gap="md"
                    width="100%"
                >
                    {!hideViewNameInput && (
                        <Box flexDirection="column" gap="xs" width="100%">
                            <Box width="40%">
                                <TextField
                                    label="View name"
                                    value={viewName}
                                    onChange={setViewName}
                                    isDisabled={isSubmitting || isSystemView}
                                    leadingSlot={
                                        <EmojiSelect
                                            container={filterMenuContainer}
                                            emoji={activeViewEmoji || null}
                                            triggerMode="axiom-button"
                                            onEmojiSelect={(emoji) => {
                                                dispatch(
                                                    updateView(
                                                        activeView.mergeDeep({
                                                            decoration: {
                                                                emoji,
                                                            },
                                                        }),
                                                    ),
                                                )
                                            }}
                                            onEmojiClear={() => {
                                                if (
                                                    activeView.get('decoration')
                                                ) {
                                                    dispatch(
                                                        updateView(
                                                            activeView.deleteIn(
                                                                [
                                                                    'decoration',
                                                                    'emoji',
                                                                ],
                                                            ),
                                                        ),
                                                    )
                                                }
                                            }}
                                        />
                                    }
                                />
                            </Box>
                        </Box>
                    )}
                    <Box
                        className={css.filtersBody}
                        flexDirection="column"
                        gap="xs"
                        width="100%"
                    >
                        <Box
                            className={css.filtersRows}
                            flexDirection="column"
                            gap="xs"
                            width="100%"
                        >
                            <ViewFilters menuContainer={filterMenuContainer} />
                        </Box>
                        <div className={css.addFilter}>
                            <AddFilterDropdown
                                filterableFields={filterableFields}
                                handleClickFilter={handleAddFilter}
                            />
                        </div>
                    </Box>
                </Box>
            )}
            {isExpanded && !hideFooterActions && (
                <Box
                    className={css.footer}
                    flexDirection="column"
                    alignItems="stretch"
                    gap="xs"
                >
                    <Box
                        className={css.footerActions}
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="xs"
                        flexWrap="wrap"
                    >
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="xs"
                            flexWrap="wrap"
                        >
                            {isSystemView && isExistingView ? (
                                <Text
                                    size="sm"
                                    color="content-neutral-secondary"
                                >
                                    This view cannot be saved.
                                </Text>
                            ) : (
                                <Tooltip
                                    isDisabled={
                                        !isSaveDisabled || areFiltersValid
                                    }
                                    trigger={
                                        <div className={css.saveActions}>
                                            {isExistingView ? (
                                                <MultiButton>
                                                    <Button
                                                        onClick={
                                                            handleUpdateClick
                                                        }
                                                        isLoading={isSubmitting}
                                                        isDisabled={
                                                            isSaveDisabled ||
                                                            !isExistingView
                                                        }
                                                    >
                                                        Update view
                                                    </Button>
                                                    <SaveMenuButton
                                                        isDisabled={
                                                            isSaveDisabled
                                                        }
                                                        onSaveAsNew={
                                                            handleSaveAsNew
                                                        }
                                                    />
                                                </MultiButton>
                                            ) : (
                                                <Button
                                                    onClick={() => {
                                                        void handleSaveAsNew()
                                                    }}
                                                    isLoading={isSubmitting}
                                                    isDisabled={isSaveDisabled}
                                                >
                                                    Create view
                                                </Button>
                                            )}
                                        </div>
                                    }
                                >
                                    <TooltipContent
                                        title={invalidFiltersMessage}
                                    />
                                </Tooltip>
                            )}
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
                            alignItems="center"
                            gap="xs"
                            flexWrap="wrap"
                        >
                            {isExistingView && (
                                <>
                                    <Button
                                        variant="secondary"
                                        leadingSlot={
                                            <Icon name="comm-share-i-os-export" />
                                        }
                                        onClick={() => {
                                            void handleExportTickets()
                                        }}
                                        isDisabled={
                                            isLaunchingExport ||
                                            !canExportTickets
                                        }
                                        isLoading={isLaunchingExport}
                                    >
                                        Export tickets
                                    </Button>
                                    <ViewSharingButton view={activeView} />
                                </>
                            )}
                            {isExistingView && !isSystemView && (
                                <Button
                                    intent="destructive"
                                    variant="primary"
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    isDisabled={isSubmitting || !isExistingView}
                                >
                                    Delete
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
            <Modal
                size={ModalSize.Sm}
                isOpen={isSharedUpdateConfirmOpen}
                onOpenChange={setIsSharedUpdateConfirmOpen}
            >
                <OverlayHeader title="Are you sure?" />
                <OverlayContent>
                    <Text>You are about to edit this view for all users.</Text>
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <Box gap="xs" width="100%" justifyContent="flex-end">
                        <Button
                            variant="tertiary"
                            onClick={() => setIsSharedUpdateConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                void handleSave()
                            }}
                            isLoading={isSubmitting}
                        >
                            Confirm
                        </Button>
                    </Box>
                </OverlayFooter>
            </Modal>
            <Modal
                size={ModalSize.Sm}
                isOpen={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
            >
                <OverlayHeader title="Are you sure?" />
                <OverlayContent>
                    <Text>
                        {isNonPrivateView
                            ? 'You are about to delete this view for all users.'
                            : 'You are about to delete this view.'}
                    </Text>
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <Box gap="xs" width="100%" justifyContent="flex-end">
                        <Button
                            variant="tertiary"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="destructive"
                            onClick={() => {
                                void handleDelete()
                            }}
                            isLoading={isSubmitting}
                        >
                            Confirm
                        </Button>
                    </Box>
                </OverlayFooter>
            </Modal>
        </div>
    )
}
