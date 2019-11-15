// @flow
import classnames from 'classnames'
import {fromJS, type Map} from 'immutable'
import _debounce from 'lodash/debounce'
import React from 'react'
import {connect} from 'react-redux'
import {Input} from 'reactstrap'

import { clearMacroBeforeApply, type Macro } from '../../../../../business/macro'
import { type TicketMessageSourceType } from '../../../../../business/ticket'
import shortcutManager from '../../../../../services/shortcutManager'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {applyMacro} from '../../../../../state/ticket/actions'
import * as ticketSelectors from '../../../../../state/ticket/selectors'
import type {fetchMacrosType} from '../../../common/macros/types'
import {getCurrentMacro, getDefaultSelectedMacroId} from '../../../common/macros/utils'
import {getPreferences} from '../../../../../state/currentUser/selectors'
import {fetchMacros} from '../../../../../state/macro/actions'
import {notify} from '../../../../../state/notifications/actions'

import TicketMacros from './TicketMacros'
import TicketReply from './TicketReply'
import css from './TicketReplyArea.less'

const CONTENT_STATE_PATH = ['state', 'contentState']

type Props = {
    actions: Object,
    ticket: Object,
    currentUser: Object,
    customers: Object,
    preferences: Object,
    newMessage: Object,
    newMessageType: TicketMessageSourceType,
    notify: typeof notify,
    currentMacro: Map<*,*>,
    page: number,
    totalPages: number,
    selectMacro: () => void,
    fetchMacros: fetchMacrosType,
    applyMacro: (M: Map<*,*>, I: number) => void,
    currentTicket: Map<*,*>,
    cacheAdded: boolean,
}

type State = {
    macros: Map<*,*>,
    page: number,
    totalPages: number,
    macrosVisible: boolean,
    macroSearchQuery: string,
    selectedMacroId: ?number,
}

export class TicketReplyArea extends React.Component<Props, State> {
    richArea = null
    macroInput = null
    cacheAdded = false

    constructor() {
        super()

        this.state = {
            macros: fromJS([]),
            page: 1,
            totalPages: 1,
            macrosVisible: false,
            macroSearchQuery: '',
            selectedMacroId: null
        }
    }

    componentDidMount() {
        this._bindKeys()
        this._loadMacros()
    }

