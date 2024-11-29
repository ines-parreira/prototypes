import {Card} from '@gorgias/analytics-ui-kit'
import {
    useCreateAnalyticsFilter,
    useDeleteAnalyticsFilter,
    useListAnalyticsFilters,
    useUpdateAnalyticsFilter,
} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import classnames from 'classnames'
import React, {useCallback, useMemo, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {isGorgiasApiError} from 'models/api/types'
import {
    SavedFilter,
    SavedFilterAPI,
    SavedFilterDraft,
    StaticFilter,
} from 'models/stat/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'
import {ConfirmationModal} from 'pages/settings/helpCenter/components/ConfirmationModal'
import {FiltersEditableTitle} from 'pages/stats/common/filters/FiltersEditableTitle/FiltersEditableTitle'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {FiltersPanelWithSavedFiltersState} from 'pages/stats/common/filters/FiltersPanelWithSavedFiltersState'
import {
    fromApiFormatted,
    toApiFormatted,
} from 'pages/stats/common/filters/helpers'
import {SavedFilterMenu} from 'pages/stats/common/filters/SavedFilterMenu'
import css from 'pages/stats/common/filters/SavedFiltersPanel.less'
import {areFiltersApplicable} from 'pages/stats/common/filters/utils'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    applySavedFilter,
    clearSavedFilterDraft,
    duplicateSavedFilterDraftFromSavedFilter,
    getCanSaveFilter,
    getIsSavedFilterApplied,
    getSavedFilterDraft,
    initialiseSavedFilterDraftFromSavedFilter,
    unapplySavedFilter,
    updateSavedFilterDraftName,
} from 'state/ui/stats/filtersSlice'
import {isAdmin} from 'utils'

export const FILTER_SAVED_MESSAGE = 'Filter successfully saved!'
export const FILTER_SAVED_ERROR_MESSAGE = 'Filter not saved!'
export const FILTER_DELETED_MESSAGE = 'Filter successfully deleted!'
export const FILTER_DELETED_ERROR_MESSAGE = 'Filter not deleted!'

export const SAVE_BUTTON_LABEL = 'Save'
export const CANCEL_BUTTON_LABEL = 'Cancel'
export const DELETE_CONFIRMATION_BUTTON_LABEL = 'Delete'
export const COLLAPSE_OPEN_ICON = 'arrow_drop_down'
export const COLLAPSE_CLOSED_ICON = 'arrow_right'
export const UNAPPLY_FILTER_ICON = 'close'

export const DUPLICATE_FILTER_ACTION_LABEL = 'Duplicate Filter'
export const DELETE_FILTER_ACTION_LABEL = 'Delete Filter'

export const SAVED_FILTER_NAME_FIELD_KEY = 'name'
export const SAVED_FILTER_FIELD_GROUP_FIELD_KEY = 'field_group'

type SavedFiltersError = {
    [SAVED_FILTER_NAME_FIELD_KEY]?: string[]
    [SAVED_FILTER_FIELD_GROUP_FIELD_KEY]?: unknown
}

export const isSavedFiltersError = (
    data: unknown
): data is SavedFiltersError => {
    return (
        data !== null &&
        typeof data === 'object' &&
        Object.keys(data).some(
            (key) =>
                key === SAVED_FILTER_NAME_FIELD_KEY ||
                key === SAVED_FILTER_FIELD_GROUP_FIELD_KEY
        )
    )
}

export const getDeleteConfirmationTitle = (savedFilterName: string) =>
    `Delete ${savedFilterName}?`
const getDeleteConfirmationContent = (savedFilterName: string) =>
    `Deleting ${savedFilterName} will remove it from Saved Filters for all users. This action cannot be undone.`

const isSavedFilter = (
    savedFilter: SavedFilterDraft | SavedFilter | null
): savedFilter is SavedFilter =>
    savedFilter !== null && 'id' in savedFilter && savedFilter.id !== undefined

type Props = {
    persistentFilters?: StaticFilter[]
    optionalFilters: OptionalFilter[]
}

