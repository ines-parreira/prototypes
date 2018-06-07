import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import shortcutManager from '../../../../../services/shortcutManager'

import * as search from '../../../../../state/macro/search'
import * as ticketActions from '../../../../../state/ticket/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {notify} from './../../../../../state/notifications/actions'
import {getPreferences} from './../../../../../state/currentUser/selectors'
import {areMacrosVisible, getMacrosOrderedByUsage} from '../../../../../state/macro/selectors'

import css from './TicketReplyArea.less'

const CONTENT_STATE_PATH = ['state', 'contentState']

export class TicketReplyArea extends React.Component {
    constructor(props) {
        super(props)

        const macros = this._getMacros(props, {})
        const firstMacro = macros.first()
        const selectedMacroId = firstMacro ? firstMacro.get('id') : null

        this.state = {
            searchQuery: '',
            searchedMacrosIds: fromJS([]),
            isMacroDisplayInitialized: false,
            selectedMacroId,
        }
    }

    componentDidMount() {
        this._bindKeys()

        // TODO(@xarg): move this closer after the loading of the initial state.
        search.populate(this.props.macros)
    }

    componentWillReceiveProps(nextProps) {
        this._showMacrosDefault(nextProps)
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    // show macros depending on the show_macros preference
    _showMacrosDefault(nextProps) {
        const nextContextState = nextProps.newMessage.getIn(CONTENT_STATE_PATH)
        const editorFocused = this.richArea && this.richArea.isFocused()

        // has any text
        const hasText = (
            nextContextState
            && nextContextState.hasText()
        )

        // default
        let showMacros = nextProps.preferences.get('show_macros')

        // show/hide macros depending on the profile setting
        const preferences = nextProps.currentUser
            .get('settings')
            .find((s) => s.get('type') === 'preferences')

        if (preferences) {
            showMacros = preferences.getIn(['data', 'show_macros'])
        }

        // don't toggle macros
        if (
            // if show_macros preference is false
            !showMacros
            // macros where already shown
            || this.state.isMacroDisplayInitialized
            // cache wasn't added yet
            || !nextProps.cacheAdded
            // message is not email
            || nextProps.newMessageType !== 'email'
            // editor has text
            || hasText
            // editor is focused.
            // fixes issues caused by the debounced setResponseText,
            // that causes the contentState to be set with a delay.
            || editorFocused
            // or manually changed macro visibility
            || nextProps.macros.get('visible') !== this.props.macros.get('visible')
        ) {
            return
        }

        this._setMacrosVisible(showMacros)
        this.setState({isMacroDisplayInitialized: true})
    }

    _bindKeys() {
        const modalVisible = () => this.props.macros.get('isModalOpen')

        shortcutManager.bind('TicketDetailContainer', {
            SHOW_MACROS: {
                action: (e) => {
                    if (!modalVisible()) {
                        e.preventDefault()
                        this._setMacrosVisible(true)

                        if (this.macroInput) {
                            ReactDOM.findDOMNode(this.macroInput).focus()
                        }
                    }
                }
            },
            BLUR_EVERYTHING: {
                action: () => {
                    if (!modalVisible()) {
                        this._setMacrosVisible(false)
                    }

                    if ('activeElement' in document) {
                        document.activeElement.blur()
                    }
                }
            },
        })
    }

    _applyMacro = (macro) => {
        const {newMessageType} = this.props

        const hasAttachments = !macro.get('actions').filter((action) => action.get('name') === 'addAttachments').isEmpty()
        const hasText = !macro.get('actions').filter((action) => action.get('name') === 'setResponseText').isEmpty()
        const isMessengerMessage = newMessageType === 'facebook-messenger'

        let appliedMacro = macro

        if (isMessengerMessage && hasText && hasAttachments) {
            this.props.notify({
                title: 'We have removed the attachment from this message, because you cannot send text and attachments at the same time on Messenger.'
            })
            appliedMacro = appliedMacro.update(
                'actions',
                (actions) => actions.filter((action) => action.get('name') !== 'addAttachments')
            )
        }

        this.props.applyMacro(appliedMacro, this.props.ticket.get('id'))
    }

    _getMacros = (props = this.props, state = this.state) => {
        const macros = props.macros
        if (state.searchQuery) {
            return state.searchedMacrosIds.map((macroId) =>
                macros.find((m) =>
                    m.get('id').toString() === macroId
                )
            )
        }
        return macros
    }

    _getMacrosIds = (props = this.props, state = this.state) => {
        return this._getMacros(props, state).map((macro) => macro.get('id')).toList()
    }

    _setMacrosVisible = (v) => this.props.actions.macro.setMacrosVisible(v)

    _handleSearch = (query) => {
        let searchedMacrosIds = this.state.searchedMacrosIds
        let selectedMacroId = this.state.selectedMacroId
        if (!!query) {
            searchedMacrosIds = fromJS(search.search(query))
        }
        // manually send new values,
        // because state is not updated yet.
        const macrosIds = this._getMacrosIds(this.props, {
            searchQuery: query,
            searchedMacrosIds,
        })

        // when macros change because of a search then select first one
        const shouldSelectFirstMacro = !macrosIds.isEmpty()
            && this.state.searchQuery !== query
        if (shouldSelectFirstMacro) {
            selectedMacroId = macrosIds.first()
        }

        this.setState({
            searchQuery: query,
            searchedMacrosIds,
            selectedMacroId,
        })
    }

    // scroll in macro list until currently selected macro
    _scrollMacrosListToCurrent = () => {
        const list = document.getElementsByClassName('macro-list')[0]
        const selectedItem = document.getElementsByClassName('macro-item active')[0]
        list.scrollTop = selectedItem.offsetTop - 14
    }

    _handleSearchKeyDown = (e) => {
        const macros = this._getMacros()
        const macrosIds = this._getMacrosIds()
        const indexCurrentMacro = macrosIds.indexOf(this.state.selectedMacroId)

        if (e.key === 'Escape' || e.key === 'Tab') {
            // wait next React tick before focusing the reply area so React has rendered components already
            setTimeout(() => {
                shortcutManager.triggerAction('TicketDetailContainer', 'FOCUS_REPLY_AREA')
            }, 1)
        }

        if (e.key === 'ArrowDown') {
            if (~indexCurrentMacro && indexCurrentMacro < macrosIds.size - 1) {
                e.preventDefault()
                const nextMacroIndex = indexCurrentMacro + 1
                this.setState({selectedMacroId: macrosIds.get(nextMacroIndex)}, this._scrollMacrosListToCurrent)
            }
        }

        if (e.key === 'ArrowUp') {
            if (~indexCurrentMacro && indexCurrentMacro > 0) {
                e.preventDefault()
                const nextMacroIndex = indexCurrentMacro - 1
                this.setState({selectedMacroId: macrosIds.get(nextMacroIndex)}, this._scrollMacrosListToCurrent)
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault()
            const macro = macros.find((macro) => macro.get('id') === this.state.selectedMacroId)
            this._applyMacro(macro)
        }
    }

    render = () => {
        const macros = this._getMacros()
        const macrosVisible = this.props.macrosVisible

        return (
            <div
                className={classnames(css.component, {
                    [css.macrosVisible]: macrosVisible
                })}
            >
                <div className={css.search}>
                    <i className={classnames(css.searchIcon, 'material-icons md-2 text-info')}>
                        flash_on
                    </i>
                    <Input
                        ref={(macroInput) => this.macroInput = macroInput}
                        tabIndex="3"
                        onChange={(e) => this._handleSearch(e.target.value)}
                        onKeyDown={this._handleSearchKeyDown}
                        onFocus={() => this._setMacrosVisible(true)}
                        placeholder="Search macros by name, tags or body..."
                    />
                </div>

                <div className={css.content}>
                    <TicketMacros
                        macros={macros}
                        macrosVisible={macrosVisible}
                        applyMacro={this._applyMacro}
                        setMacrosVisible={this._setMacrosVisible}
                        searchQuery={this.state.searchQuery}
                        selectedMacroId={this.state.selectedMacroId}
                        setSelectedMacroId={(selectedMacroId) => this.setState({selectedMacroId})}
                        className={classnames({
                            'd-block': macrosVisible
                        })}
                    />

                    <TicketReply
                        className={classnames({
                            hidden: macrosVisible,
                        })}
                        actions={this.props.actions}
                        ticket={this.props.ticket}
                        appliedMacro={this.props.ticket.getIn(['state', 'appliedMacro'])}
                        users={this.props.users}
                        richAreaRef={(ref) => this.richArea = ref}
                    />
                </div>


            </div>
        )
    }
}

TicketReplyArea.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    macros: PropTypes.object.isRequired,
    macrosVisible: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    updateMacro: PropTypes.func,
    preferences: PropTypes.object.isRequired,
    newMessage: PropTypes.object.isRequired,
    newMessageType: PropTypes.string.isRequired,
    notify: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        macros: getMacrosOrderedByUsage(state),
        macrosVisible: areMacrosVisible(state),
        newMessageType: newMessageSelectors.getNewMessageType(state),
        newMessage: state.newMessage,
        preferences: getPreferences(state),
        cacheAdded: newMessageSelectors.isCacheAdded(state),
    }
}

const mapDispatchToProps = {
    applyMacro: ticketActions.applyMacro,
    notify,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyArea)