    componentDidUpdate = (prevProps: Props) => {
        if (this.props.cacheAdded && this.cacheAdded !== true) {
            this._showMacrosDefault()
            // only run once
            this.cacheAdded = true
        }

        if (
            // message type changed
            prevProps.newMessageType !== this.props.newMessageType
            && this.props.newMessageType === 'internal-note'
        ) {
            // hide macros on internal-note
            this._hideMacros()
        }
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _showMacrosDefault = () => {
        // show macros depending on the show_macros preference
        const nextContextState = this.props.newMessage.getIn(CONTENT_STATE_PATH)
        const editorFocused = this.richArea && this.richArea.isFocused()

        // has any text
        const hasText = (
            nextContextState
            && nextContextState.hasText()
        )

        // default
        let showMacros = this.props.preferences.get('show_macros')

        // show/hide macros depending on the profile setting
        const preferences = this.props.currentUser
            .get('settings')
            .find((s) => s.get('type') === 'preferences')

        if (preferences) {
            showMacros = preferences.getIn(['data', 'show_macros'])
        }

        // toggle macros only if
        if (
            // show_macros preference is true
            showMacros
            // cache was added
            && this.props.cacheAdded
            // message is email
            && this.props.newMessageType === 'email'
            // editor doesn't have text
            && !hasText
            // editor is not focused
            // fixes issues caused by the debounced setResponseText,
            // that causes the contentState to be set with a delay.
            && !editorFocused
        ) {
            this._showMacros()
        }
    }

    _loadMacros = ({search = '', page = 1}: {search: string, page: number} = {}) => {
        return this.props.fetchMacros({
            currentMacros: this.state.macros,
            currentPage: this.state.page,
            search,
            page,
        }).then((res) => {
            const selectedMacroId = getDefaultSelectedMacroId(res.macros, this.state.selectedMacroId)
            return new Promise((resolve) => {
                this.setState({
                    selectedMacroId,
                    macros: res.macros,
                    page: res.page,
                    totalPages: res.totalPages,
                }, resolve)
            })
        })
    }

    _setSelectedMacroId = (macro: Map<*,*>) => this.setState({selectedMacroId: macro.get('id')})

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            SHOW_MACROS: {
                action: (e) => {
                    e.preventDefault()
                    if (this.macroInput) {
                        this.macroInput.focus()
                    }
                }
            },
            BLUR_EVERYTHING: {
                action: () => {
                    this._hideMacros()

                    if (document.activeElement) {
                        document.activeElement.blur()
                    }
                }
            },
            FOCUS_REPLY_AREA: {
                action: (e) => {
                    e.preventDefault()
                    this._hideMacros()
                }
            },
        })
    }

    _handleSearchKeyDown = (e: KeyboardEvent) => {
        const {macros} = this.state
        const macrosIds = macros.map((macro) => macro.get('id')).toList()
        const indexCurrentMacro = macrosIds.indexOf(this.state.selectedMacroId)

        if (e.key === 'Escape' || e.key === 'Tab') {
            e.preventDefault()
            this._hideMacros()
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
            const macro = macros.find((macro) => macro.get('id') === this.state.selectedMacroId)
            this._applyMacro(macro)
        }
    }

    _debounceLoadMacros = _debounce(this._loadMacros, 350)

    _searchMacros = (e: {target: {value: string}}) => {
        const search = e.target.value || ''
        this.setState({macroSearchQuery: search})

        if (!search.trim().length || search.trim().length > 1) {
            this._debounceLoadMacros({search, page: 1})
        }
    }

    _showMacros = () => this.setState({macrosVisible: true})

    _hideMacros = () => {
        this.setState({macrosVisible: false}, () => {
            if (this.richArea) {
                this.richArea.focusEditor()
            }
        })
    }

    _applyMacro = (macro: Macro) => {
        const {
            applyMacro,
            currentTicket,
            newMessageType,
            notify,
        } = this.props

        const clearingResult = clearMacroBeforeApply(newMessageType, macro)
        if (clearingResult.notification) {
            notify({
                message: clearingResult.notification.message,
                status: clearingResult.notification.status,
            })
        }

        applyMacro(clearingResult.macro, currentTicket.get('id'))

        this._hideMacros()
    }

    render = () => {
        const currentMacro = getCurrentMacro(this.state.macros, this.state.selectedMacroId)

        return (
            <div
                className={classnames(css.component, {
                    [css.macrosVisible]: this.state.macrosVisible
                })}
            >
                <div className={css.search}>
                    <i className={classnames(css.searchIcon, 'material-icons md-2 text-info')}>
                        flash_on
                    </i>
                    <Input
                        innerRef={(macroInput) => this.macroInput = macroInput}
                        tabIndex="3"
                        onChange={this._searchMacros}
                        onKeyDown={this._handleSearchKeyDown}
                        onFocus={this._showMacros}
                        placeholder="Search macros by name, tags or body..."
                    />
                </div>
                <div className={css.content}>
                    {this.state.macrosVisible ? (
                        <TicketMacros
                            ticket={this.props.ticket}
                            macros={this.state.macros}
                            page={this.state.page}
                            totalPages={this.state.totalPages}
                            currentMacro={currentMacro}
                            selectMacro={this._setSelectedMacroId}
                            fetchMacros={this._loadMacros}
                            searchQuery={this.state.macroSearchQuery}
                            hideMacros={this._hideMacros}
                            applyMacro={this._applyMacro}
                        />
                    ) : (
                        <TicketReply
                            actions={this.props.actions}
                            ticket={this.props.ticket}
                            appliedMacro={this.props.ticket.getIn(['state', 'appliedMacro'])}
                            customers={this.props.customers}
                            richAreaRef={(ref) => this.richArea = ref}
                        />
                    )}
                </div>
            </div>
        )
    }
}

export default connect((state) => ({
    newMessageType: newMessageSelectors.getNewMessageType(state),
    newMessage: state.newMessage,
    preferences: getPreferences(state),
    cacheAdded: newMessageSelectors.isCacheAdded(state),
    currentTicket: ticketSelectors.getTicket(state),
}), ({
    notify,
    fetchMacros,
    applyMacro,
}))(TicketReplyArea)
