import { KeyboardEvent, useEffect, useMemo, useState } from 'react'

import { usePrevious, useUpdateEffect } from '@repo/hooks'
import { InfobarTicketDetails } from '@repo/tickets'
import classnames from 'classnames'
import { fromJS, Map } from 'immutable'
import { useLocation } from 'react-router-dom'

import { Tooltip } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Customer } from 'models/customer/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import css from 'pages/common/components/infobar/Infobar.less'
import InfobarCustomerActions from 'pages/common/components/infobar/Infobar/InfobarCustomerActions'
import InfobarCustomerInfo from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import { ActionButtonContext } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButton'
import { InfobarSearchResultsList } from 'pages/common/components/infobar/Infobar/InfobarSearchResultsList'
import InfobarWidgetsEditionTools from 'pages/common/components/infobar/Infobar/InfobarWidgetsEditionTools'
import { useCustomerSearch } from 'pages/common/components/infobar/Infobar/useCustomerSearch'
import { useSelectedCustomer } from 'pages/common/components/infobar/Infobar/useSelectedCustomer'
import InfobarLayout from 'pages/common/components/infobar/InfobarLayout'
import { areSourcesReady } from 'pages/common/components/infobar/utils'
import Loader from 'pages/common/components/Loader/Loader'
import MergeCustomersContainer from 'pages/common/components/MergeCustomers/MergeCustomersContainer'
import Search from 'pages/common/components/Search'
import history from 'pages/history'
import { getCurrentUser } from 'state/currentUser/selectors'
import * as infobarActions from 'state/infobar/actions'
import { setActiveCustomerAsReceiver } from 'state/newMessage/actions'
import { setCustomer } from 'state/ticket/actions'
import * as widgetsActions from 'state/widgets/actions'
import { WidgetEnvironment } from 'state/widgets/types'
import { isAdmin } from 'utils'

