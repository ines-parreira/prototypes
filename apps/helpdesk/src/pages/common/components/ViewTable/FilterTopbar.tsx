import type { MouseEvent } from 'react'
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {
    useAsyncFn,
    usePrevious,
    useUnmount,
    useUpdateEffect,
} from '@repo/hooks'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import * as Sentry from '@sentry/react'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import _isNumber from 'lodash/isNumber'
import pluralize from 'pluralize'
import {
    ButtonDropdown,
    Card,
    CardBody,
    CardFooter,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import {
    LegacyButton as Button,
    MultiButton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { getConfigByName } from 'config/views'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { JobType } from 'models/job/types'
import type { View } from 'models/view/types'
import {
    EntityType,
    ViewCategory,
    ViewField,
    ViewType,
    ViewVisibility,
} from 'models/view/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import { Separator } from 'pages/common/components/Separator/Separator'
import ViewSharingButton from 'pages/common/components/ViewSharing/ViewSharingButton'
import type { CancellableRequestInjectedProps } from 'pages/common/utils/withCancellableRequest'
import withCancellableRequest from 'pages/common/utils/withCancellableRequest'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from 'state/entities/views/actions'
import { getSchemas } from 'state/schemas/selectors'
import { getTickets } from 'state/tickets/selectors'
import type { GorgiasAction } from 'state/types'
import { activeViewIdSet } from 'state/ui/views/actions'
import {
    addFieldFilter,
    createJob,
    deleteView,
    fetchViewItems,
    resetView,
    submitView as submitViewAction,
} from 'state/views/actions'
import {
    SUBMIT_NEW_VIEW_ERROR,
    SUBMIT_UPDATE_VIEW_ERROR,
} from 'state/views/constants'
import {
    areFiltersValid as getAreFiltersValid,
    isDirty as getIsViewDirty,
    getLastViewId,
    getNavigation,
    getPristineActiveView,
    getViewIdToDisplay,
} from 'state/views/selectors'
import type { FetchViewItemsOptions } from 'state/views/types'
import { fieldPath, getDefaultOperator, slugify } from 'utils'

import { AddFilterDropdown } from './AddFilterDropdown'
import { getDefaultCustomFieldOperator } from './Filters/utils'
import Filters from './Filters/ViewFilters'

import css from './FilterTopbar.less'

type Props = {
    isSearch: boolean
    isUpdate: boolean
    type: EntityType
    activeView: Map<any, any>
} & CancellableRequestInjectedProps<
    'fetchViewItemsCancellable',
    'cancelFetchViewItemsCancellable',
    typeof fetchViewItems
>

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
export const FilterTopbar = ({
    activeView,
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
    const previousActiveView = usePrevious(activeView)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const config = getConfigByName(type)
    const currentUser = useAppSelector(getCurrentUser)
    const isViewDirty = useAppSelector(getIsViewDirty)
    const pristineActiveView = useAppSelector(getPristineActiveView)
    const schemas = useAppSelector(getSchemas)
    const tickets = useAppSelector(getTickets)
    const suggestedPreviousViewId = useAppSelector((state) =>
        getViewIdToDisplay(state)(ViewType.TicketList, lastViewId?.toString()),
    )
    const navigationMeta = useAppSelector(getNavigation)
    const customFields = useCustomFieldDefinitions({
        archived: false,
        object_type: 'Ticket',
    })

    const activeCustomFields = useMemo(() => {
        return (
            customFields.data?.data.filter(
                (field) => !field.deactivated_datetime,
            ) || []
        )
    }, [customFields.data?.data])

    const firstCustomField = activeCustomFields[0]

    const searchRank = useContext(SearchRankScenarioContext)
    const orderBy = activeView.get('order_by') as string
    const isActiveViewValid =
        (activeView.get('name') as string).trim().length > 0
    const fetchParams = useMemo(
        () =>
            orderBy
                ? {
                      orderBy: `${orderBy}:${
                          activeView.get('order_dir') as string
                      }`,
                  }
                : undefined,
        [activeView, orderBy],
    ) as FetchViewItemsOptions

    const {
        setIsEnabled: setSplitTicketView,
        shouldRedirectToSplitView,
        setShouldRedirectToSplitView,
    } = useSplitTicketView()

    useEffect(
        () => () => {
            // oxlint-disable-next-line no-unused-expressions
            timeoutChangeFeedbackRef.current &&
                window.clearTimeout(timeoutChangeFeedbackRef.current)
            if (shouldRedirectToSplitView) {
                setSplitTicketView(true)
                setShouldRedirectToSplitView(false)
            }
        },
        [
            setShouldRedirectToSplitView,
            setSplitTicketView,
            shouldRedirectToSplitView,
        ],
    )

    useUpdateEffect(() => {
        const isSameView =
            !!previousActiveView &&
            previousActiveView.get('id') === activeView.get('id')
        const filtersHaveChanged =
            !!previousActiveView &&
            previousActiveView.get('filters') !== activeView.get('filters')

        if (isSameView && filtersHaveChanged && areFiltersValid) {
            void fetchViewItemsCancellable(
                undefined,
                undefined,
                undefined,
                searchRank,
                fetchParams,
            )
        }
    }, [activeView, areFiltersValid, previousActiveView])

    const [{ loading: isSubmitting }, submitView] = useAsyncFn(
        async (view: Map<any, any>) => {
            try {
                const resp = await dispatch(submitViewAction(view))

                if (
                    [SUBMIT_UPDATE_VIEW_ERROR, SUBMIT_NEW_VIEW_ERROR].includes(
                        (resp as GorgiasAction).type,
                    )
                ) {
                    return
                }
                if (view.get('id') == null) {
                    Sentry.addBreadcrumb({
                        message: 'View created from client',
                        data: resp as GorgiasAction,
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
        [],
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
            const newName = `(Copy) ${newActiveView.get('name', '') as string}`
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

        if (newActiveView.get('visibility') === ViewVisibility.Shared) {
            const sharedWithUsers = newActiveView.get(
                'shared_with_users',
            ) as List<any>
            newActiveView = newActiveView.set(
                'shared_with_users',
                sharedWithUsers.map(
                    (user: Map<any, any>) => user.get('id') as number,
                ),
            )

            const sharedWithTeams = newActiveView.get(
                'shared_with_teams',
            ) as List<any>
            newActiveView = newActiveView.set(
                'shared_with_teams',
                sharedWithTeams.map(
                    (team: Map<any, any>) => team.get('id') as number,
                ),
            )
        }

        await submitView(newActiveView)
    }

    const handleClickFilter = useCallback(
        (field: Map<any, any>) => {
            const path = fieldPath(field)
            const isCustomFieldsFilter = fieldPath(field) === 'custom_fields'
            const left = `${config.get('singular') as string}.${path}`
            const operator = isCustomFieldsFilter
                ? getDefaultCustomFieldOperator(schemas, firstCustomField)
                : (getDefaultOperator(left, schemas) as string)

            const filter = {
                left,
                operator,
            }

            dispatch(addFieldFilter(field.toJS(), filter))
        },
        [dispatch, schemas, firstCustomField, config],
    )

    const cancel = () => {
        if (isUpdate) {
            dispatch(resetView())
            void dispatch(fetchViewItems())
        } else {
            dispatch(activeViewIdSet(suggestedPreviousViewId))
            history.push(
                `/app/${config.get('routeList') as string}/${
                    suggestedPreviousViewId || ''
                }`,
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
                // oxlint-disable-next-line no-unused-expressions
                timeoutChangeFeedbackRef.current &&
                    window.clearTimeout(timeoutChangeFeedbackRef.current)
                setShowNoChangeFeedback(true)
                timeoutChangeFeedbackRef.current = window.setTimeout(
                    () => setShowNoChangeFeedback(false),
                    2000,
                )
                e.stopPropagation()
            }
        },
        [isViewDirty],
    )

    const isSystemView = ViewCategory.System === activeView.get('category')

    useUnmount(cancelFetchViewItemsCancellable)

    const [{ loading: isLaunchingJob }, createExportTicketJob] =
        useAsyncFn(async () => {
            logEvent(SegmentEvent.TicketExport, {
                type: 'views-export-button',
            })
            await dispatch(createJob(activeView, JobType.ExportTicket, {}))
        }, [dispatch, activeView])

    const hasAutomate = useAppSelector(getHasAutomate)

    const filterableFields = useMemo(
        () =>
            (config.get('fields') as List<any>)
                .filter((field) => {
                    const filterConfig = field.get('filter')
                    if (!filterConfig) {
                        return false
                    }

                    const fieldName: string = field.get('name')

                    if (fieldName === ViewField.Feedback && !hasAutomate) {
                        return false
                    }

                    return true
                })
                .sortBy((field) => field.get('title')),
        [config, hasAutomate],
    )

    const totalSearchResources = useMemo(() => {
        return navigationMeta.get('total_resources') as number | undefined
    }, [navigationMeta])

    return (
        <Card className={css.component}>
            <CardBody className={css.filterTopbarContent}>
                {isUpdate && !isSearch && (
                    <div className={css.cardActions}>
                        {!tickets.isEmpty() && type === EntityType.Ticket && (
                            <Button
                                intent="secondary"
                                onClick={createExportTicketJob}
                                isDisabled={isLaunchingJob}
                                title="Export all view tickets"
                                leadingIcon="file_download"
                            >
                                Export tickets
                            </Button>
                        )}
                        <ViewSharingButton view={activeView} />
                    </div>
                )}
                {_isNumber(totalSearchResources) && isSearch && (
                    <p className={css.searchResourceCount}>
                        {`${totalSearchResources >= 5000 ? '5000+' : totalSearchResources} ${pluralize('ticket', totalSearchResources)}`}
                    </p>
                )}
                <p className={css.subtitle}>ADVANCED FILTERS</p>
                <div className={css.advancedFilters}>
                    <Filters />
                    <AddFilterDropdown
                        filterableFields={filterableFields}
                        handleClickFilter={handleClickFilter}
                    />
                </div>
            </CardBody>
            {!isSearch && (
                <>
                    <Separator />
                    <CardFooter>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className={css.footer}>
                                {isSystemView ? (
                                    <span>
                                        <i className="material-icons mr-2">
                                            info
                                        </i>
                                        This view cannot be saved
                                    </span>
                                ) : isUpdate ? (
                                    <ButtonDropdown
                                        isOpen={isDropdownOpen}
                                        toggle={() => {
                                            toggleDropdownOpen(!isDropdownOpen)
                                        }}
                                    >
                                        <MultiButton>
                                            <ConfirmationPopover
                                                buttonProps={{
                                                    type: 'submit',
                                                }}
                                                content={
                                                    <>
                                                        You are about to edit
                                                        this view for{' '}
                                                        <b>all users</b>.
                                                    </>
                                                }
                                                popperClassName={
                                                    css.editPopover
                                                }
                                                onConfirm={handleClickUpdate}
                                            >
                                                {({
                                                    uid,
                                                    onDisplayConfirmation,
                                                    elementRef,
                                                }) => (
                                                    <>
                                                        <Button
                                                            id={uid}
                                                            isLoading={
                                                                isSubmitting
                                                            }
                                                            isDisabled={
                                                                !areFiltersValid ||
                                                                !isActiveViewValid
                                                            }
                                                            onClick={
                                                                onDisplayConfirmation
                                                            }
                                                            onClickCapture={
                                                                handleClickValidation
                                                            }
                                                            ref={elementRef}
                                                        >
                                                            Update view
                                                        </Button>
                                                        {!isActiveViewValid && (
                                                            <Tooltip
                                                                target={uid}
                                                            >
                                                                You must give a
                                                                name to your
                                                                view before
                                                                saving it.
                                                            </Tooltip>
                                                        )}
                                                    </>
                                                )}
                                            </ConfirmationPopover>
                                            <IconButton
                                                id="arrow-save-view-button"
                                                onClick={() =>
                                                    toggleDropdownOpen(
                                                        !isDropdownOpen,
                                                    )
                                                }
                                                isDisabled={
                                                    isSubmitting ||
                                                    !areFiltersValid ||
                                                    !isActiveViewValid
                                                }
                                            >
                                                arrow_drop_down
                                            </IconButton>
                                            {!isActiveViewValid && (
                                                <Tooltip target="arrow-save-view-button">
                                                    You must give a name to your
                                                    view before saving it.
                                                </Tooltip>
                                            )}
                                        </MultiButton>
                                        <DropdownToggle tag="span" />
                                        <DropdownMenu right>
                                            <DropdownItem
                                                key="open"
                                                type="button"
                                                disabled={
                                                    isSubmitting ||
                                                    !areFiltersValid
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
                                            isSubmitting ||
                                            !areFiltersValid ||
                                            !isActiveViewValid
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
                                    className={classnames(
                                        css.updateViewFeedback,
                                        {
                                            [css.visible]: showNoChangeFeedback,
                                        },
                                    )}
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
                                            You are about to <b>delete</b> this
                                            view for <b>all users</b>.
                                        </span>
                                    }
                                    onConfirm={async () => {
                                        const destinationView = await dispatch(
                                            deleteView(activeView),
                                        )
                                        dispatch(
                                            viewDeleted(activeView.get('id')),
                                        )
                                        dispatch(
                                            activeViewIdSet(
                                                (
                                                    destinationView as Map<
                                                        any,
                                                        any
                                                    >
                                                ).get('id'),
                                            ),
                                        )
                                    }}
                                    leadingIcon="delete"
                                >
                                    Delete view
                                </ConfirmButton>
                            )}
                        </div>
                    </CardFooter>
                </>
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
    fetchViewItems,
)(FilterTopbar)
