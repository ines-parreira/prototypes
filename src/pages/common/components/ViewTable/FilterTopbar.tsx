import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import {List, Map} from 'immutable'
import classnames from 'classnames'
import {
    Card,
    CardBody,
    CardFooter,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
    ButtonDropdown,
} from 'reactstrap'
import {useAsyncFn, usePrevious, useUnmount, useUpdateEffect} from 'react-use'

import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import Group from 'pages/common/components/layout/Group'
import {getConfigByName} from 'config/views'
import {SYSTEM_VIEW_CATEGORY} from 'constants/view'
import useAppDispatch from 'hooks/useAppDispatch'
import {View, ViewType, ViewVisibility} from 'models/view/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from 'state/entities/views/actions'
import {
    addFieldFilter,
    createJob,
    deleteView,
    fetchViewItems,
    resetView,
    submitView as submitViewAction,
} from 'state/views/actions'
import {
    areFiltersValid as getAreFiltersValid,
    getActiveView,
    getLastViewId,
    getPristineActiveView,
    getViewIdToDisplay,
    isDirty as getIsViewDirty,
} from 'state/views/selectors'
import {getSchemas} from 'state/schemas/selectors'
import {GorgiasAction} from 'state/types'
import {getTickets} from 'state/tickets/selectors'
import {activeViewIdSet} from 'state/ui/views/actions'
import {
    SUBMIT_NEW_VIEW_ERROR,
    SUBMIT_UPDATE_VIEW_ERROR,
} from 'state/views/constants'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {fieldPath, getDefaultOperator, slugify} from 'utils'
import {reportError} from 'utils/errors'
import {JobType} from 'models/job/types'
import history from 'pages/history'

import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../utils/withCancellableRequest'
import ViewSharingButton from '../ViewSharing/ViewSharingButton'

import Filters from './Filters/ViewFilters'
import css from './FilterTopbar.less'

type Props = {
    isSearch: boolean
    isUpdate: boolean
    type: 'ticket' | 'customer'
} & CancellableRequestInjectedProps<
    'fetchViewItemsCancellable',
    'cancelFetchViewItemsCancellable',
    typeof fetchViewItems
>