type Props = {
    context: WidgetEnvironment
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
    const hasUIVisionMS1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const location = useLocation()
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)

    const [showMergeCustomerModal, setShowMergeCustomerModal] = useState(false)
    const [suggestedCustomer, setSuggestedCustomer] = useState<Map<any, any>>(
        fromJS({}),
    )
    const prevCustomer = usePrevious(customer)

    const isWidgetEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets],
    )
    const isEditing = useMemo(
        () => isWidgetEditing && isRouteEditingWidgets,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isWidgetEditing],
    )
    const {
        isSearching,
        displaySearchResults,
        searchRank,
        searchTerm,
        searchErrorMessage,
        searchResults,
        resetSearch,
        setSearchTerm,
        onSearchSubmit,
    } = useCustomerSearch()
    const {
        displaySelectedCustomer,
        isFetchingCustomer,
        selectedCustomer,
        setSelectedCustomer,
        onSearchResultClick,
        setDisplaySelectedCustomer,
    } = useSelectedCustomer(searchRank)

    const handleKeyDown = async (event: KeyboardEvent, query: string) => {
        if (event.key !== 'Enter') {
            return
        }

        if (query) {
            await onSearchSubmit(query)
            setDisplaySelectedCustomer(false)
        } else {
            resetSearch()
        }
    }

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
        [sources],
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

    const updateSimilarCustomer = async () => {
        if (customer.isEmpty() || !customer.get('id')) {
            setSuggestedCustomer(fromJS({}))
            return
        }

        const data = (await dispatch(
            infobarActions.similarCustomer(customer.get('id')),
        )) as {
            customer: Customer
        }
        if (!data) {
            setSuggestedCustomer(fromJS({}))
            return
        }
        const { customer: suggestion } = data
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
                `/app/${context}/${identifier}/edit-widgets${location.search}`,
            )
        }
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
                {hasUIVisionMS1 && <InfobarTicketDetails />}
                <div className={css.infobarSearchWrapper}>
                    <Search
                        className={css.infobarSearch}
                        tabIndex={10}
                        placeholder="Search for customers by email, order number, etc."
                        onKeyDown={handleKeyDown}
                        onChange={onChange}
                        value={searchTerm}
                    />
                    {isAdmin(currentUser) && (
                        <>
                            <IconButton
                                className={classnames(
                                    'd-none d-md-inline-block ml-2 btn-transparent',
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
                                    leadingIcon="arrow_back"
                                >
                                    Back
                                </Button>
                                <InfobarCustomerActions
                                    customer={customer}
                                    sources={sources}
                                    selectedCustomer={selectedCustomer}
                                    toggleMergeCustomerModal={(
                                        showMergeCustomerModal: boolean,
                                    ) =>
                                        setShowMergeCustomerModal(
                                            showMergeCustomerModal,
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
                                            selectedCustomer,
                                        )
                                        .set('customer', selectedCustomer)}
                                    customer={selectedCustomer}
                                />
                                <MergeCustomersContainer
                                    isTicketContext={
                                        !(
                                            sources.get(
                                                'ticket',
                                                fromJS({}),
                                            ) as Map<any, any>
                                        ).isEmpty()
                                    }
                                    display={showMergeCustomerModal}
                                    destinationCustomer={customer}
                                    sourceCustomer={selectedCustomer}
                                    onSuccess={() => {
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
                                    leadingIcon="arrow_back"
                                >
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
                                isEditing={isEditing}
                                widgets={widgets}
                                sources={sources}
                                customer={customer}
                            />
                            {!suggestedCustomer.isEmpty() &&
                                !isWidgetEditing && (
                                    <>
                                        <div className="d-none d-md-block">
                                            <div
                                                className={
                                                    css.infobarSectionSeparator
                                                }
                                            />
                                            <div
                                                className={
                                                    css.suggestedCustomer
                                                }
                                            >
                                                <h4>
                                                    Merge customer profiles?
                                                </h4>
                                                <p>
                                                    Another customer profile
                                                    looks similar to this one.
                                                    Merging customer profiles
                                                    gives you a unified customer
                                                    view.
                                                </p>
                                                <Button
                                                    className="mr-2"
                                                    onClick={() => {
                                                        logEvent(
                                                            SegmentEvent.CustomerMergeClicked,
                                                            {
                                                                location:
                                                                    'infobar',
                                                                account_domain:
                                                                    window
                                                                        .GORGIAS_STATE
                                                                        .currentAccount
                                                                        .domain,
                                                                user_id:
                                                                    window
                                                                        .GORGIAS_STATE
                                                                        .currentAccount
                                                                        .id,
                                                                timestamp:
                                                                    Date.now(),
                                                            },
                                                        )
                                                        setShowMergeCustomerModal(
                                                            true,
                                                        )
                                                    }}
                                                    leadingIcon="call_merge"
                                                >
                                                    Merge
                                                </Button>
                                            </div>
                                        </div>
                                        <ActionButtonContext.Provider
                                            value={{
                                                actionError:
                                                    MERGE_ERROR_MESSAGE,
                                            }}
                                        >
                                            <InfobarCustomerInfo
                                                isEditing={isEditing}
                                                widgets={widgets}
                                                sources={sources
                                                    .setIn(
                                                        ['ticket', 'customer'],
                                                        suggestedCustomer,
                                                    )
                                                    .set(
                                                        'customer',
                                                        suggestedCustomer,
                                                    )}
                                                customer={suggestedCustomer}
                                                displayTabs={false}
                                            />
                                            <MergeCustomersContainer
                                                isTicketContext={
                                                    !(
                                                        sources.get(
                                                            'ticket',
                                                            fromJS({}),
                                                        ) as Map<any, any>
                                                    ).isEmpty()
                                                }
                                                display={showMergeCustomerModal}
                                                destinationCustomer={customer}
                                                sourceCustomer={
                                                    suggestedCustomer
                                                }
                                                onClose={() => {
                                                    setShowMergeCustomerModal(
                                                        false,
                                                    )
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
