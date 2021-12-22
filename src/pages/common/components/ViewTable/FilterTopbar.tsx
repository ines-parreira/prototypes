import React, {useEffect, useRef, useState} from 'react'
import {Map, List} from 'immutable'
import {useSelector} from 'react-redux'
import classnames from 'classnames'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
    PopoverHeader,
    UncontrolledButtonDropdown,
    UncontrolledDropdown,
} from 'reactstrap'
import {useAsyncFn, usePrevious, useUnmount, useUpdateEffect} from 'react-use'

import {getConfigByName} from '../../../../config/views'
import {SYSTEM_VIEW_CATEGORY} from '../../../../constants/view'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {ViewVisibility, View} from '../../../../models/view/types'
import {getCurrentUser} from '../../../../state/currentUser/selectors'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from '../../../../state/entities/views/actions'
import {
    addFieldFilter,
    deleteView,
    fetchViewItems,
    resetView,
    submitView as submitViewAction,
} from '../../../../state/views/actions'
import {
    areFiltersValid as getAreFiltersValid,
    getActiveView,
    getPristineActiveView,
    isDirty as getIsViewDirty,
} from '../../../../state/views/selectors'
import {getSchemas} from '../../../../state/schemas/selectors'
import {GorgiasAction} from '../../../../state/types'
import {activeViewIdSet} from '../../../../state/ui/views/actions'
import {
    SUBMIT_NEW_VIEW_ERROR,
    SUBMIT_UPDATE_VIEW_ERROR,
} from '../../../../state/views/constants'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import {fieldPath, getDefaultOperator, slugify} from '../../../../utils'
import {reportError} from '../../../../utils/errors'
import history from '../../../history'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../utils/withCancellableRequest'
import ConfirmButton from '../ConfirmButton'
import ViewSharingButton from '../ViewSharing/ViewSharingButton'

import Filters from './Filters/ViewFilters'
import css from './FilterTopbar.less'

type Props = {
    isSearch: boolean
    isUpdate: boolean
    type: string
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

    const [askUpdateConfirmation, setAskUpdateConfirmation] = useState(false)
    const [showNoChangeFeedback, setShowNoChangeFeedback] = useState(false)
    const timeoutChangeFeedbackRef = useRef<Maybe<number>>(null)

    const activeView = useSelector(getActiveView)
    const previousActiveView = usePrevious(activeView)
    const areFiltersValid = useSelector(getAreFiltersValid)
    const config = getConfigByName(type)
    const currentUser = useSelector(getCurrentUser)
    const isViewDirty = useSelector(getIsViewDirty)
    const pristineActiveView = useSelector(getPristineActiveView)
    const schemas = useSelector(getSchemas)

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

    useUpdateEffect(() => {
        if (
            previousActiveView &&
            previousActiveView.get('editMode') !== activeView.get('editMode') &&
            askUpdateConfirmation
        ) {
            setAskUpdateConfirmation(false)
        }
    }, [activeView, previousActiveView])

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

        setAskUpdateConfirmation(false)

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
        setAskUpdateConfirmation(false)

        if (isUpdate) {
            dispatch(resetView())
            void dispatch(fetchViewItems())
        } else {
            history.push(`/app/${config.get('routeList') as string}/`)
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

    const toggleUpdateConfirmation = () => {
        if (!askUpdateConfirmation && !isViewDirty) {
            timeoutChangeFeedbackRef.current &&
                window.clearTimeout(timeoutChangeFeedbackRef.current)
            setShowNoChangeFeedback(true)
            timeoutChangeFeedbackRef.current = window.setTimeout(
                () => setShowNoChangeFeedback(false),
                2000
            )
        } else {
            setAskUpdateConfirmation(!askUpdateConfirmation)
        }
    }

    const isSystemView = activeView.get('category') === SYSTEM_VIEW_CATEGORY

    useUnmount(cancelFetchViewItemsCancellable)

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
                    <ViewSharingButton
                        view={activeView}
                        className="float-right"
                    />
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
                                <UncontrolledButtonDropdown>
                                    <Button
                                        type="submit"
                                        id="update-view-button"
                                        color="success"
                                        className={classnames({
                                            'btn-loading': isSubmitting,
                                        })}
                                        disabled={
                                            isSubmitting || !areFiltersValid
                                        }
                                    >
                                        Update view
                                    </Button>
                                    <Popover
                                        placement="bottom"
                                        isOpen={askUpdateConfirmation}
                                        target="update-view-button"
                                        toggle={toggleUpdateConfirmation}
                                        trigger="legacy"
                                    >
                                        <PopoverHeader>
                                            Are you sure?
                                        </PopoverHeader>
                                        <PopoverBody>
                                            <p>
                                                You are about to edit this view
                                                for <b>all users</b>.
                                            </p>
                                            <Button
                                                type="submit"
                                                color="success"
                                                onClick={handleClickUpdate}
                                            >
                                                Confirm
                                            </Button>
                                        </PopoverBody>
                                    </Popover>
                                    <DropdownToggle
                                        caret
                                        type="button"
                                        color="success"
                                    />
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
                                </UncontrolledButtonDropdown>
                            ) : (
                                <Button
                                    type="submit"
                                    color="primary"
                                    className={classnames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting || !areFiltersValid}
                                    onClick={createView}
                                >
                                    Create view
                                </Button>
                            )}
                            {!isSearch && (
                                <Button
                                    type="submit"
                                    color="secondary"
                                    className="ml-2"
                                    disabled={isSubmitting}
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
                                content={
                                    <span>
                                        You are about to <b>delete</b> this view
                                        for <b>all users</b>.
                                    </span>
                                }
                                confirm={async () => {
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
                                <i className="material-icons md-2 mr-2 text-danger">
                                    delete
                                </i>
                                Delete view
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