export const SavedFiltersPanel = ({
    optionalFilters,
    persistentFilters,
}: Props) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const savedFilterDraft = useAppSelector(getSavedFilterDraft)
    const currentUser = useAppSelector(getCurrentUser)
    const savedFilter = isSavedFilter(savedFilterDraft)
        ? savedFilterDraft
        : null
    const isSavedFilterApplied = useAppSelector(getIsSavedFilterApplied)
    const canSaveFilter = useAppSelector(getCanSaveFilter)
    const isEditingSavedFilterDraft =
        savedFilterDraft !== null && !isSavedFilterApplied

    const [isEditMode, setIsEditMode] = useState(isEditingSavedFilterDraft)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(
        undefined
    )
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false)
    const toggleIsEditMode = () => {
        setIsEditMode(!isEditMode)
    }

    const mutationConfig = {
        mutation: {
            onSuccess: () => {
                void queryClient.invalidateQueries({queryKey: ['savedFilters']})
            },
        },
    }

    const savedFilters = useListAnalyticsFilters()
    const originalSavedFilter =
        savedFilter !== null
            ? savedFilters.data?.data.data.find((f) => f.id === savedFilter.id)
            : null
    const createMutation = useCreateAnalyticsFilter(mutationConfig)
    const updateMutation = useUpdateAnalyticsFilter(mutationConfig)
    const deleteMutation = useDeleteAnalyticsFilter(mutationConfig)

    const titleOnChangeHandler = (name: string) => {
        dispatch(updateSavedFilterDraftName(name))
        setErrorMessage(undefined)
    }

    const cancelHandler = useCallback(() => {
        if (isEditingSavedFilterDraft) {
            dispatch(clearSavedFilterDraft())
        } else if (originalSavedFilter) {
            dispatch(
                initialiseSavedFilterDraftFromSavedFilter(
                    fromApiFormatted(originalSavedFilter as SavedFilterAPI)
                )
            )
        }
        setIsEditMode(false)
        setErrorMessage(undefined)
    }, [dispatch, isEditingSavedFilterDraft, originalSavedFilter])

    const unApplyFilterHandler = () => {
        dispatch(unapplySavedFilter())
        setErrorMessage(undefined)
    }

    const isCurrentUserAnAdmin = useMemo(
        () => isAdmin(currentUser),
        [currentUser]
    )

    const saveHandler = useCallback(
        (filter: SavedFilter | SavedFilterDraft) => {
            if (isSavedFilter(filter)) {
                updateMutation
                    .mutateAsync({
                        id: filter.id,
                        data: {
                            name: filter.name,
                            filter_group: toApiFormatted(filter.filter_group),
                        },
                    })
                    .then((res) => {
                        dispatch(
                            applySavedFilter(
                                fromApiFormatted(res.data as SavedFilterAPI)
                            )
                        )

                        void dispatch(
                            notify({
                                status: NotificationStatus.Success,
                                message: FILTER_SAVED_MESSAGE,
                            })
                        )
                        setIsEditMode(false)
                    })
                    .catch((e: unknown) => {
                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message: FILTER_SAVED_ERROR_MESSAGE,
                            })
                        )

                        if (
                            isGorgiasApiError(e) &&
                            isSavedFiltersError(e.response.data.error.data)
                        ) {
                            setErrorMessage(
                                e.response.data.error.data[
                                    SAVED_FILTER_NAME_FIELD_KEY
                                ]?.join(' ')
                            )
                        }
                    })
            } else {
                void createMutation
                    .mutateAsync({
                        data: {
                            name: filter.name,
                            filter_group: toApiFormatted(filter.filter_group),
                        },
                    })
                    .then((res) => {
                        dispatch(
                            applySavedFilter(
                                fromApiFormatted(res.data as SavedFilterAPI)
                            )
                        )
                        void dispatch(
                            notify({
                                status: NotificationStatus.Success,
                                message: FILTER_SAVED_MESSAGE,
                            })
                        )
                        setIsEditMode(false)
                    })
                    .catch((e: unknown) => {
                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message: FILTER_SAVED_ERROR_MESSAGE,
                            })
                        )

                        if (
                            isGorgiasApiError(e) &&
                            isSavedFiltersError(e.response.data.error.data)
                        ) {
                            setErrorMessage(
                                e.response.data.error.data[
                                    SAVED_FILTER_NAME_FIELD_KEY
                                ]?.join(' ')
                            )
                        }
                    })
            }
        },
        [createMutation, dispatch, updateMutation, setErrorMessage]
    )

    const deleteHandler = useCallback(
        (savedFilter: SavedFilter) => {
            void deleteMutation
                .mutateAsync({id: savedFilter.id})
                .then(() => {
                    dispatch(clearSavedFilterDraft())
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: FILTER_DELETED_MESSAGE,
                        })
                    )
                })
                .catch(() => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: FILTER_DELETED_ERROR_MESSAGE,
                        })
                    )
                })
        },
        [deleteMutation, dispatch]
    )

    const duplicateSavedFilterHandler = useCallback(
        (savedFilter: SavedFilter) => {
            dispatch(duplicateSavedFilterDraftFromSavedFilter(savedFilter))
        },
        [dispatch]
    )

    return (
        <>
            {savedFilterDraft !== null && (
                <Card>
                    <div className={classnames(css.wrapper)}>
                        <div className={classnames(css.titleRow)}>
                            <IconButton
                                onClick={toggleIsEditMode}
                                fillStyle={'ghost'}
                                className={css.collapseIcon}
                                intent={'secondary'}
                            >
                                {isEditMode || isEditingSavedFilterDraft
                                    ? COLLAPSE_OPEN_ICON
                                    : COLLAPSE_CLOSED_ICON}
                            </IconButton>
                            <FiltersEditableTitle
                                isEditMode={
                                    isEditMode || isEditingSavedFilterDraft
                                }
                                toggleIsEditMode={toggleIsEditMode}
                                title={savedFilterDraft.name}
                                onChange={titleOnChangeHandler}
                                errorType={areFiltersApplicable({
                                    applicableFilters: [
                                        ...(persistentFilters || []),
                                        ...optionalFilters,
                                    ],
                                    savedFilterDraft,
                                })}
                                error={errorMessage}
                            />
                            {(isEditMode || isEditingSavedFilterDraft) &&
                            savedFilter ? (
                                <>
                                    <ConfirmationModal
                                        confirmIntent={'destructive'}
                                        confirmText={
                                            DELETE_CONFIRMATION_BUTTON_LABEL
                                        }
                                        title={getDeleteConfirmationTitle(
                                            savedFilter.name
                                        )}
                                        onConfirm={() => {
                                            deleteHandler(savedFilter)
                                            setIsConfirmationModalOpen(false)
                                        }}
                                        isOpen={isConfirmationModalOpen}
                                        onClose={() => {
                                            setIsConfirmationModalOpen(false)
                                        }}
                                        className={css.confirmationModal}
                                    >
                                        {getDeleteConfirmationContent(
                                            savedFilter.name
                                        )}
                                    </ConfirmationModal>
                                    <SavedFilterMenu
                                        actions={[
                                            {
                                                label: DUPLICATE_FILTER_ACTION_LABEL,
                                                callback: () =>
                                                    duplicateSavedFilterHandler(
                                                        savedFilter
                                                    ),
                                            },
                                            {
                                                label: DELETE_FILTER_ACTION_LABEL,
                                                callback: () =>
                                                    setIsConfirmationModalOpen(
                                                        true
                                                    ),
                                            },
                                        ]}
                                    />
                                </>
                            ) : (
                                <IconButton
                                    onClick={unApplyFilterHandler}
                                    fillStyle={'ghost'}
                                    className={css.close}
                                    isDisabled={deleteMutation.isLoading}
                                    size={'medium'}
                                    intent={'secondary'}
                                >
                                    {UNAPPLY_FILTER_ICON}
                                </IconButton>
                            )}
                        </div>
                        <Collapse
                            isOpen={isEditMode || isEditingSavedFilterDraft}
                        >
                            <div className={classnames(css.collapse)}>
                                <CampaignStatsFilters>
                                    <FiltersPanelWithSavedFiltersState
                                        applicableFilters={[
                                            ...(persistentFilters || []),
                                            ...optionalFilters,
                                        ]}
                                    />
                                </CampaignStatsFilters>
                                {isCurrentUserAnAdmin && (
                                    <div className={classnames(css.buttons)}>
                                        <Button
                                            intent={'secondary'}
                                            onClick={cancelHandler}
                                        >
                                            {CANCEL_BUTTON_LABEL}
                                        </Button>
                                        <Button
                                            intent={'primary'}
                                            onClick={() =>
                                                saveHandler(savedFilterDraft)
                                            }
                                            isDisabled={!canSaveFilter}
                                        >
                                            {SAVE_BUTTON_LABEL}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Collapse>
                    </div>
                </Card>
            )}
        </>
    )
}
