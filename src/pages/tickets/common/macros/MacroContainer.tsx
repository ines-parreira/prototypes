import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import _debounce from 'lodash/debounce'

import {
    fetchMacros,
    fetchMacrosParamsTypes,
    MacrosSearchResult,
} from 'state/macro/actions'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest'
import * as viewsSelectors from '../../../../state/views/selectors'
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
        typeof fetchMacros
    >

type State = {
    searchParams: fetchMacrosParamsTypes
    searchResults: MacrosSearchResult
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
        searchParams: {},
        searchResults: {
            page: 1,
            totalPages: 1,
            macros: fromJS([]),
        },
        selectedMacroId: null,
        firstLoad: true,
    }

    componentDidMount() {
        void this._loadMacros().then(() => {
            if (!this.props.selectedMacro.isEmpty()) {
                const currentMacro = getCurrentMacro(
                    this.state.searchResults.macros,
                    this.props.selectedMacro.get('id'),
                    this.props.isCreatingMacro
                )

                this.setState({
                    selectedMacroId: this.props.selectedMacro.get('id'),
                })
                // selectedMacro is not in page=1 macro list
                if (currentMacro.isEmpty()) {
                    // search for it
                    this._onSearch(
                        {search: this.props.selectedMacro.get('name')},
                        true
                    )
                }
            }
        })
    }

    _loadMacros = (
        searchParams: fetchMacrosParamsTypes = {search: '', page: 1}
    ): Promise<void> => {
        return this.props
            .fetchMacrosCancellable(
                {
                    ...searchParams,
                    currentMacros: this.state.searchResults.macros,
                    currentPage: this.state.searchResults.page,
                },
                'name',
                'asc'
            )
            .then((res) => {
                if (!res || !res.macros) return

                const selectedMacroId = getDefaultSelectedMacroId(
                    res.macros,
                    this.state.selectedMacroId,
                    this.props.isCreatingMacro
                )
                return new Promise((resolve) => {
                    this.setState(
                        {
                            selectedMacroId,
                            searchResults: {
                                macros: res.macros,
                                page: res.page,
                                totalPages: res.totalPages,
                            },
                            firstLoad: false,
                        },
                        resolve
                    )
                })
            })
    }

    _handleClickItem = (macroId: number) => {
        this.props.toggleCreateMacro && this.props.toggleCreateMacro(false)
        this.setState({selectedMacroId: macroId})
    }

    _updateMacros = (macros: List<any>) => {
        this.setState({
            searchResults: {
                ...this.state.searchResults,
                macros: macros,
            },
        })
    }

    _debounceLoadMacros = _debounce(this._loadMacros, 350)

    _onSearch = (
        searchParams: fetchMacrosParamsTypes = {},
        forceSearch = false
    ) => {
        this.setState({
            searchParams: {...this.state.searchParams, ...searchParams},
        })
        if (
            forceSearch ||
            !searchParams.search?.trim().length ||
            searchParams.search.trim().length > 1
        ) {
            void this._debounceLoadMacros({...searchParams, page: 1})
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
            this.state.searchResults.macros,
            this.state.selectedMacroId,
            isCreatingMacro
        )

        return (
            <MacroModal
                closeModal={closeModal}
                activeView={activeView}
                searchParams={this.state.searchParams}
                searchResults={this.state.searchResults}
                fetchMacros={this._loadMacros}
                firstLoad={this.state.firstLoad}
                currentMacro={currentMacro}
                agents={agents}
                disableExternalActions={disableExternalActions || false}
                selectionMode={selectionMode || false}
                selectedItemsIds={selectedItemsIds}
                handleClickItem={this._handleClickItem}
                updateMacros={this._updateMacros}
                onSearch={this._onSearch}
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
    typeof fetchMacros
>(
    'fetchMacrosCancellable',
    fetchMacros
)(connector(MacroContainer))
