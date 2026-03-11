import type { KeyboardEvent as KeyboardEventReact } from 'react'
import React, { Component } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import { ContentState, EditorState } from 'draft-js'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import type { Macro } from '@gorgias/helpdesk-queries'

import { clearMacroBeforeApply } from 'business/macro'
import type { MacrosProperties } from 'models/macro/types'
import { MacroActionName } from 'models/macroAction/types'
import type RichField from 'pages/common/forms/RichField/RichField'
import {
    getCurrentMacro,
    getDefaultSelectedMacroId,
} from 'pages/tickets/common/macros/utils'
import PrefillMacroAlert from 'pages/tickets/detail/components/ReplyArea/PrefillMacroAlert'
import { getPreferences } from 'state/currentUser/selectors'
import { getNewMessageType, isCacheAdded } from 'state/newMessage/selectors'
import type { TopRankMacroState } from 'state/newMessage/ticketReplyCache'
import { notify } from 'state/notifications/actions'
import { applyMacro, clearAppliedMacro } from 'state/ticket/actions'
import {
    DEPRECATED_getTicket,
    getAppliedMacro,
    getInTicketSuggestionState,
    getTopRankMacroState,
} from 'state/ticket/selectors'
import type { RootState } from 'state/types'
import { nestedReplace } from 'tickets/common/utils'

import TicketMacros from './TicketMacros'
import TicketMacrosSearch from './TicketMacrosSearch'
import TicketReply from './TicketReply'

import css from './TicketReplyArea.less'

const CONTENT_STATE_PATH = ['state', 'contentState']
const PREFILL_TOP_MACRO_SCORE_THRESHOLD = 0.8

type Props = {
    filters: MacrosProperties
    hasAutomate: boolean
    hasShownMacros: boolean
    isMacrosLoading: boolean
    isMacrosActive: boolean
    loadMacros: () => Promise<any>
    macros: Macro[]
    nextCursor?: string
    query: string
    onChangeFilters: (filters: MacrosProperties) => void
    onChangeMacrosActive: (isActive?: boolean) => void
    onChangeQuery: (query: string) => void
} & ConnectedProps<typeof connector>

type State = {
    selectedMacroId: number | null
    shouldFocusEditor: boolean
    topRankMacro: Map<any, any> | null
}

export class TicketReplyArea extends Component<Props, State> {
    richArea: Maybe<RichField>
    macroInput?: HTMLInputElement | null
    cacheAdded = false

    constructor(props: Props) {
        super(props)

        this.state = {
            selectedMacroId: null,
            shouldFocusEditor: false,
            topRankMacro: null,
        }
    }

    componentDidMount() {
        this.bindKeys()
    }

    applyTopRankMacro(
        macro: Map<any, any> | null,
        state: TopRankMacroState['state'],
    ) {
        if (!macro) return
        void this.props.applyMacro(
            macro,
            this.props.currentTicket.get('id'),
            state === 'pending',
            {
                macroId: macro.get('id'),
                state: state,
            },
        )
        logEvent(SegmentEvent.TopRankMacro, {
            action: state === 'pending' ? 'applied' : state,
            user_id: this.props.currentUser.get('id'),
            ticketId: this.props.currentTicket.get('id'),
            macro: macro?.toJS(),
        })
    }

    checkTopRankMacro() {
        if (
            this.props.hasAutomate &&
            this.props.inTicketSuggestionState === 'pending'
        ) {
            return
        }

        if (this.props.topRankMacroState?.state === 'pending') {
            this.setState({ topRankMacro: this.props.appliedMacro })
            return
        }

        if (
            this.props.preferences?.getIn(['data', 'prefill_best_macro']) ===
            false
        )
            return

        const foundTopRankMacro = this.props.macros.find(
            (macro) =>
                macro.relevance_rank === 1 &&
                macro.score &&
                macro.score > PREFILL_TOP_MACRO_SCORE_THRESHOLD,
        )
        if (!foundTopRankMacro) return

        const topRankMacro: Map<any, any> = fromJS(foundTopRankMacro)
        const topRankMacroStateId = this.props.topRankMacroState?.['macroId']
        const topRankMacroId: number | undefined = topRankMacro.get('id')
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
            (action) => action?.get('name') !== MacroActionName.SetResponseText,
        )

