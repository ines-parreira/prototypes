import React, {useEffect, useMemo, useRef, useState} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {useLocation} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
import {Button} from 'reactstrap'
import {CancelToken, AxiosError} from 'axios'
import {usePrevious, useUpdateEffect} from 'react-use'

import useCancellableRequest from '../../../../../hooks/useCancellableRequest'
import * as infobarActions from '../../../../../state/infobar/actions'
import * as infobarConstants from '../../../../../state/infobar/constants'
import * as customersActions from '../../../../../state/customers/actions'
import {setCustomer} from '../../../../../state/ticket/actions'
import * as WidgetsActions from '../../../../../state/widgets/actions'
import history from '../../../../history'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker.js'
import {ConnectedAction} from '../../../../../state/types'
import {WidgetContextType} from '../../../../../state/widgets/types'
import {ApiListResponsePagination} from '../../../../../models/api/types'
import {Customer} from '../../../../../state/customers/types'

import Loader from '../../Loader/Loader'
import Tooltip from '../../Tooltip'
import InfobarLayout from '../InfobarLayout'
import MergeCustomersContainer from '../../MergeCustomers/MergeCustomersContainer'
import Search from '../../Search'

import {areSourcesReady} from '../utils'
import css from '../Infobar.less'

import InfobarSearchResultsList from './InfobarSearchResultsList'
import InfobarCustomerInfo from './InfobarCustomerInfo/InfobarCustomerInfo'
import InfobarWidgetsEditionTools from './InfobarWidgetsEditionTools'
import InfobarCustomerActions from './InfobarCustomerActions'
import {ActionButtonContext} from './InfobarCustomerInfo/InfobarWidgets/widgets/ActionButton'

type Props = {
    actions: {
        fetchPreviewCustomer: ConnectedAction<
            typeof infobarActions.fetchPreviewCustomer
        >
        widgets: {
            cancelDrag: typeof WidgetsActions.cancelDrag
            drag: typeof WidgetsActions.drag
            drop: ConnectedAction<typeof WidgetsActions.drop>
            generateAndSetWidgets: ConnectedAction<
                typeof WidgetsActions.generateAndSetWidgets
            >
            removeEditedWidget: typeof WidgetsActions.removeEditedWidget
            resetWidgets: typeof WidgetsActions.resetWidgets
            setEditedWidgets: typeof WidgetsActions.setEditedWidgets
            setEditionAsDirty: typeof WidgetsActions.setEditionAsDirty
            startEditionMode: typeof WidgetsActions.startEditionMode
            stopEditionMode: typeof WidgetsActions.stopEditionMode
            startWidgetEdition: typeof WidgetsActions.startWidgetEdition
            stopWidgetEdition: typeof WidgetsActions.stopWidgetEdition
            submitWidgets: ConnectedAction<typeof WidgetsActions.submitWidgets>
            updateEditedWidget: typeof WidgetsActions.updateEditedWidget
        }
    }
    context: WidgetContextType
    customer: Map<any, any>
    identifier: string
    isRouteEditingWidgets: boolean
    sources: Map<any, any>
    widgets: Map<any, any>
} & ConnectedProps<typeof connector>

const MERGE_ERROR_MESSAGE = `You can only edit customers and orders of the customer associated with this ticket.
To edit this customer or order, merge both customers or change the customer associated with this ticket.`

