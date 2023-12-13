import React, {KeyboardEvent, useEffect, useMemo, useState} from 'react'
import classnames from 'classnames'
import {useLocation} from 'react-router-dom'
import {fromJS, List, Map} from 'immutable'
import {AxiosError, CancelToken} from 'axios'

import {logEvent, SegmentEvent} from 'common/segment'
import {isAdmin} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {getCurrentUser} from 'state/currentUser/selectors'
import * as infobarActions from 'state/infobar/actions'
import * as infobarConstants from 'state/infobar/constants'
import * as customersActions from 'state/customers/actions'
import {setCustomer} from 'state/ticket/actions'
import * as widgetsActions from 'state/widgets/actions'
import history from 'pages/history'
import {WidgetContextType} from 'state/widgets/types'
import {ApiListResponsePagination} from 'models/api/types'
import {Customer} from 'models/customer/types'
import Loader from 'pages/common/components/Loader/Loader'
import Tooltip from 'pages/common/components/Tooltip'
import InfobarLayout from 'pages/common/components/infobar/InfobarLayout'
import MergeCustomersContainer from 'pages/common/components/MergeCustomers/MergeCustomersContainer'
import Search from 'pages/common/components/Search'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import {areSourcesReady} from 'pages/common/components/infobar/utils'
import css from 'pages/common/components/infobar/Infobar.less'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import usePrevious from 'hooks/usePrevious'
import useUpdateEffect from 'hooks/useUpdateEffect'
import {SearchResponse} from 'models/search/types'
import {setActiveCustomerAsReceiver} from 'state/newMessage/actions'

import useAppSelector from 'hooks/useAppSelector'
import InfobarSearchResultsList from './InfobarSearchResultsList'
import InfobarCustomerInfo from './InfobarCustomerInfo/InfobarCustomerInfo'
import InfobarWidgetsEditionTools from './InfobarWidgetsEditionTools'
import InfobarCustomerActions from './InfobarCustomerActions'
import {ActionButtonContext} from './InfobarCustomerInfo/InfobarWidgets/widgets/ActionButton'

type Props = {
    context: WidgetContextType
    customer: Map<any, any>
    identifier?: string
    isRouteEditingWidgets: boolean
    sources: Map<any, any>
    widgets: Map<any, any>
    isOnNewLayout?: boolean
}

const MERGE_ERROR_MESSAGE = `You can only edit customers and orders of the customer associated with this ticket.
To edit this customer or order, merge both customers or change the customer associated with this ticket.`

