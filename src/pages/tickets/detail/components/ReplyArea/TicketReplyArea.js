// @flow
import classnames from 'classnames'
import {fromJS, type Map, type RecordOf} from 'immutable'
import _debounce from 'lodash/debounce'
import React, {type ElementRef} from 'react'
import {connect} from 'react-redux'
import {Input} from 'reactstrap'

import {clearMacroBeforeApply} from '../../../../../business/macro'
import type {Macro} from '../../../../../business/types/macro'
import {type TicketMessageSourceType} from '../../../../../business/types/ticket'
import shortcutManager from '../../../../../services/shortcutManager'
import withCancellableRequest from '../../../../common/utils/withCancellableRequest'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {applyMacro} from '../../../../../state/ticket/actions'
import * as ticketSelectors from '../../../../../state/ticket/selectors'
import {
    getCurrentMacro,
    getDefaultSelectedMacroId,
} from '../../../common/macros/utils'
import {getPreferences} from '../../../../../state/currentUser/selectors'
import {
    fetchMacros,
    type fetchMacrosParamsTypes,
    type MacrosSearchResult,
} from '../../../../../state/macro/actions'
import {notify} from '../../../../../state/notifications/actions'
import RichField from '../../../../common/forms/RichField'

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
    currentMacro: Map<*, *>,
    page: number,
    totalPages: number,
    selectMacro: () => void,
    fetchMacrosCancellable: (
        filters?: fetchMacrosParamsTypes,
        orderBy?: string,
        orderDir?: string
    ) => Promise<?MacrosSearchResult>,
    applyMacro: (M: Map<*, *>, I: number) => void,
    currentTicket: Map<*, *>,
    cacheAdded: boolean,
}

type State = {
    macros: Map<*, *>,
    page: number,
    totalPages: number,
    macrosVisible: boolean,
    macroSearchQuery: string,
    selectedMacroId: ?number,
    isInitialMacrosLoading: boolean,
    shouldFocusEditor: boolean,
}

export class TicketReplyArea extends React.Component<Props, State> {
    richArea: ?ElementRef<typeof RichField> = null
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
            selectedMacroId: null,
            isInitialMacrosLoading: false,
            shouldFocusEditor: false,
        }
    }

    async componentDidMount() {
        this._bindKeys()
        this.setState({isInitialMacrosLoading: true})
        await this._loadMacros()
        this.setState({isInitialMacrosLoading: false})
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        const {shouldFocusEditor} = this.state

        if (this.props.cacheAdded && this.cacheAdded !== true) {
            this._showMacrosDefault()
            // only run once
            this.cacheAdded = true
        }

        if (
            // message type changed
            prevProps.newMessageType !== this.props.newMessageType &&
            this.props.newMessageType === 'internal-note'
        ) {
            // hide macros on internal-note
            this._hideMacros()
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

    _showMacrosDefault = () => {
        // show macros depending on the show_macros preference
        const nextContextState = this.props.newMessage.getIn(CONTENT_STATE_PATH)
        const editorFocused = this.richArea && this.richArea.isFocused()

        // has any text
        const hasText = nextContextState && nextContextState.hasText()

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
            this._showMacros()
        }
    }

    _loadMacros = ({
        search = '',
        page = 1,
    }: {search: string, page: number} = {}) => {
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
                    this.props.currentTicket.get('messages').size - 1,
                    'id',
                ]),
                _fallbackOrderBy: 'usage',
            }
        }

        return this.props
            .fetchMacrosCancellable(
                {...filters, ...commonFilters},
                orderBy,
                orderDir
            )
            .then((res) => {
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
            })
    }

    _setSelectedMacroId = (macro: Map<*, *>) =>
        this.setState({selectedMacroId: macro.get('id')})

    _bindKeys() {
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
                    this._hideMacrosAndFocusEditor()

                    if (document.activeElement) {
                        document.activeElement.blur()
                    }
                },
            },
            FOCUS_REPLY_AREA: {
                action: (e) => {
                    e.preventDefault()
                    this._hideMacrosAndFocusEditor()
                },
            },
        })
    }

    _handleSearchKeyDown = (e: KeyboardEvent) => {
        const {macros} = this.state
        const macrosIds = macros.map((macro) => macro.get('id')).toList()
        const indexCurrentMacro = macrosIds.indexOf(this.state.selectedMacroId)

        if (e.key === 'Escape' || e.key === 'Tab') {
            e.preventDefault()
            this._hideMacrosAndFocusEditor()
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
                (macro) => macro.get('id') === this.state.selectedMacroId
            )
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
        this.setState({macrosVisible: false})
    }

    _hideMacrosAndFocusEditor = () => {
        this._hideMacros()
        this.setState({shouldFocusEditor: true})
    }

    _applyMacro = (macro: RecordOf<Macro>) => {
        const {applyMacro, currentTicket, newMessageType, notify} = this.props

        const clearingResult = clearMacroBeforeApply(newMessageType, macro)
        if (clearingResult.notification) {
            notify({
                message: clearingResult.notification.message,
                status: clearingResult.notification.status,
            })
        }

        applyMacro(clearingResult.macro, currentTicket.get('id'))

        this._hideMacrosAndFocusEditor()
    }

    render = () => {
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
                        flash_on
                    </i>
                    <Input
                        innerRef={(macroInput) =>
                            (this.macroInput = macroInput)
                        }
                        tabIndex="3"
                        onChange={this._searchMacros}
                        onKeyDown={this._handleSearchKeyDown}
                        onFocus={this._showMacros}
                        placeholder="Search macros by name, tags or body..."
                    />
                </div>
                <div className={css.content}>
                    {macrosVisible ? (
                        <TicketMacros
                            ticket={this.props.ticket}
                            macros={macros}
                            page={page}
                            isInitialMacrosLoading={isInitialMacrosLoading}
                            totalPages={totalPages}
                            currentMacro={currentMacro}
                            selectMacro={this._setSelectedMacroId}
                            fetchMacros={this._loadMacros}
                            searchQuery={macroSearchQuery}
                            onClearMacro={this._hideMacrosAndFocusEditor}
                            applyMacro={this._applyMacro}
                        />
                    ) : (
                        <TicketReply
                            actions={this.props.actions}
                            ticket={this.props.ticket}
                            appliedMacro={this.props.ticket.getIn([
                                'state',
                                'appliedMacro',
                            ])}
                            customers={this.props.customers}
                            richAreaRef={(ref) => (this.richArea = ref)}
                        />
                    )}
                </div>
            </div>
        )
    }
}

export default withCancellableRequest(
    'fetchMacrosCancellable',
    fetchMacros
)(
    connect(
        (state) => ({
            newMessageType: newMessageSelectors.getNewMessageType(state),
            newMessage: state.newMessage,
            preferences: getPreferences(state),
            cacheAdded: newMessageSelectors.isCacheAdded(state),
            currentTicket: ticketSelectors.getTicket(state),
        }),
        {
            notify,
            applyMacro,
        }
    )(TicketReplyArea)
)
