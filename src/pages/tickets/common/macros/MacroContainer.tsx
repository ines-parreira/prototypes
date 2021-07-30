import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import _debounce from 'lodash/debounce'

import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as MacroActions from '../../../../state/macro/actions'
import {getAgents} from '../../../../state/agents/selectors'
import {RootState} from '../../../../state/types'

import MacroModal from './components/MacroModal'
import {getDefaultSelectedMacroId, getCurrentMacro} from './utils'

type Props = {
    activeView: Map<any, any>
    closeModal: () => void
    isCreatingMacro?: boolean
    toggleCreateMacro?: (toggle?: boolean) => Promise<void>
    // macro to select when modal opens, selects first macro of list otherwise
    selectedMacro: Map<any, any>
    selectedItemsIds: List<any>
    disableExternalActions?: boolean
    selectionMode?: boolean
} & ConnectedProps<typeof connector> &
    CancellableRequestInjectedProps<
        'fetchMacrosCancellable',
        'cancelFetchMacrosCancellable',
        typeof MacroActions.fetchMacros
    >

type State = {
    search: string
    page: number
    totalPages: number
    macros: List<any>
    selectedMacroId: Maybe<number>
    firstLoad: boolean
}

export class MacroContainer extends Component<Props, State> {
    static defaultProps: Pick<
        Props,
        'activeView' | 'selectedMacro' | 'selectedItemsIds'
    > = {
        activeView: fromJS({}),
        selectedMacro: fromJS({}),
        selectedItemsIds: fromJS([]),
    }

    state: State = {
        search: '',
        page: 1,
        totalPages: 1,
        macros: fromJS([]),
        selectedMacroId: null,
        firstLoad: true,
    }

    componentDidMount() {
        void this._loadMacros().then(() => {
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
                        resolve as any
                    )
                })
            })
    }

    _handleClickItem = (macroId: number) => {
        this.props.toggleCreateMacro && this.props.toggleCreateMacro(false)
        this.setState({selectedMacroId: macroId})
    }

    _updateMacros = (macros: List<any>) => {
        this.setState({macros})
    }

    _debounceLoadMacros = _debounce(this._loadMacros, 350)

    _onSearch = (search = '', forceSearch = false) => {
        this.setState({search})
        if (forceSearch || !search.trim().length || search.trim().length > 1) {
            void this._debounceLoadMacros({search, page: 1})
        }
    }

    render() {
        const {
            activeView,
            agents,
            disableExternalActions,
            selectionMode,
            selectedItemsIds,
            closeModal,
            isCreatingMacro,
            toggleCreateMacro,
            allViewItemsSelected,
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
            />
        )
    }
}

const connector = connect((state: RootState) => ({
    agents: getAgents(state),
    allViewItemsSelected: viewsSelectors.areAllActiveViewItemsSelected(state),
}))

export default withCancellableRequest<
    'fetchMacrosCancellable',
    'cancelFetchMacrosCancellable',
    typeof MacroActions.fetchMacros
>(
    'fetchMacrosCancellable',
    MacroActions.fetchMacros
)(connector(MacroContainer))
