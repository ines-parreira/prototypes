import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import EditableTitle from '../EditableTitle'
import FilterTopbar from './FilterTopbar'
import Search from '../Search'
import {slugify} from '../../../../utils'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

import css from './Page.less'

class Header extends React.Component {
    static propTypes = {
        // a React element not instantiated is a function
        ActionsComponent: PropTypes.func,
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        deleteView: PropTypes.func.isRequired,
        fetchPage: PropTypes.func.isRequired,
        isEditMode: PropTypes.bool.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        item: ImmutablePropTypes.map.isRequired,
        selectedItemsIds: ImmutablePropTypes.list.isRequired,
        type: PropTypes.string.isRequired,
        updateView: PropTypes.func.isRequired,
    }

    static defaultProps = {
        item: fromJS({}),
    }

    _search = (searchQuery) => {
        const activeView = this.props.activeView

        if (searchQuery) {
            this.props.updateView(activeView.merge({search: searchQuery}))
            this.props.fetchPage(1)
        } else if (activeView.get('search')) {
            this.props.updateView(activeView.set('search', null))
            this.props.fetchPage(1)
        }
    }

    _updateViewName = (name) => {
        this.props.updateView(this.props.activeView.merge({
            name,
            slug: slugify(name),
        }))
    }

    render() {
        const {
            ActionsComponent,
            activeView,
            config,
            isEditMode,
            isUpdate,
            selectedItemsIds,
            type,
        } = this.props

        const canSelectItem = !isEditMode

        return (
            <div>
                <div>
                    <div className="ui text menu sticky-header-search">
                        <div className="left menu item">
                            {
                                isUpdate && (
                                    <div
                                        className={classnames('ui dropdown', css.settings)}
                                        ref={(dropdown) => {
                                            $(dropdown).dropdown({
                                                action: () => {
                                                    // HACK action='hide' does not work
                                                    // as described in the docs.
                                                    $(dropdown).dropdown('hide')
                                                }
                                            })
                                        }}
                                    >
                                        <i className="setting icon" />
                                        <div className="text">VIEW SETTINGS</div>
                                        <div className="menu">
                                            <div
                                                className="item"
                                                onClick={() => this.props.updateView(activeView)}
                                            >
                                                Edit view
                                            </div>
                                            <div className="divider"></div>
                                            <div
                                                className="item red text"
                                                onClick={() => this.props.deleteView(activeView)}
                                            >
                                                Delete view
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        <div className="right menu item">
                            <Search
                                autofocus
                                bindKey
                                onChange={this._search}
                                className="long"
                                forcedQuery={activeView.getIn(['search', 'query'])}
                                placeholder={`Search ${config.get('plural')}`}
                                searchDebounceTime={400}
                                location={activeView.get('id')}
                            />
                        </div>
                    </div>

                    <div className="ui sixteen wide column flex-spaced-row no-wrap view-header">
                        <EditableTitle
                            select={!isUpdate}
                            style={{margin: '0 8px 0 0'}}
                            title={activeView.get('name', '')}
                            placeholder="View name"
                            update={(name) => {
                                if (name !== activeView.get('name')) {
                                    this._updateViewName(name)
                                }
                            }}
                        />
                        {
                            ActionsComponent
                            && (
                                <ActionsComponent
                                    hasBulkActions={canSelectItem}
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
        isEditMode: viewsSelectors.isEditMode(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(Header)