export const Infobar = ({
    actions: {
        fetchPreviewCustomer,
        widgets: {
            cancelDrag,
            drag,
            drop,
            generateAndSetWidgets,
            removeEditedWidget,
            resetWidgets,
            setEditedWidgets,
            setEditionAsDirty,
            startEditionMode,
            startWidgetEdition,
            stopEditionMode,
            stopWidgetEdition,
            submitWidgets,
            updateEditedWidget,
        },
    },
    context,
    customer = fromJS({}),
    fetchCustomerHistory,
    identifier,
    isRouteEditingWidgets,
    searchCustomers,
    searchSimilarCustomer,
    setCustomer,
    sources,
    widgets,
}: Props) => {
    const location = useLocation()
    const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(
        null
    )
    const [isSearching, setIsSearching] = useState(false)
    const [isFetchingCustomer, setIsFetchingCustomer] = useState(false)
    const [displaySearchResults, setDisplaySearchResults] = useState(false)
    const [displaySelectedCustomer, setDisplaySelectedCustomer] =
        useState(false)
    const [showMergeCustomerModal, setShowMergeCustomerModal] = useState(false)
    const [searchResults, setSearchResults] = useState(fromJS([]))
    const [selectedCustomer, setSelectedCustomer] = useState(fromJS({}))
    const [suggestedCustomer, setSuggestedCustomer] = useState<Map<any, any>>(
        fromJS({})
    )
    const prevCustomer = usePrevious(customer)

    const isWidgetEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets]
    )
    const isEditing = useMemo(
        () => isWidgetEditing && isRouteEditingWidgets,
        [isWidgetEditing]
    )
    const mode = useMemo(() => {
        // the following succession of conditions is in a particular order
        // which is important for the good display of each of those
        // /!\ do not mix it without testing it carefully

        if (isSearching || isFetchingCustomer) {
            return 'loading'
        }

        if (displaySelectedCustomer) {
            return 'selected'
        }

        if (displaySearchResults) {
            return 'results'
        }

        return 'default'
    }, [
        displaySearchResults,
        displaySelectedCustomer,
        isFetchingCustomer,
        isSearching,
    ])
    const defaultCustomerId = useMemo(
        () =>
            (sources.getIn(['ticket', 'customer', 'id']) ||
                sources.getIn(['customer', 'id'])) as number,
        [sources]
    )

    const searchRef = useRef<Search>(null)

    useUpdateEffect(() => {
        resetSearch()
    }, [identifier])

    useEffect(() => {
        if (isRouteEditingWidgets && !isWidgetEditing) {
            startEditionMode(context)
        } else if (!isRouteEditingWidgets && isWidgetEditing) {
            stopEditionMode()
        }
    }, [isWidgetEditing, isRouteEditingWidgets])

    // if customer changed then try to find a suggestion of other customer to merge with it
    useEffect(() => {
        if (!prevCustomer || !prevCustomer.equals(customer)) {
            void updateSimilarCustomer()
        }
    }, [customer, prevCustomer])

    const [cancellableSearch] = useCancellableRequest(
        (cancelToken: CancelToken) => async (query) =>
            await searchCustomers(query, cancelToken)
    )

    const updateSimilarCustomer = async () => {
        setSuggestedCustomer(fromJS({}))

        if (customer.isEmpty() || !customer.get('id')) {
            return
        }

        const data = (await searchSimilarCustomer(customer.get('id'))) as {
            customer: Customer
        }
        if (!data) {
            return
        }
        const {customer: suggestion} = data
        const suggestionImmutable = fromJS(suggestion || {}) as Map<any, any>

        if (suggestionImmutable.isEmpty()) {
            return
        }

        setSuggestedCustomer(suggestionImmutable)
    }

    const toggleEditionMode = () => {
        if (!identifier) {
            return
        }

        if (isEditing) {
            history.push(`/app/${context}/${identifier}${location.search}`)
        } else {
            history.push(
                `/app/${context}/${identifier}/edit-widgets${location.search}`
            )
        }
    }

    const onSearchResultClick = async (customer: Map<any, any>) => {
        setIsFetchingCustomer(true)
        const result = (await fetchPreviewCustomer(customer.get('id'))) as {
            type: string
            resp: ApiListResponsePagination<Customer[]>
        }
        if (result?.type === infobarConstants.FETCH_PREVIEW_CUSTOMER_SUCCESS) {
            setDisplaySelectedCustomer(true)
            setSelectedCustomer(fromJS(result.resp))
        }
        setIsFetchingCustomer(false)
    }

    const onSearch = async (query: string) => {
        if (query) {
            setIsSearching(true)
            const res = (await cancellableSearch(query)) as {
                error?: AxiosError<{error?: {message: string}}>
                resp: ApiListResponsePagination<Customer[]>
            }
            if (!res) {
                return
            }
            const {error, resp} = res
            let errorMessage = null

            if (error) {
                errorMessage =
                    error?.response?.data?.error?.message ||
                    'Failed to do the search. Please try again.'
            }

            setSearchErrorMessage(errorMessage)
            setDisplaySelectedCustomer(false)
            setDisplaySearchResults(true)
            setIsSearching(false)
            setSearchResults(error ? fromJS([]) : fromJS(resp.data.slice(0, 8)))
        } else {
            resetSearch()
        }
    }

    const handleCustomerHistoryFetch = () => {
        if (customer.isEmpty()) {
            return
        }

        const askedCustomerId = customer.get('id') as number

        // wait 1.5s before fetching customer history after merge (merge can take some time and is async)
        setTimeout(() => {
            void fetchCustomerHistory(askedCustomerId, {
                successCondition: () => {
                    return (
                        (customer.get('id') as number).toString() ===
                        askedCustomerId.toString()
                    )
                },
            })
        }, 1500)
    }

    const resetSearch = () => {
        setDisplaySearchResults(false)
        setSearchResults(fromJS([]))
    }

    const resetSelected = () => {
        setDisplaySelectedCustomer(false)
        setSelectedCustomer(fromJS({}))
    }

    // reset search and display current customer
    const returnToCurrentCustomerProfile = () => {
        resetSearch()
        resetSelected()
        searchRef.current && searchRef.current._reset()
    }

    const handleSetCustomer = () => {
        void setCustomer(selectedCustomer).then(returnToCurrentCustomerProfile)
    }

    const hasFetchedWidgets = widgets.getIn(['_internal', 'hasFetchedWidgets'])

    const currentContext = widgets.get('currentContext', '')

    const canEditWidgets =
        hasFetchedWidgets &&
        areSourcesReady(sources, currentContext) &&
        !displaySelectedCustomer

    return (
        <InfobarLayout
            className={classnames({
                [css.editing]: isEditing,
            })}
        >
            <div className={css.infobarContent}>
                <div
                    className={classnames(
                        css.infobarSearchWrapper,
                        'd-flex align-items-center justify-content-between'
                    )}
                >
                    <Search
                        tabIndex={10}
                        placeholder="Search for customers by email, order number, etc."
                        bindKey
                        onChange={onSearch}
                        style={{maxWidth: 'none'}}
                        searchDebounceTime={1000}
                        ref={searchRef}
                    />
                    <Button
                        className={classnames(
                            css.toggleWidgets,
                            'd-none d-md-inline-block ml-2 btn-transparent'
                        )}
                        type="button"
                        id="toggle-widgets-edition-button"
                        color="secondary"
                        active={isEditing}
                        disabled={!canEditWidgets}
                        onClick={toggleEditionMode}
                    >
                        <i className="material-icons md-2">settings</i>
                    </Button>
                    <Tooltip
                        placement="left"
                        target="toggle-widgets-edition-button"
                    >
                        {isEditing ? 'Leave widgets edition' : 'Edit widgets'}
                    </Tooltip>
                </div>
                <div className={css.content}>
                    {mode === 'loading' ? (
                        <Loader />
                    ) : mode === 'selected' ? (
                        <>
                            <div className="m-3">
                                <Button type="button" onClick={resetSelected}>
                                    <i className="material-icons md-2 mr-2">
                                        arrow_back
                                    </i>
                                    Back
                                </Button>
                                <InfobarCustomerActions
                                    customer={customer}
                                    sources={sources}
                                    selectedCustomer={selectedCustomer}
                                    toggleMergeCustomerModal={(
                                        showMergeCustomerModal: boolean
                                    ) =>
                                        setShowMergeCustomerModal(
                                            showMergeCustomerModal
                                        )
                                    }
                                    setCustomer={handleSetCustomer}
                                />
                            </div>
                            <ActionButtonContext.Provider
                                value={{
                                    actionError: MERGE_ERROR_MESSAGE,
                                }}
                            >
                                <InfobarCustomerInfo
                                    actions={
                                        {
                                            cancelDrag,
                                            drag,
                                            drop,
                                            generateAndSetWidgets,
                                            removeEditedWidget,
                                            resetWidgets,
                                            setEditedWidgets,
                                            setEditionAsDirty,
                                            startWidgetEdition,
                                            stopWidgetEdition,
                                            updateEditedWidget,
                                        } as any
                                    }
                                    isEditing={isEditing}
                                    sources={sources
                                        .setIn(
                                            ['ticket', 'customer'],
                                            selectedCustomer
                                        )
                                        .set('customer', selectedCustomer)}
                                    customer={selectedCustomer}
                                    widgets={widgets}
                                />
                                <MergeCustomersContainer
                                    isTicketContext={
                                        !(
                                            sources.get(
                                                'ticket',
                                                fromJS({})
                                            ) as Map<any, any>
                                        ).isEmpty()
                                    }
                                    display={showMergeCustomerModal}
                                    destinationCustomer={customer}
                                    sourceCustomer={selectedCustomer}
                                    onSuccess={() => {
                                        handleCustomerHistoryFetch()
                                        returnToCurrentCustomerProfile()
                                    }}
                                    onClose={() => {
                                        setShowMergeCustomerModal(false)
                                    }}
                                />
                            </ActionButtonContext.Provider>
                        </>
                    ) : mode === 'results' ? (
                        <>
                            <div className="m-3">
                                <Button
                                    type="button"
                                    onClick={() => resetSearch()}
                                >
                                    <i className="material-icons md-2 mr-2">
                                        arrow_back
                                    </i>
                                    Back
                                </Button>
                            </div>
                            <InfobarSearchResultsList
                                errorMessage={searchErrorMessage}
                                searchResults={searchResults}
                                defaultCustomerId={defaultCustomerId}
                                onCustomerClick={onSearchResultClick}
                            />
                        </>
                    ) : identifier ? (
                        <>
                            <InfobarCustomerInfo
                                actions={
                                    {
                                        cancelDrag,
                                        drag,
                                        drop,
                                        generateAndSetWidgets,
                                        removeEditedWidget,
                                        resetWidgets,
                                        setEditedWidgets,
                                        setEditionAsDirty,
                                        startWidgetEdition,
                                        stopWidgetEdition,
                                        updateEditedWidget,
                                    } as any
                                }
                                isEditing={isEditing}
                                sources={sources
                                    .setIn(['ticket', 'customer'], customer)
                                    .set('customer', customer)}
                                customer={customer}
                                widgets={widgets}
                            />
                            {!suggestedCustomer.isEmpty() && !isWidgetEditing && (
                                <div className="d-none d-md-block">
                                    <div
                                        className={css.infobarSectionSeparator}
                                    />
                                    <div
                                        className={classnames(
                                            css.suggestedCustomer
                                        )}
                                    >
                                        <h4>Is this the same person?</h4>
                                        <p>
                                            'We have found someone similar to
                                            the customer of this ticket. If it
                                            is the same person, merge them
                                            together to get a unified view of
                                            this customer.
                                        </p>
                                        <div style={{marginBottom: '30px'}}>
                                            <Button
                                                className="mr-2"
                                                type="button"
                                                color="primary"
                                                onClick={() => {
                                                    // TODO(customers-migration): ask confirmation to update this event
                                                    segmentTracker.logEvent(
                                                        segmentTracker.EVENTS
                                                            .USER_MERGE_CLICKED,
                                                        {
                                                            location:
                                                                'suggested user in infobar',
                                                        }
                                                    )
                                                    setShowMergeCustomerModal(
                                                        true
                                                    )
                                                }}
                                            >
                                                <i className="material-icons mr-1">
                                                    call_merge
                                                </i>
                                                Merge
                                            </Button>
                                        </div>
                                        <ActionButtonContext.Provider
                                            value={{
                                                actionError:
                                                    MERGE_ERROR_MESSAGE,
                                            }}
                                        >
                                            <InfobarCustomerInfo
                                                actions={
                                                    {
                                                        cancelDrag,
                                                        drag,
                                                        drop,
                                                        generateAndSetWidgets,
                                                        removeEditedWidget,
                                                        resetWidgets,
                                                        setEditedWidgets,
                                                        setEditionAsDirty,
                                                        startWidgetEdition,
                                                        stopWidgetEdition,
                                                        updateEditedWidget,
                                                    } as any
                                                }
                                                isEditing={isEditing}
                                                sources={sources
                                                    .setIn(
                                                        ['ticket', 'customer'],
                                                        suggestedCustomer
                                                    )
                                                    .set(
                                                        'customer',
                                                        suggestedCustomer
                                                    )}
                                                customer={suggestedCustomer}
                                                widgets={widgets}
                                                displayTabs={false}
                                            />
                                            <MergeCustomersContainer
                                                isTicketContext={
                                                    !(
                                                        sources.get(
                                                            'ticket',
                                                            fromJS({})
                                                        ) as Map<any, any>
                                                    ).isEmpty()
                                                }
                                                display={showMergeCustomerModal}
                                                destinationCustomer={customer}
                                                sourceCustomer={
                                                    suggestedCustomer
                                                }
                                                onSuccess={
                                                    handleCustomerHistoryFetch
                                                }
                                                onClose={() => {
                                                    setShowMergeCustomerModal(
                                                        false
                                                    )
                                                }}
                                            />
                                        </ActionButtonContext.Provider>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
                {isEditing && (
                    <InfobarWidgetsEditionTools
                        actions={{
                            startEditionMode,
                            submitWidgets,
                        }}
                        widgets={widgets}
                        context={currentContext}
                    />
                )}
            </div>
        </InfobarLayout>
    )
}

const connector = connect(null, {
    fetchCustomerHistory: customersActions.fetchCustomerHistory,
    searchCustomers: infobarActions.search,
    searchSimilarCustomer: infobarActions.similarCustomer,
    setCustomer,
})

export default connector(Infobar)