export const FilterTopbar = ({
    cancelFetchViewItemsCancellable,
    fetchViewItemsCancellable,
    isSearch,
    isUpdate,
    type,
}: Props) => {
    const dispatch = useAppDispatch()

    const [showNoChangeFeedback, setShowNoChangeFeedback] = useState(false)
    const [isDropdownOpen, toggleDropdownOpen] = useState<boolean>(false)
    const timeoutChangeFeedbackRef = useRef<Maybe<number>>(null)

    const lastViewId = useAppSelector(getLastViewId)
    const activeView = useAppSelector(getActiveView)
    const previousActiveView = usePrevious(activeView)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const config = getConfigByName(type)
    const currentUser = useAppSelector(getCurrentUser)
    const isViewDirty = useAppSelector(getIsViewDirty)
    const pristineActiveView = useAppSelector(getPristineActiveView)
    const schemas = useAppSelector(getSchemas)
    const tickets = useAppSelector(getTickets)
    const suggestedPreviousViewId = useAppSelector(
        getViewIdToDisplay(ViewType.TicketList, lastViewId?.toString())
    )

    useEffect(
        () => () => {
            timeoutChangeFeedbackRef.current &&
                window.clearTimeout(timeoutChangeFeedbackRef.current)
        },
        []
    )

    useUpdateEffect(() => {
        const isSameView =
            !!previousActiveView &&
            previousActiveView.get('id') === activeView.get('id')
        const filtersHaveChanged =
            !!previousActiveView &&
            previousActiveView.get('filters') !== activeView.get('filters')

        if (isSameView && filtersHaveChanged && areFiltersValid) {
            void fetchViewItemsCancellable(undefined, undefined, undefined)
        }
    }, [activeView, areFiltersValid, previousActiveView])

    const [{loading: isSubmitting}, submitView] = useAsyncFn(
        async (view: Map<any, any>) => {
            try {
                const resp = await dispatch(submitViewAction(view))

                if (
                    [SUBMIT_UPDATE_VIEW_ERROR, SUBMIT_NEW_VIEW_ERROR].includes(
                        (resp as GorgiasAction).type
                    )
                ) {
                    return
                }
                if (view.get('id') == null) {
                    window.Raven?.captureBreadcrumb({
                        message: 'View created from client',
                        data: resp,
                        level: 'log',
                    })
                    dispatch(viewCreated(resp as View))
                } else {
                    dispatch(viewUpdated(resp as View))
                }
                dispatch(activeViewIdSet((resp as View).id))
            } catch (error) {
                reportError(error)
            }
        },
        []
    )

    const handleClickUpdate = async () => {
        if (!areFiltersValid) {
            return
        }

        await submitView(activeView)
    }

    const onClickNew = async () => {
        if (!areFiltersValid) {
            return
        }

        let newActiveView = activeView.delete('id')

        if (pristineActiveView.get('name') === newActiveView.get('name')) {
            const newName = `${newActiveView.get('name', '') as string} - copy`
            const newSlug = slugify(newName)

            newActiveView = newActiveView
                .set('name', newName)
                .set('slug', newSlug)
        }
        if (newActiveView.get('visibility') === ViewVisibility.Private) {
            newActiveView = newActiveView.set('shared_with_users', [
                currentUser.get('id'),
            ])
        }

        await submitView(newActiveView)
    }

    const handleClickFilter = (field: Map<any, any>) => {
        const left = `${config.get('singular') as string}.${fieldPath(field)}`
        const operator = getDefaultOperator(left, schemas) as string
        const filter = {
            left,
            operator,
        }
        dispatch(addFieldFilter(field.toJS(), filter))
    }

    const cancel = () => {
        if (isUpdate) {
            dispatch(resetView())
            void dispatch(fetchViewItems())
        } else {
            dispatch(activeViewIdSet(suggestedPreviousViewId))
            history.push(
                `/app/${config.get('routeList') as string}/${
                    suggestedPreviousViewId || ''
                }`
            )
        }
    }

    const createView = async () => {
        if (!areFiltersValid) {
            return
        }

        let newActiveView = activeView
            .delete('id')
            .set('name', activeView.get('name') || 'New view')
            .set('slug', slugify(activeView.get('name')))
        if (newActiveView.get('visibility') === ViewVisibility.Private) {
            newActiveView = newActiveView.set('shared_with_users', [
                currentUser.get('id'),
            ])
        }

        await submitView(newActiveView)
    }

    const handleClickValidation = useCallback(
        (e: MouseEvent) => {
            if (!isViewDirty) {
                timeoutChangeFeedbackRef.current &&
                    window.clearTimeout(timeoutChangeFeedbackRef.current)
                setShowNoChangeFeedback(true)
                timeoutChangeFeedbackRef.current = window.setTimeout(
                    () => setShowNoChangeFeedback(false),
                    2000
                )
                e.stopPropagation()
            }
        },
        [isViewDirty]
    )

    const isSystemView = activeView.get('category') === SYSTEM_VIEW_CATEGORY

    useUnmount(cancelFetchViewItemsCancellable)

    const [{loading: isLaunchingJob}, createExportTicketJob] =
        useAsyncFn(async () => {
            await dispatch(createJob(activeView, JobType.ExportTicket, {}))
        }, [dispatch, activeView])

    if (!activeView.get('editMode') && !isSearch) {
        return null
    }

    const filterableFields = (config.get('fields') as List<any>)
        .filter(
            (field: Map<any, any>) =>
                !!field.get('filter') &&
                (field.getIn(['filter', 'show'], true) as boolean)
        )
        .sortBy((field: Map<any, any>) => field.get('title') as string)

    return (
        <Card className={css.component}>
            <CardBody className="filter-topbar-content">
                {isUpdate && !isSearch && (
                    <div className={css.cardActions}>
                        {!tickets.isEmpty() && type === 'ticket' && (
                            <Button
                                intent="secondary"
                                onClick={createExportTicketJob}
                                isDisabled={isLaunchingJob}
                                title="Export all view tickets"
                            >
                                <ButtonIconLabel icon="file_download">
                                    Export tickets
                                </ButtonIconLabel>
                            </Button>
                        )}
                        <ViewSharingButton view={activeView} />
                    </div>
                )}
                <p className={css.subtitle}>ADVANCED FILTERS</p>
                <Filters />
                <UncontrolledDropdown>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                            logEvent(SegmentEvent.ViewFilterAddClicked)
                        }}
                    >
                        <i className="material-icons mr-2">add</i>
                        Add filter
                    </DropdownToggle>
                    <DropdownMenu>
                        {filterableFields.map((field: Map<any, any>) => (
                            <DropdownItem
                                key={field.get('name')}
                                type="button"
                                onClick={() => handleClickFilter(field)}
                            >
                                {field.get('title')}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </UncontrolledDropdown>
            </CardBody>
            {!isSearch && (
                <CardFooter>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className={css.footer}>
                            {isSystemView ? (
                                <span>
                                    <i className="material-icons mr-2">info</i>
                                    This view cannot be saved
                                </span>
                            ) : isUpdate ? (
                                <ButtonDropdown
                                    isOpen={isDropdownOpen}
                                    toggle={() => {
                                        toggleDropdownOpen(!isDropdownOpen)
                                    }}
                                >
                                    <Group>
                                        <ConfirmationPopover
                                            buttonProps={{
                                                type: 'submit',
                                            }}
                                            content={
                                                <>
                                                    You are about to edit this
                                                    view for <b>all users</b>.
                                                </>
                                            }
                                            popperClassName={css.editPopover}
                                            onConfirm={handleClickUpdate}
                                        >
                                            {({
                                                uid,
                                                onDisplayConfirmation,
                                                elementRef,
                                            }) => (
                                                <Button
                                                    id={uid}
                                                    isLoading={isSubmitting}
                                                    isDisabled={
                                                        !areFiltersValid
                                                    }
                                                    onClick={
                                                        onDisplayConfirmation
                                                    }
                                                    onClickCapture={
                                                        handleClickValidation
                                                    }
                                                    ref={elementRef}
                                                >
                                                    Update View
                                                </Button>
                                            )}
                                        </ConfirmationPopover>
                                        <IconButton
                                            onClick={() =>
                                                toggleDropdownOpen(
                                                    !isDropdownOpen
                                                )
                                            }
                                            isDisabled={
                                                isSubmitting || !areFiltersValid
                                            }
                                        >
                                            arrow_drop_down
                                        </IconButton>
                                    </Group>
                                    <DropdownToggle tag="span" />
                                    <DropdownMenu right>
                                        <DropdownItem
                                            key="open"
                                            type="button"
                                            disabled={
                                                isSubmitting || !areFiltersValid
                                            }
                                            onClick={onClickNew}
                                        >
                                            Save as new view
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            ) : (
                                <Button
                                    isLoading={isSubmitting}
                                    isDisabled={
                                        isSubmitting || !areFiltersValid
                                    }
                                    onClick={createView}
                                    type="submit"
                                >
                                    Create view
                                </Button>
                            )}
                            {!isSearch && (
                                <Button
                                    type="submit"
                                    intent="secondary"
                                    className="ml-2"
                                    isDisabled={isSubmitting}
                                    onClick={cancel}
                                >
                                    Cancel
                                </Button>
                            )}
                            <span
                                className={classnames(css.updateViewFeedback, {
                                    [css.visible]: showNoChangeFeedback,
                                })}
                            >
                                No changes have been made.
                            </span>
                        </div>
                        {!isSearch && !isSystemView && isUpdate && (
                            <ConfirmButton
                                id="delete-view"
                                intent="destructive"
                                confirmationContent={
                                    <span>
                                        You are about to <b>delete</b> this view
                                        for <b>all users</b>.
                                    </span>
                                }
                                onConfirm={async () => {
                                    const destinationView = await dispatch(
                                        deleteView(activeView)
                                    )
                                    dispatch(viewDeleted(activeView.get('id')))
                                    dispatch(
                                        activeViewIdSet(
                                            (
                                                destinationView as Map<any, any>
                                            ).get('id')
                                        )
                                    )
                                }}
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete view
                                </ButtonIconLabel>
                            </ConfirmButton>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}

export default withCancellableRequest<
    'fetchViewItemsCancellable',
    'cancelFetchViewItemsCancellable',
    typeof fetchViewItems
>(
    'fetchViewItemsCancellable',
    fetchViewItems
)(FilterTopbar)
