import React, {
    Component,
    KeyboardEvent as KeyboardEventReact,
    ComponentClass,
} from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _debounce from 'lodash/debounce'
import {connect, ConnectedProps} from 'react-redux'
import {ContentState, EditorState} from 'draft-js'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'

import {clearMacroBeforeApply} from 'business/macro'
import {FeatureFlagKey} from 'config/featureFlags'
import {OrderDirection} from 'models/api/types'
import {
    FetchMacrosOptions,
    MacroSortableProperties,
    MacrosProperties,
} from 'models/macro/types'
import {MacroActionName} from 'models/macroAction/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {fetchMacros} from 'state/macro/actions'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from 'pages/common/utils/withCancellableRequest'
import {
    getCurrentMacro,
    getDefaultSelectedMacroId,
} from 'pages/tickets/common/macros/utils'
import shortcutManager from 'services/shortcutManager/index'
import {getPreferences} from 'state/currentUser/selectors'
import {setResponseText} from 'state/newMessage/actions'
import {getNewMessageType, isCacheAdded} from 'state/newMessage/selectors'
import {TopRankMacroState} from 'state/newMessage/ticketReplyCache'
import {getMacroParametersOptions} from 'state/macro/selectors'
import {notify} from 'state/notifications/actions'
import {applyMacro, clearAppliedMacro} from 'state/ticket/actions'
import {
    DEPRECATED_getTicket,
    getAppliedMacro,
    getTopRankMacroState,
    getLastMessage,
    getRuleSuggestionState,
} from 'state/ticket/selectors'
import {nestedReplace} from 'state/ticket/utils'
import {RootState} from 'state/types'

import PrefillMacroAlert from 'pages/tickets/detail/components/ReplyArea/PrefillMacroAlert'

import TicketMacros from './TicketMacros'
import TicketReply from './TicketReply'
import TicketMacrosSearch from './TicketMacrosSearch'
import css from './TicketReplyArea.less'

const CONTENT_STATE_PATH = ['state', 'contentState']
const PREFILL_TOP_MACRO_SCORE_THRESHOLD = 0.8

type Props = {
    currentUser: Map<any, any>
    ticket: Map<any, any>
    flags?: LDFlagSet
} & CancellableRequestInjectedProps<
    'fetchMacrosCancellable',
    'cancelFetchMacrosCancellable',
    typeof fetchMacros
> &
    ConnectedProps<typeof connector>

type State = {
    hasShownMacros: boolean
    isInitialMacrosLoading: boolean
    searchParams: FetchMacrosOptions
    searchResults: List<Map<any, any>>
    macrosVisible: boolean
    selectedMacroId: number | null
    shouldFocusEditor: boolean
    topRankMacro: Map<any, any> | null
    nextCursor: string | null
}

export class TicketReplyArea extends Component<Props, State> {
    richArea: Maybe<DEPRECATED_RichField>
    macroInput?: HTMLInputElement | null
    cacheAdded = false

    constructor(props: Props) {
        super(props)

        const hasLanguage = (
            this.props.macroParametersOptions?.toJS() as MacrosProperties
        )?.languages?.includes(this.props.ticket.get('language'))

        const languages =
            this.props.ticket.get('language') && hasLanguage
                ? [this.props.ticket.get('language'), null]
                : []

        this.state = {
            searchParams: {
                search: '',
                languages,
                orderBy: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
            },
            searchResults: fromJS([]),
            macrosVisible: false,
            selectedMacroId: null,
            isInitialMacrosLoading: false,
            shouldFocusEditor: false,
            hasShownMacros: false,
            topRankMacro: null,
            nextCursor: null,
        }
    }

    async componentDidMount() {
        const {flags} = this.props

        this.bindKeys()
        this.setState({isInitialMacrosLoading: true})
        await this.loadMacros({
            ...this.state.searchParams,
        })
        this.setState({isInitialMacrosLoading: false})

        if (flags && flags[FeatureFlagKey.PrefillBestMacro]) {
            this.checkTopRankMacro()
        }
    }

