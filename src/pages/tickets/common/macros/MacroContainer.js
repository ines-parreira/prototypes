// @flow
import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'

import type {Map, List} from 'immutable'

import withCancellableRequest from '../../../common/utils/withCancellableRequest'
import * as ViewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as MacroActions from '../../../../state/macro/actions'
import * as TicketsActions from '../../../../state/tickets/actions'
import {getAgents} from '../../../../state/agents/selectors'

import MacroModal from './components/MacroModal'

import {getDefaultSelectedMacroId, getCurrentMacro} from './utils'

type Props = {
    activeView: Map<*, *>,
    agents: Map<*, *>,
    actions: {
        macro: typeof MacroActions,
        tickets: typeof TicketsActions,
        views: typeof ViewsActions,
    },
    closeModal: () => void,
    isCreatingMacro: boolean,
    toggleCreateMacro?: (T?: boolean) => Promise<*>,
    // macro to select when modal opens, selects first macro of list otherwise
    selectedMacro: Map<*, *>,
    selectedItemsIds: List<*>,
    fetchMacrosCancellable: (
        filters?: MacroActions.fetchMacrosParamsTypes,
        orderBy?: string,
        orderDir?: string
    ) => Promise<?MacroActions.MacrosSearchResult>,

    disableExternalActions?: boolean,
    selectionMode?: boolean,
    allViewItemsSelected: boolean,
    getViewCount: (id: number) => number,
}

type State = {
    search: string,
    page: number,
    totalPages: number,
    macros: Map<*, *>,
    selectedMacroId: ?number,
    firstLoad: boolean,
}

class MacroContainer extends React.Component<Props, State> {
    static defaultProps = {
        activeView: fromJS({}),
        selectedMacro: fromJS({}),
        selectedItemsIds: fromJS({}),
    }

    state = {
        search: '',
        page: 1,
        totalPages: 1,
        macros: fromJS([]),
        selectedMacroId: null,
        firstLoad: true,
    }

    componentDidMount() {
        this._loadMacros().then(() => {
            if (!this.props.selectedMacro.isEmpty()) {
                const currentMacro = getCurrentMacro(
                    this.state.macros,
                    this.props.selectedMacro.get('id'),
                    this.props.isCreatingMacro
                )

                this.setState({
                    selectedMacroId: this.props.selectedMacro.get('id'),
                })
                // selectedMacro is not in page=1 macro list
                if (currentMacro.isEmpty()) {
                    // search for it
                    this._onSearch(this.props.selectedMacro.get('name'), true)
                }
            }
        })
    }

    _loadMacros = ({search = '', page = 1} = {}) => {
        return this.props
            .fetchMacrosCancellable(
                {
                    currentMacros: this.state.macros,
                    currentPage: this.state.page,
                    search,
                    page,
                },
                'name',
                'asc'
            )
            .then((res) => {
                if (!res) {
                    return
                }
                const selectedMacroId = getDefaultSelectedMacroId(
                    res.macros,
                    this.state.selectedMacroId,
                    this.props.isCreatingMacro
                )
                return new Promise((resolve) => {
                    this.setState(
                        {
                            selectedMacroId,
                            macros: res.macros,
                            page: res.page,
                            totalPages: res.totalPages,
                            firstLoad: false,
                        },
                        resolve
                    )
                })
            })
    }

    _handleClickItem = (macroId) => {
        this.props.toggleCreateMacro && this.props.toggleCreateMacro(false)
        this.setState({selectedMacroId: macroId})
    }

    _updateMacros = (macros) => {
        this.setState({macros})
    }

    _debounceLoadMacros = _debounce(this._loadMacros, 350)

    _onSearch = (search: string = '', forceSearch: boolean = false) => {
        this.setState({search})
        if (forceSearch || !search.trim().length || search.trim().length > 1) {
            this._debounceLoadMacros({search, page: 1})
        }
    }

    render() {
        const {
            activeView,
            agents,
            actions,
            disableExternalActions,
            selectionMode,
            selectedItemsIds,
            closeModal,
            isCreatingMacro,
            toggleCreateMacro,
            allViewItemsSelected,
            getViewCount,
        } = this.props

        const currentMacro = getCurrentMacro(
            this.state.macros,
            this.state.selectedMacroId,
            isCreatingMacro
        )

        return (
            <MacroModal
                closeModal={closeModal}
                activeView={activeView}
                macros={this.state.macros}
                fetchMacros={this._loadMacros}
                firstLoad={this.state.firstLoad}
                page={this.state.page}
                totalPages={this.state.totalPages}
                currentMacro={currentMacro}
                agents={agents}
                actions={actions}
                disableExternalActions={disableExternalActions || false}
                selectionMode={selectionMode || false}
                selectedItemsIds={selectedItemsIds}
                handleClickItem={this._handleClickItem}
                updateMacros={this._updateMacros}
                onSearch={this._onSearch}
                search={this.state.search}
                isCreatingMacro={isCreatingMacro}
                toggleCreateMacro={toggleCreateMacro}
                allViewItemsSelected={allViewItemsSelected}
                getViewCount={getViewCount}
            />
        )
    }
}

function mapStateToProps(state) {
    return {
        agents: getAgents(state),
        allViewItemsSelected: viewsSelectors.areAllActiveViewItemsSelected(
            state
        ),
        getViewCount: viewsSelectors.makeGetViewCount(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(ViewsActions, dispatch),
            tickets: bindActionCreators(TicketsActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
        },
    }
}

export default withCancellableRequest(
    'fetchMacrosCancellable',
    MacroActions.fetchMacros
)(connect(mapStateToProps, mapDispatchToProps)(MacroContainer))