        if (hasMacroActions) return

        const contentState = this.props.newMessage.getIn(
            CONTENT_STATE_PATH,
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
                                this.props.currentUser,
                            ) as List<any>,
                    )
                })
            },
        )

        this.setState({ topRankMacro: renderedTopRankMacro })
    }

    acceptTopRankMacro = () => {
        this.setState({ topRankMacro: null })
        this.applyTopRankMacro(this.props.appliedMacro, 'accepted')
    }

    rejectTopRankMacro = () => {
        this.setState({ topRankMacro: null })
        this.applyTopRankMacro(this.props.appliedMacro, 'rejected')

        const editorState = this.richArea?.state.editorState
        if (editorState) {
            const newState = EditorState.createEmpty()
            this.richArea?.setEditorState(newState)
        }

        this.props.clearAppliedMacro(this.props.ticket.get('id'))
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        const { isMacrosLoading, macros } = this.props
        const { shouldFocusEditor } = this.state

        if (isMacrosLoading && !prevProps.isMacrosLoading) {
            this.setState({
                selectedMacroId: getDefaultSelectedMacroId(
                    macros,
                    this.state.selectedMacroId,
                ),
            })
            this.checkTopRankMacro()
        }

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

        // Hide macros if text has been pushed to editor
        const getContextState = (props: Props) =>
            props.newMessage.getIn(CONTENT_STATE_PATH) as ContentState
        if (
            this.props.isMacrosActive &&
            getContextState(prevProps) !== getContextState(this.props)
        )
            this.hideMacros()

        if (shouldFocusEditor && !prevState.shouldFocusEditor) {
            this.setState({ shouldFocusEditor: false })
            if (this.richArea) {
                this.richArea.focusEditor()
            }
        }

        if (this.state.topRankMacro && this.props.appliedMacro) {
            const macroResponseText = (
                this.props.appliedMacro?.get('actions') as
                    | Map<string, Map<string, any>>
                    | undefined
            )?.find(
                (action?: Map<string, any>) =>
                    action?.get('name') === MacroActionName.SetResponseText,
            )

            const macroBodyText = macroResponseText?.getIn([
                'arguments',
                'body_text',
            ]) as string | undefined

            const contentState = ContentState.createFromText(
                macroBodyText ?? '',
            )

            const newMessageBodyText: string | undefined =
                this.props.newMessage?.getIn(['newMessage', 'body_text'])

            if (
                this.props.appliedMacro.has('id') &&
                (contentState.getPlainText() !== newMessageBodyText ||
                    !this.props.appliedMacro.equals(this.state.topRankMacro))
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
                  true,
              ) as boolean)
            : true

        return (
            this.props.macros.length > 0 &&
            (this.props.newMessage.getIn(['newMessage', 'body_text']) as string)
                .length < 3 &&
            !this.props.ticket.getIn(['state', 'appliedMacro']) &&
            !this.props.hasShownMacros &&
            showQuickReply
        )
    }

    showMacrosDefault = () => {
        // show macros depending on the show_macros preference
        const nextContextState = this.props.newMessage.getIn(
            CONTENT_STATE_PATH,
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
            (action) => action?.get('name') !== MacroActionName.SetResponseText,
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

    setSelectedMacroId = (macro: Macro) =>
        this.setState({ selectedMacroId: macro.id! })

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
            SEARCH_MACROS: {
                action: (e) => {
                    e.preventDefault()
                    this.showMacros()
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
                        const { macros } = this.props
                        const macroIdx =
                            parseInt((e as KeyboardEvent).code.slice(-1)) - 1
                        if (macros.length > macroIdx) {
                            this.handleApplyMacro(macros[macroIdx])
                        }
                    }
                },
            },
        })
    }

    handleSearchKeyDown = (e: KeyboardEventReact) => {
        const { macros } = this.props
        const { selectedMacroId } = this.state

        const selectedMacroIndex = macros.findIndex(
            (macro) => macro.id === selectedMacroId,
        )

        if (e.key === 'Escape' || e.key === 'Tab') {
            e.preventDefault()
            this.hideMacrosAndFocusEditor()
        }

        if (e.key === 'ArrowDown') {
            const nextId = macros[selectedMacroIndex + 1]?.id
            if (nextId) {
                e.preventDefault()
                this.setState({ selectedMacroId: nextId })
            }
        }

        if (e.key === 'ArrowUp') {
            const nextId = macros[selectedMacroIndex - 1]?.id
            if (nextId) {
                e.preventDefault()
                this.setState({ selectedMacroId: nextId })
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault()
            const macro = macros[selectedMacroIndex]
            if (macro) {
                this.handleApplyMacro(macro)
            }
        }
    }

    showMacros = () => {
        this.props.onChangeMacrosActive(true)
    }

    hideMacros = () => {
        this.props.onChangeMacrosActive(false)
    }

    hideMacrosAndFocusEditor = () => {
        this.hideMacros()
        this.setState({ shouldFocusEditor: true })
    }

    handleApplyMacro = (macro: Macro) => {
        const { applyMacro, currentTicket, newMessageType, notify } = this.props

        const clearingResult = clearMacroBeforeApply(newMessageType, macro)
        if (clearingResult.notification) {
            void notify({
                message: clearingResult.notification.message,
                status: clearingResult.notification.status,
            })
        }

        void applyMacro(fromJS(clearingResult.macro), currentTicket.get('id'))

        this.hideMacrosAndFocusEditor()
    }

    render() {
        const { selectedMacroId } = this.state
        const {
            currentTicket,
            filters,
            isMacrosActive,
            macros,
            newMessageType,
            nextCursor,
            query,
            onChangeFilters,
            onChangeQuery,
            isMacrosLoading,
        } = this.props

        const currentMacro = getCurrentMacro(macros, selectedMacroId)

        const requireCustomerSelection =
            !currentTicket.get('id') &&
            newMessageType === 'internal-note' &&
            currentTicket.get('customer') == null

        return (
            <div
                className={classnames(css.component, {
                    [css.macrosVisible]: isMacrosActive,
                })}
            >
                <TicketMacrosSearch
                    setFocus={(input) => (this.macroInput = input)}
                    filters={filters}
                    macrosVisible={isMacrosActive}
                    showMacros={this.showMacros}
                    handleSearchKeyDown={this.handleSearchKeyDown}
                    requireCustomerSelection={requireCustomerSelection}
                    query={query}
                    onChangeFilters={onChangeFilters}
                    onChangeQuery={onChangeQuery}
                    onClearMacro={this.hideMacrosAndFocusEditor}
                />
                <div className={css.content}>
                    {requireCustomerSelection ? (
                        <div
                            className={classnames(
                                css.replyAreaAlertMessage,
                                'alert-warning',
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
                    ) : isMacrosActive ? (
                        <TicketMacros
                            macros={macros}
                            isLoading={isMacrosLoading}
                            currentMacro={currentMacro}
                            selectMacro={this.setSelectedMacroId}
                            loadMacros={this.props.loadMacros}
                            searchParams={{
                                ...filters,
                                search: query,
                                cursor: nextCursor,
                            }}
                            applyMacro={this.handleApplyMacro}
                            hasDataToLoad={!!nextCursor}
                        />
                    ) : (
                        <TicketReply
                            replyAreaHeader={
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
                            macros={macros}
                            applyMacro={this.handleApplyMacro}
                            shouldDisplayQuickReply={this.shouldDisplayQuickReply()}
                            onKeyDown={(e: KeyboardEvent) => {
                                if (e.shiftKey && e.key === 'Tab') {
                                    this.showMacros()
                                    this.macroInput?.focus()
                                }
                            }}
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
        currentUser: state.currentUser,
        newMessage: state.newMessage,
        newMessageType: getNewMessageType(state),
        preferences: getPreferences(state),
        appliedMacro: getAppliedMacro(state),
        ticket: state.ticket,
        topRankMacroState: getTopRankMacroState(state),
        inTicketSuggestionState: getInTicketSuggestionState(state),
    }),
    {
        applyMacro,
        clearAppliedMacro,
        notify,
    },
)

export default connector(TicketReplyArea)