    applyTopRankMacro(macro: Map<any, any>, state: TopRankMacroState['state']) {
        void this.props.applyMacro(
            macro,
            this.props.currentTicket.get('id'),
            state === 'pending',
            {
                macroId: macro.get('id'),
                state: state,
            }
        )
        logEvent(SegmentEvent.TopRankMacro, {
            action: state === 'pending' ? 'applied' : state,
            user_id: this.props.currentUser.get('id'),
            ticketId: this.props.currentTicket.get('id'),
            macro: macro?.toJS(),
        })
    }

    checkTopRankMacro() {
        if (this.props.ruleSuggestionState === 'pending') {
            return
        }

        if (this.props.topRankMacroState?.state === 'pending') {
            this.setState({topRankMacro: this.props.appliedMacro})
            return
        }

        if (
            this.props.preferences?.getIn(['data', 'prefill_best_macro']) ===
            false
        )
            return

        const topRankMacro: Map<any, any> | undefined =
            this.state.searchResults.find(
                (macro) =>
                    macro?.get('relevance_rank') === 1 &&
                    macro?.get('score') > PREFILL_TOP_MACRO_SCORE_THRESHOLD
            )
        if (!topRankMacro) return

        const topRankMacroStateId = this.props.topRankMacroState?.['macroId']
        const topRankMacroId: number | undefined = topRankMacro?.get('id')
        if (
            topRankMacroStateId &&
            topRankMacroId &&
            topRankMacroStateId === topRankMacroId &&
            this.props.topRankMacroState?.state === 'rejected'
        ) {
            return
        }

        const hasMacroActions = (
            this.props.appliedMacro?.get('actions') as Map<
                string,
                Map<string, any>
            >
        )?.some(
            (action) => action?.get('name') !== MacroActionName.SetResponseText
        )

        if (hasMacroActions) return

        const contentState = this.props.newMessage.getIn(
            CONTENT_STATE_PATH
        ) as ContentState

        if (contentState?.hasText()) return

        this.applyTopRankMacro(topRankMacro, 'pending')
        this.hideMacros()

        const renderedTopRankMacro = topRankMacro.update(
            'actions',
            (actions: List<any>) => {
                return actions.map((action: Map<any, any>) => {
                    return action.update(
                        'arguments',
                        (args: List<any>) =>
                            nestedReplace(
                                args,
                                this.props.currentTicket,
                                this.props.currentUser
                            ) as List<any>
                    )
                })
            }
        )

        this.setState({topRankMacro: renderedTopRankMacro})
    }

    acceptTopRankMacro = () => {
        this.setState({topRankMacro: null})
        this.applyTopRankMacro(this.props.appliedMacro, 'accepted')
    }

