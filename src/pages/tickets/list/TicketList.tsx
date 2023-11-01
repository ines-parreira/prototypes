import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {Link, useHistory, useLocation, useParams} from 'react-router-dom'
import decorateComponentWithProps from 'decorate-component-with-props'
import _noop from 'lodash/noop'

import {logEvent, SegmentEvent} from 'common/segment'
import LocalForageManager from 'services/localForageManager/localForageManager'
import Button from 'pages/common/components/button/Button'
import {fetchTags} from 'state/tags/actions'
import {getTickets} from 'state/tickets/selectors'
import {
    getActiveView,
    hasActiveView as getHasActiveView,
    getSelectedItemsIds,
} from 'state/views/selectors'
import {compactInteger} from 'utils'
import {isCreationUrl, isSearchUrl} from 'pages/common/utils/url'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import SearchRankScenarioProvider from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider'
import {SearchRankSource} from 'hooks/useSearchRankScenario'
import {
    DRAFT_TICKET_STORE,
    isTicketDraftEmpty,
    TicketDraft,
} from 'hooks/useTicketDraft'
import useTitle from 'hooks/useTitle'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'

import TicketListActions from './components/TicketListActions'
import css from './TicketList.less'

const TicketList = () => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const hasActiveView = useAppSelector(getHasActiveView)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)
    const tickets = useAppSelector(getTickets)

    const localForageRef = useRef<LocalForage>()
    if (!localForageRef.current) {
        localForageRef.current = LocalForageManager.getTable(DRAFT_TICKET_STORE)
    }
    const localForage = localForageRef.current

    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)
    const [hasDraft, setHasDraft] = useState(false)
    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const {pathname} = useLocation()
    const history = useHistory()
    const params = useParams<{viewId?: string}>()
    const isSearch = useMemo(() => isSearchUrl(pathname, 'tickets'), [pathname])
    const isUpdate = useMemo(
        () => !isCreationUrl(pathname, 'tickets'),
        [pathname]
    )
    const isEditMode = useMemo(
        () => activeView.get('editMode') as boolean,
        [activeView]
    )
    const currentUser = useAppSelector(getCurrentUser)

    useEffect(() => {
        void dispatch(fetchTags())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const title = useMemo(() => {
        let title = 'Loading...'

        if (!isUpdate) {
            title = 'New view'
        } else if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(
                    activeView.get('count', 0)
                )}) ${title}`
            }
        } else {
            title = 'Wrong view'
        }

        if (isSearch) {
            title = 'Search'
        }
        return title
    }, [activeView, hasActiveView, isSearch, isUpdate])

    useEffect(() => {
        const checkDraft = async () => {
            const draft = (await localForage.getItem('new')) as TicketDraft
            setHasDraft(!isTicketDraftEmpty(draft))
        }
        void checkDraft()
    }, [localForage])

    const handleResumeDraft = useCallback(() => {
        history.push('/app/ticket/new')
        logEvent(SegmentEvent.DraftTicket, {
            type: 'resume',
            user_id: currentUser.get('id'),
        })
    }, [currentUser, history])

    const handleDiscardDraft = useCallback(async () => {
        await localForage.clear()
        history.push('/app/ticket/new')
        logEvent(SegmentEvent.DraftTicket, {
            type: 'discard',
            user_id: currentUser.get('id'),
        })
    }, [currentUser, history, localForage])

    useTitle(title)

    const viewTable = (
        <ViewTable
            className={css.table}
            type="ticket"
            items={tickets}
            isUpdate={isUpdate}
            isSearch={isSearch}
            urlViewId={params.viewId}
            ActionsComponent={decorateComponentWithProps<
                ComponentProps<typeof TicketListActions>,
                {openMacroModal: () => void}
            >(TicketListActions, {
                openMacroModal: () => setIsMacroModalOpen(true),
            })}
            viewButtons={
                !isEditMode && (
                    <>
                        {!hasDraft ? (
                            <div className="d-inline-flex align-items-center">
                                <Link to="/app/ticket/new">
                                    <Button>Create ticket</Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <DropdownButton
                                    color="primary"
                                    fillStyle="fill"
                                    onToggleClick={_noop}
                                    size="medium"
                                    ref={dropdownTargetRef}
                                >
                                    Create ticket
                                </DropdownButton>
                                <UncontrolledDropdown
                                    target={dropdownTargetRef}
                                    placement="bottom-end"
                                >
                                    <DropdownBody>
                                        <DropdownItem
                                            option={{
                                                label: 'Resume draft',
                                                value: 'resume',
                                            }}
                                            onClick={handleResumeDraft}
                                            shouldCloseOnSelect
                                        />

                                        <DropdownItem
                                            option={{
                                                label: 'Discard and create new ticket',
                                                value: 'discard',
                                            }}
                                            onClick={handleDiscardDraft}
                                            shouldCloseOnSelect
                                        />
                                    </DropdownBody>
                                </UncontrolledDropdown>
                            </>
                        )}
                    </>
                )
            }
        />
    )

    return (
        <div
            className="d-flex flex-column"
            style={{
                width: '100%',
            }}
        >
            {isSearch ? (
                <SearchRankScenarioProvider
                    source={SearchRankSource.TicketsView}
                >
                    {viewTable}
                </SearchRankScenarioProvider>
            ) : (
                viewTable
            )}

            {isMacroModalOpen && (
                <MacroContainer
                    activeView={activeView}
                    disableExternalActions
                    selectedItemsIds={selectedItemsIds}
                    closeModal={() => setIsMacroModalOpen(false)}
                    selectionMode
                />
            )}
        </div>
    )
}

export default TicketList
