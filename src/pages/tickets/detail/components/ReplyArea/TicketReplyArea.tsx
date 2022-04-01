import React, {Component, KeyboardEvent as KeyboardEventReact} from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _debounce from 'lodash/debounce'
import {connect, ConnectedProps} from 'react-redux'
import {ContentState} from 'draft-js'

import {clearMacroBeforeApply} from 'business/macro'
import RichField from 'pages/common/forms/RichField/RichField'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from 'pages/common/utils/withCancellableRequest'
import {
    getCurrentMacro,
    getDefaultSelectedMacroId,
} from 'pages/tickets/common/macros/utils'
import shortcutManager from 'services/shortcutManager/index'
import {getPreferences} from 'state/currentUser/selectors'
import {fetchMacros, fetchMacrosParamsTypes} from 'state/macro/actions'
import {getNewMessageType, isCacheAdded} from 'state/newMessage/selectors'
import {notify} from 'state/notifications/actions'
import {applyMacro} from 'state/ticket/actions'
import {DEPRECATED_getTicket} from 'state/ticket/selectors'
import {RootState} from 'state/types'

import TicketMacros from './TicketMacros'
import TicketReply from './TicketReply'
import css from './TicketReplyArea.less'

const CONTENT_STATE_PATH = ['state', 'contentState']

type Props = {
    currentUser: Map<any, any>
    ticket: Map<any, any>
} & CancellableRequestInjectedProps<
    'fetchMacrosCancellable',
    'cancelFetchMacrosCancellable',
    typeof fetchMacros
> &
    ConnectedProps<typeof connector>

type State = {
    hasShownMacros: boolean
    isInitialMacrosLoading: boolean
    macros: List<any>
    macroSearchQuery: string
    macrosVisible: boolean
    page: number
    selectedMacroId?: Maybe<number>
    shouldFocusEditor: boolean
    totalPages: number
}

export class TicketReplyArea extends Component<Props, State> {
    richArea: Maybe<RichField>
    macroInput?: HTMLInputElement | null
    cacheAdded = false

    constructor(props: Props) {
        super(props)

        this.state = {
            macros: fromJS([]),
            page: 1,
            totalPages: 1,
            macrosVisible: false,
            macroSearchQuery: '',
            selectedMacroId: undefined,
            isInitialMacrosLoading: false,
            shouldFocusEditor: false,
            hasShownMacros: false,
        }
    }

    async componentDidMount() {
        this.bindKeys()
        this.setState({isInitialMacrosLoading: true})
        await this.loadMacros()
        this.setState({isInitialMacrosLoading: false})
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
            this.state.macros.size > 0 &&
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
            !editorFocused
        ) {
            this.showMacros()
        }
    }

    loadMacros = async ({
        search = '',
        page = 1,
    }: fetchMacrosParamsTypes = {}): Promise<void> => {
        const ticketId = this.props.currentTicket.get('id')
        const commonFilters = {
            currentMacros: this.state.macros,
            currentPage: this.state.page,
            search,
            page,
        }
        const orderDir = 'desc'
        let orderBy = 'usage'
        let filters = {}

        if (ticketId) {
            orderBy = 'relevance'
            filters = {
                ticketId: this.props.currentTicket.get('id'),
                messageId: this.props.currentTicket.getIn([
                    'messages',
                    (this.props.currentTicket.get('messages') as List<any>)
                        .size - 1,
                    'id',
                ]),
                _fallbackOrderBy: 'usage',
            }
        }

        const res = await this.props.fetchMacrosCancellable(
            {...filters, ...commonFilters},
            orderBy,
            orderDir
        )
        if (!res) {
            return
        }
        const selectedMacroId = getDefaultSelectedMacroId(
            res.macros,
            this.state.selectedMacroId
        )
        return new Promise((resolve) => {
            this.setState(
                {
                    selectedMacroId,
                    macros: res.macros,
                    page: res.page,
                    totalPages: res.totalPages,
                },
                resolve
            )
        })
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
                        const macros = this.state.macros
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
        const {macros} = this.state
        const macrosIds = macros
            .map((macro: Map<any, any>) => macro.get('id') as number)
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
            const macro = macros.find(
                (macro: Map<any, any>) =>
                    macro.get('id') === this.state.selectedMacroId
            )
            if (macro) {
                this.applyMacro(macro)
            }
        }
    }

    debounceLoadMacros = _debounce(this.loadMacros, 350)

    searchMacros = (e: {target: {value: string}}) => {
        const search = e.target.value || ''
        this.setState({macroSearchQuery: search})

        if (!search.trim().length || search.trim().length > 1) {
            void this.debounceLoadMacros({search, page: 1})
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
            totalPages,
            macros,
            macroSearchQuery,
            isInitialMacrosLoading,
            macrosVisible,
            page,
        } = this.state
        const currentMacro = getCurrentMacro(
            this.state.macros,
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
                <div className={css.search}>
                    <i
                        className={classnames(
                            css.searchIcon,
                            'material-icons md-2 text-info'
                        )}
                    >
                        bolt
                    </i>
                    <input
                        ref={(macroInput) => (this.macroInput = macroInput)}
                        className={css.input}
                        tabIndex={3}
                        onChange={this.searchMacros}
                        onKeyDown={this.handleSearchKeyDown}
                        onFocus={this.showMacros}
                        placeholder="Search macros by name, tags or body..."
                        disabled={requireCustomerSelection}
                    />
                </div>
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
                            macros={macros}
                            page={page}
                            isInitialMacrosLoading={isInitialMacrosLoading}
                            totalPages={totalPages}
                            currentMacro={currentMacro}
                            selectMacro={this.setSelectedMacroId}
                            fetchMacros={this.loadMacros}
                            searchQuery={macroSearchQuery}
                            onClearMacro={this.hideMacrosAndFocusEditor}
                            applyMacro={this.applyMacro}
                        />
                    ) : (
                        <TicketReply
                            ticket={this.props.ticket}
                            appliedMacro={this.props.ticket.getIn([
                                'state',
                                'appliedMacro',
                            ])}
                            richAreaRef={(ref) => (this.richArea = ref)}
                            macros={this.state.macros}
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
        preferences: getPreferences(state),
    }),
    {
        applyMacro,
        notify,
    }
)

export default withCancellableRequest<
    'fetchMacrosCancellable',
    'cancelFetchMacrosCancellable',
    typeof fetchMacros
>(
    'fetchMacrosCancellable',
    fetchMacros
)(connector(TicketReplyArea))