    rejectTopRankMacro = () => {
        this.setState({topRankMacro: null})
        this.applyTopRankMacro(this.props.appliedMacro, 'rejected')

        const editorState = this.richArea?.state.editorState
        if (editorState) {
            const newState = EditorState.createEmpty()
            this.richArea?.setEditorState(newState)
        }

        this.props.clearAppliedMacro(this.props.ticket.get('id'))
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        const {shouldFocusEditor} = this.state

        if (this.props.cacheAdded && this.cacheAdded !== true) {
            this.showMacrosDefault()
            // only run once
            this.cacheAdded = true
        }

        if (
            // message type changed
            prevProps.newMessageType !== this.props.newMessageType &&
            this.props.newMessageType === 'internal-note'
        ) {
            // hide macros on internal-note
            this.hideMacros()
        }

        if (shouldFocusEditor && !prevState.shouldFocusEditor) {
            this.setState({shouldFocusEditor: false})
            if (this.richArea) {
                this.richArea.focusEditor()
            }
        }

        if (this.state.topRankMacro && this.props.appliedMacro) {
            const macroResponseText = (
                this.props.appliedMacro?.get('actions') as
                    | Immutable.Map<string, Map<string, any>>
                    | undefined
            )?.find(
                (action) =>
                    action?.get('name') === MacroActionName.SetResponseText
            )

            const macroBodyText = macroResponseText?.getIn([
                'arguments',
                'body_text',
            ]) as string | undefined

            const contentState = ContentState.createFromText(
                macroBodyText ?? ''
            )

            const newMessageBodyText: string | undefined =
                this.props.newMessage?.getIn(['newMessage', 'body_text'])

            if (
                contentState.getPlainText() !== newMessageBodyText ||
                !this.props.appliedMacro.equals(this.state.topRankMacro)
            ) {
                this.acceptTopRankMacro()
            }
        }
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    shouldDisplayQuickReply() {
        const showQuickReply = this.props.preferences
            ? (this.props.preferences.getIn(
                  ['data', 'show_macros_suggestions'],
                  true
              ) as boolean)
            : true

        return (
            this.state.searchResults.size > 0 &&
            (this.props.newMessage.getIn(['newMessage', 'body_text']) as string)
                .length < 3 &&
            !this.props.ticket.getIn(['state', 'appliedMacro']) &&
            !this.state.hasShownMacros &&
            showQuickReply
        )
    }

    showMacrosDefault = () => {
        // show macros depending on the show_macros preference
        const nextContextState = this.props.newMessage.getIn(
            CONTENT_STATE_PATH
        ) as ContentState
        const editorFocused = this.richArea && this.richArea.isFocused()

        // has any text
        const hasText = !!nextContextState && nextContextState.hasText()

        // default
        let showMacros = this.props.preferences.get('show_macros')

        // show/hide macros depending on the profile setting
        const preferences = (
            this.props.currentUser.get('settings') as List<any>
        ).find((s: Map<any, any>) => s.get('type') === 'preferences') as Map<
            any,
            any
        >

        const hasMacroActions = (
            this.props.appliedMacro?.get('actions') as Map<
                string,
                Map<string, any>
            >
        )?.some(
            (action) => action?.get('name') !== MacroActionName.SetResponseText
        )

        if (preferences) {
            showMacros = preferences.getIn(['data', 'show_macros'])
        }

        // toggle macros only if
        if (
            // show_macros preference is true
            showMacros &&
            // cache was added
            this.props.cacheAdded &&
            // message is email
            this.props.newMessageType === 'email' &&
            // editor doesn't have text
            !hasText &&
            // editor is not focused
            // fixes issues caused by the debounced setResponseText,
            // that causes the contentState to be set with a delay.
            !editorFocused &&
            !hasMacroActions
        ) {
            this.showMacros()
        }
    }

    loadMacros = async (
        searchParams: FetchMacrosOptions = {
            search: '',
        },
        retainPreviousResults = false
    ): Promise<void> => {
        const ticketId = this.props.currentTicket.get('id')
        let filters: FetchMacrosOptions = {}

        if (ticketId) {
            filters = {
                messageId: this.props.currentTicket.getIn([
                    'messages',
                    (this.props.currentTicket.get('messages') as List<any>)
                        .size - 1,
                    'id',
                ]),
                numberPredictions: 3,
                ticketId,
            }
        }

        const res = await this.props.fetchMacrosCancellable({
            ...searchParams,
            ...filters,
        })
        if (!res) {
            return
        }

        const newMacros = retainPreviousResults
            ? (this.state.searchResults.concat(
                  fromJS(res.data) as List<Map<any, any>>
              ) as List<Map<any, any>>)
            : (fromJS(res.data) as List<Map<any, any>>)

        const selectedMacroId = getDefaultSelectedMacroId(
            fromJS(res.data),
            this.state.selectedMacroId
        )
        return new Promise((resolve) => {
            this.setState(
                {
                    selectedMacroId,
                    searchResults: newMacros,
                    nextCursor: res.meta.next_cursor,
                },
                resolve
            )
        })
    }

    loadMacrosWithLogEvent = async (
        searchParams: FetchMacrosOptions,
        changedSearchParams: FetchMacrosOptions
    ): Promise<void> => {
        logEvent(SegmentEvent.TicketMacrosSearch, {
            ...searchParams,
            changed: Object.keys(changedSearchParams),
        })
        return await this.loadMacros(searchParams)
    }

    setSelectedMacroId = (macro: Map<any, any>) =>
        this.setState({selectedMacroId: macro.get('id')})

    bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            SHOW_MACROS: {
                action: (e) => {
                    e.preventDefault()
                    if (this.macroInput) {
                        this.macroInput.focus()
                    }
                },
            },
            BLUR_EVERYTHING: {
                action: () => {
                    this.hideMacrosAndFocusEditor()

                    if (document.activeElement) {
                        ;(document.activeElement as HTMLElement).blur()
                    }
                },
            },
            FOCUS_REPLY_AREA: {
                action: (e) => {
                    e.preventDefault()
                    this.hideMacrosAndFocusEditor()
                },
            },
            APPLY_QUICK_MACROS: {
                action: (e) => {
                    e.preventDefault()
                    if (this.shouldDisplayQuickReply()) {
                        const macros = this.state.searchResults
                        const macroIdx =
                            parseInt((e as KeyboardEvent).code.slice(-1)) - 1
                        if (macros.size > macroIdx) {
                            this.applyMacro(macros.get(macroIdx))
                        }
                    }
                },
            },
        })
    }

    handleSearchKeyDown = (e: KeyboardEventReact) => {
        const {searchResults} = this.state
        const macrosIds = searchResults
            .map((macro) => macro?.get('id') as number)
            .toList()
        const indexCurrentMacro = macrosIds.indexOf(this.state.selectedMacroId!)

        if (e.key === 'Escape' || e.key === 'Tab') {
            e.preventDefault()
            this.hideMacrosAndFocusEditor()
        }

        if (e.key === 'ArrowDown') {
            if (~indexCurrentMacro && indexCurrentMacro < macrosIds.size - 1) {
                e.preventDefault()
                const nextMacroIndex = indexCurrentMacro + 1
                this.setState({selectedMacroId: macrosIds.get(nextMacroIndex)})
            }
        }

        if (e.key === 'ArrowUp') {
            if (~indexCurrentMacro && indexCurrentMacro > 0) {
                e.preventDefault()
                const nextMacroIndex = indexCurrentMacro - 1
                this.setState({selectedMacroId: macrosIds.get(nextMacroIndex)})
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault()
            const macro = searchResults.find(
                (macro) => macro?.get('id') === this.state.selectedMacroId
            )
            if (macro) {
                this.applyMacro(macro)
            }
        }
    }

    debounceLoadMacrosWithLogEvent = _debounce(this.loadMacrosWithLogEvent, 350)

    searchMacros = (changedSearchParams: FetchMacrosOptions = {}) => {
        const searchParams = {
            ...this.state.searchParams,
            ...changedSearchParams,
        }

        this.setState({
            searchParams,
        })

        if (
            !searchParams.search?.trim().length ||
            searchParams.search.trim().length > 1
        ) {
            void this.debounceLoadMacrosWithLogEvent(
                searchParams,
                changedSearchParams
            )
        }
    }

    showMacros = () =>
        this.setState({macrosVisible: true, hasShownMacros: true})

    hideMacros = () => {
        this.setState({macrosVisible: false})
    }

    hideMacrosAndFocusEditor = () => {
        this.hideMacros()
        this.setState({shouldFocusEditor: true})
    }

    applyMacro = (macro: Map<any, any>) => {
        const {applyMacro, currentTicket, newMessageType, notify} = this.props

        const clearingResult = clearMacroBeforeApply(newMessageType, macro)
        if (clearingResult.notification) {
            void notify({
                message: clearingResult.notification.message,
                status: clearingResult.notification.status,
            })
        }

        void applyMacro(clearingResult.macro, currentTicket.get('id'))

        this.hideMacrosAndFocusEditor()
    }

    render() {
        const {
            searchParams,
            searchResults,
            isInitialMacrosLoading,
            macrosVisible,
            nextCursor,
        } = this.state
        const currentMacro = getCurrentMacro(
            this.state.searchResults,
            this.state.selectedMacroId
        )
        const {currentTicket, newMessageType} = this.props

        const requireCustomerSelection =
            !currentTicket.get('id') &&
            newMessageType === 'internal-note' &&
            currentTicket.get('customer') == null

        return (
            <div
                className={classnames(css.component, {
                    [css.macrosVisible]: this.state.macrosVisible,
                })}
            >
                <TicketMacrosSearch
                    setFocus={(input) => (this.macroInput = input)}
                    searchParams={searchParams}
                    macrosVisible={macrosVisible}
                    searchMacros={this.searchMacros}
                    showMacros={this.showMacros}
                    handleSearchKeyDown={this.handleSearchKeyDown}
                    requireCustomerSelection={requireCustomerSelection}
                    onClearMacro={this.hideMacrosAndFocusEditor}
                />
                <div className={css.content}>
                    {requireCustomerSelection ? (
                        <div
                            className={classnames(
                                css.replyAreaAlertMessage,
                                'alert-warning'
                            )}
                        >
                            <span>
                                To create a ticket with an internal note, please
                                <a
                                    href="https://docs.gorgias.com/ticket/internal-notes#create_a_ticket_with_an_internal_note"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {' '}
                                    set a customer{' '}
                                </a>
                                first in the infobar
                            </span>
                        </div>
                    ) : macrosVisible ? (
                        <TicketMacros
                            macros={searchResults}
                            isInitialMacrosLoading={isInitialMacrosLoading}
                            currentMacro={currentMacro}
                            selectMacro={this.setSelectedMacroId}
                            fetchMacros={this.loadMacros}
                            searchParams={{
                                ...searchParams,
                                cursor: this.state.nextCursor,
                            }}
                            applyMacro={this.applyMacro}
                            hasDataToLoad={!!nextCursor}
                        />
                    ) : (
                        <TicketReply
                            replyAreaFooter={
                                this.props.topRankMacroState?.state ===
                                    'pending' && (
                                    <PrefillMacroAlert
                                        onKeepMacro={this.acceptTopRankMacro}
                                        onRemoveMacro={this.rejectTopRankMacro}
                                    />
                                )
                            }
                            ticket={this.props.ticket}
                            appliedMacro={this.props.ticket.getIn([
                                'state',
                                'appliedMacro',
                            ])}
                            richAreaRef={(ref) => (this.richArea = ref)}
                            macros={this.state.searchResults}
                            applyMacro={this.applyMacro}
                            shouldDisplayQuickReply={this.shouldDisplayQuickReply()}
                        />
                    )}
                </div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        cacheAdded: isCacheAdded(state),
        currentTicket: DEPRECATED_getTicket(state),
        newMessage: state.newMessage,
        newMessageType: getNewMessageType(state),
        lastMessage: getLastMessage(state),
        preferences: getPreferences(state),
        macroParametersOptions: getMacroParametersOptions(state),
        appliedMacro: getAppliedMacro(state),
        topRankMacroState: getTopRankMacroState(state),
        ruleSuggestionState: getRuleSuggestionState(state),
    }),
    {
        applyMacro,
        clearAppliedMacro,
        notify,
        setResponseText,
    }
)

export default withCancellableRequest<
    'fetchMacrosCancellable',
    'cancelFetchMacrosCancellable',
    typeof fetchMacros
>(
    'fetchMacrosCancellable',
    fetchMacros
)(
    connector(
        withLDConsumer()(
            TicketReplyArea as any as ComponentClass<Omit<Props, 'flags'>>
        )
    )
)