export const Infobar = ({
    context,
    customer = fromJS({}),
    identifier,
    isRouteEditingWidgets,
    sources,
    widgets,
    isOnNewLayout,
}: Props) => {
    const location = useLocation()
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(
        null
    )
    const [isSearching, setIsSearching] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const [isFetchingCustomer, setIsFetchingCustomer] = useState(false)
    const [displaySearchResults, setDisplaySearchResults] = useState(false)
    const [displaySelectedCustomer, setDisplaySelectedCustomer] =
        useState(false)
    const [showMergeCustomerModal, setShowMergeCustomerModal] = useState(false)
    const [searchResults, setSearchResults] = useState<List<any>>(fromJS([]))
    const [selectedCustomer, setSelectedCustomer] = useState(fromJS({}))
    const [suggestedCustomer, setSuggestedCustomer] = useState<Map<any, any>>(
        fromJS({})
    )
    const prevCustomer = usePrevious(customer)
    const searchRank = useSearchRankScenario(SearchRankSource.CustomerProfile)

    const isWidgetEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets]
    )
    const isEditing = useMemo(
        () => isWidgetEditing && isRouteEditingWidgets,
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    useUpdateEffect(() => {
        resetSearch()
    }, [identifier])

    useEffect(() => {
        if (isRouteEditingWidgets && !isWidgetEditing) {
            dispatch(widgetsActions.startEditionMode(context))
        } else if (!isRouteEditingWidgets && isWidgetEditing) {
            dispatch(widgetsActions.stopEditionMode())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWidgetEditing, isRouteEditingWidgets])

    // if customer changed then try to find a suggestion of other customer to merge with it
    useEffect(() => {
        if (!prevCustomer || !prevCustomer.equals(customer)) {
            void updateSimilarCustomer()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer, prevCustomer])

    const [cancellableSearch] = useCancellableRequest(
        (cancelToken: CancelToken) => async (query) =>
            await dispatch(infobarActions.search(query, cancelToken))
    )

    const updateSimilarCustomer = async () => {
        if (customer.isEmpty() || !customer.get('id')) {
            setSuggestedCustomer(fromJS({}))
            return
        }

        const data = (await dispatch(
            infobarActions.similarCustomer(customer.get('id'))
        )) as {
            customer: Customer
        }
        if (!data) {
            setSuggestedCustomer(fromJS({}))
            return
        }
        const {customer: suggestion} = data
        const suggestionImmutable = fromJS(suggestion || {}) as Map<any, any>

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

    const onSearchResultClick = async (
        customer: Map<any, any>,
        index: number
    ) => {
        searchRank.registerResultSelection({index, id: customer.get('id')})
        setIsFetchingCustomer(true)
        const result = (await dispatch(
            infobarActions.fetchPreviewCustomer(customer.get('id'))
        )) as {
            type: string
            resp: ApiListResponsePagination<Customer[]>
        }
        if (result?.type === infobarConstants.FETCH_PREVIEW_CUSTOMER_SUCCESS) {
            setDisplaySelectedCustomer(true)
            setSelectedCustomer(fromJS(result.resp))
        }
        setIsFetchingCustomer(false)
    }

    const handleKeyDown = async (event: KeyboardEvent, query: string) => {
        if (event.key !== 'Enter') {
            return
        }

        searchRank.endScenario()
        if (query) {
            searchRank.registerResultsRequest({
                query,
                requestTime: Date.now(),
            })
            setIsSearching(true)
            const res = (await cancellableSearch(query)) as {
                error?: AxiosError<{error?: {message: string}}>
                resp: SearchResponse<Customer>
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

            searchRank.registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: !error ? resp.data.length : 0,
                searchEngine: !error ? resp.searchEngine : undefined,
            })
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
            void dispatch(
                customersActions.fetchCustomerHistory(askedCustomerId, {
                    successCondition: () => {
                        return (
                            (customer.get('id') as number).toString() ===
                            askedCustomerId.toString()
                        )
                    },
                })
            )
        }, 1500)
    }

    const resetSearch = () => {
        setDisplaySearchResults(false)
        setSearchResults(fromJS([]))
        searchRank.endScenario()
    }

    const resetSelected = () => {
        setDisplaySelectedCustomer(false)
        setSelectedCustomer(fromJS({}))
    }

    // reset search and display current customer
    const returnToCurrentCustomerProfile = () => {
        resetSearch()
        resetSelected()
        onChange('')
    }

    const onChange = (term: string) => {
        setSearchTerm(term)
    }

    const handleSetCustomer = () => {
        void dispatch(setCustomer(selectedCustomer))
            .then(returnToCurrentCustomerProfile)
            .then(() => dispatch(setActiveCustomerAsReceiver()))
    }

    const hasFetchedWidgets = widgets.getIn(['_internal', 'hasFetchedWidgets'])

    const currentContext = widgets.get('currentContext', '')

    const canEditWidgets =
        hasFetchedWidgets &&
        areSourcesReady(sources, currentContext) &&
        !displaySelectedCustomer

    return (
        <InfobarLayout
            isOnNewLayout={isOnNewLayout}
            className={classnames({
                [css.editing]: isEditing,
            })}
        >
            <div className={css.infobarContent}>
                <div className={css.infobarSearchWrapper}>
                    <Search
                        tabIndex={10}
                        placeholder="Search for customers by email, order number, etc."
                        onKeyDown={handleKeyDown}
                        style={{maxWidth: 'none'}}
                        onChange={onChange}
                        value={searchTerm}
                    />
                    {isAdmin(currentUser) && (
                        <>
                            <IconButton
                                className={classnames(
                                    'd-none d-md-inline-block ml-2 btn-transparent'
                                )}
                                id="toggle-widgets-edition-button"
                                intent="secondary"
                                isDisabled={!canEditWidgets}
                                onClick={toggleEditionMode}
                            >
                                settings
                            </IconButton>
                            <Tooltip
                                placement="left"
                                target="toggle-widgets-edition-button"
                            >
                                {isEditing
                                    ? 'Exit widgets editing'
                                    : 'Edit widgets'}
                            </Tooltip>
                        </>
                    )}
                </div>
                <div className={css.content}>
                    {mode === 'loading' ? (
                        <Loader />
                    ) : mode === 'selected' ? (
                        <>
                            <div className="m-3">
                                <Button
                                    className={css.selectionBackButton}
                                    intent="secondary"
                                    onClick={resetSelected}
                                >
                                    <ButtonIconLabel icon="arrow_back">
                                        Back
                                    </ButtonIconLabel>
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
                                    isEditing={isEditing}
                                    widgets={widgets}
                                    sources={sources
                                        .setIn(
                                            ['ticket', 'customer'],
                                            selectedCustomer
                                        )
                                        .set('customer', selectedCustomer)}
                                    customer={selectedCustomer}
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
                                    intent="secondary"
                                    onClick={() => resetSearch()}
                                >
                                    <ButtonIconLabel icon="arrow_back">
                                        Back
                                    </ButtonIconLabel>
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
                                isEditing={isEditing}
                                widgets={widgets}
                                sources={sources}
                                customer={customer}
                            />
                            {!suggestedCustomer.isEmpty() && !isWidgetEditing && (
                                <>
                                    <div className="d-none d-md-block">
                                        <div
                                            className={
                                                css.infobarSectionSeparator
                                            }
                                        />
                                        <div className={css.suggestedCustomer}>
                                            <h4>Merge customer profiles?</h4>
                                            <p>
                                                Another customer profile looks
                                                similar to this one. Merging
                                                customer profiles gives you a
                                                unified customer view.
                                            </p>
                                            <Button
                                                className="mr-2"
                                                onClick={() => {
                                                    // TODO(customers-migration): ask confirmation to update this event
                                                    logEvent(
                                                        SegmentEvent.UserMergeClicked,
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
                                                <ButtonIconLabel icon="call_merge">
                                                    Merge
                                                </ButtonIconLabel>
                                            </Button>
                                        </div>
                                    </div>
                                    <ActionButtonContext.Provider
                                        value={{
                                            actionError: MERGE_ERROR_MESSAGE,
                                        }}
                                    >
                                        <InfobarCustomerInfo
                                            isEditing={isEditing}
                                            widgets={widgets}
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
                                            sourceCustomer={suggestedCustomer}
                                            onSuccess={
                                                handleCustomerHistoryFetch
                                            }
                                            onClose={() => {
                                                setShowMergeCustomerModal(false)
                                            }}
                                        />
                                    </ActionButtonContext.Provider>
                                </>
                            )}
                        </>
                    ) : null}
                </div>
                {isEditing && (
                    <InfobarWidgetsEditionTools
                        widgets={widgets}
                        context={currentContext}
                    />
                )}
            </div>
        </InfobarLayout>
    )
}

export default Infobar
