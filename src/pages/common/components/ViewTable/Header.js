import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'
import {Link, browserHistory, withRouter} from 'react-router'
import {fromJS} from 'immutable'
import _get from 'lodash/get'

import EditableTitle from '../EditableTitle'
import FilterTopbar from './FilterTopbar'
import Search from '../Search'
import {slugify} from '../../../../utils'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

class Header extends React.Component {
    static propTypes = {
        // a React element not instantiated is a function
        ActionsComponent: PropTypes.func,
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        deleteView: PropTypes.func.isRequired,
        fetchPage: PropTypes.func.isRequired,
        isSearch: PropTypes.bool.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        item: ImmutablePropTypes.map.isRequired,
        lastViewId: PropTypes.number,
        router: PropTypes.object.isRequired,
        selectedItemsIds: ImmutablePropTypes.list.isRequired,
        type: PropTypes.string.isRequired,
        updateView: PropTypes.func.isRequired,
    }

    static defaultProps = {
        item: fromJS({}),
    }

    state = {
        askDeleteConfirmation: false,
    }

    _goBackUrl = () => {
        const {config, lastViewId} = this.props

        let url = `/app/${config.get('routeList')}`

        if (lastViewId) {
            url += `/${lastViewId}`
        }

        return url
    }

    _searchQuery = () => {
        return _get(this.props, 'location.query.q', '')
    }

    _search = (searchQuery) => {
        const {config} = this.props

        if (searchQuery) {
            // add search to view and ask page of view (will return search result)
            browserHistory.push(`/app/${config.get('routeList')}/search?q=${searchQuery}`)
        } else {
            // set the previous view back
            browserHistory.push(this._goBackUrl())
        }
    }

    _updateViewName = (name) => {
        this.props.updateView(this.props.activeView.merge({
            name,
            slug: slugify(name),
        }))
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    render() {
        const {
            ActionsComponent,
            activeView,
            config,
            isSearch,
            isUpdate,
            selectedItemsIds,
            type,
        } = this.props

        const isEditMode = activeView.get('editMode')

        return (
            <div>
                <div>
                    <div className="d-flex justify-content-between mb-2">
                        {
                            isUpdate && !isSearch && (
                                <UncontrolledDropdown className="d-inline-block hidden-sm-down">
                                    <DropdownToggle
                                        caret
                                        type="button"
                                        id="settings-view-button"
                                        className="mr-2"
                                    >
                                        <i className="fa fa-cog fa-fw mr-2" />
                                        Settings
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem
                                            type="button"
                                            onClick={() => this.props.updateView(activeView)}
                                        >
                                            Edit view
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem
                                            type="button"
                                            onClick={this._toggleDeleteConfirmation}
                                        >
                                            <span className="text-danger">Delete view</span>
                                            <Popover
                                                placement="bottom"
                                                isOpen={this.state.askDeleteConfirmation}
                                                target="settings-view-button"
                                                toggle={this._toggleDeleteConfirmation}
                                            >
                                                <PopoverTitle>Are you sure?</PopoverTitle>
                                                <PopoverContent>
                                                    <p>
                                                        You are about to <b>delete</b> this view for <b>all users</b>.
                                                    </p>
                                                    <Button
                                                        type="submit"
                                                        color="success"
                                                        onClick={() => {
                                                            this.props.deleteView(activeView)
                                                            this._toggleDeleteConfirmation()
                                                        }}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </PopoverContent>
                                            </Popover>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            )
                        }

                        {
                            isSearch && (
                                <Link
                                    className="btn btn-secondary mr-2"
                                    to={this._goBackUrl()}
                                >
                                    <i className="fa fa-fw fa-arrow-left mr-2" />
                                    Back
                                </Link>
                            )
                        }

                        <Search
                            bindKey
                            onChange={this._search}
                            className="pull-right"
                            placeholder={`Search ${config.get('plural')}...`}
                            searchDebounceTime={400}
                            location={`${activeView.get('id')}${!!isSearch && '(s)'}`}
                            forcedQuery={this._searchQuery()}
                        />
                    </div>

                    <div className="clearfix d-flex flex-row align-items-center">
                        {
                            isSearch ? (
                                    <EditableTitle
                                        className="mr-2"
                                        title={activeView.get('name', '')}
                                        disabled
                                    />
                                ) : (
                                    <EditableTitle
                                        className="mr-2"
                                        select={!isUpdate}
                                        title={activeView.get('name', '')}
                                        placeholder="View name"
                                        update={(name) => {
                                            if (name !== activeView.get('name')) {
                                                this._updateViewName(name)
                                            }
                                        }}
                                        disabled={!isEditMode}
                                        forceEditMode={isEditMode}
                                    />
                                )
                        }

                        {
                            ActionsComponent && (
                                <ActionsComponent
                                    view={activeView}
                                    selectedItemsIds={selectedItemsIds}
                                />
                            )
                        }
                    </div>
                </div>
                <FilterTopbar
                    isUpdate={isUpdate}
                    type={type}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        config: viewsSelectors.getViewConfig(ownProps.type),
        lastViewId: viewsSelectors.getLastViewId(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}

const mapDispatchToProps = {
    deleteView: viewsActions.deleteView,
    fetchPage: viewsActions.fetchPage,
    removeFieldFilter: viewsActions.removeFieldFilter,
    toggleSelection: viewsActions.toggleSelection,
    updateView: viewsActions.updateView,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))
