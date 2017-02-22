import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import classNames from 'classnames'

import Filters from './Filters'
import {slugify} from '../../../../utils'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as usersSelectors from '../../../../state/users/selectors'

class FilterTopbar extends React.Component {
    static propTypes = {
        activeView: ImmutablePropTypes.map.isRequired,
        agents: PropTypes.object.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        currentUser: PropTypes.object.isRequired,
        fetchPage: PropTypes.func.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        pristineActiveView: ImmutablePropTypes.map.isRequired,
        removeFieldFilter: PropTypes.func.isRequired,
        updateFieldFilter: PropTypes.func.isRequired,
        updateFieldFilterOperator: PropTypes.func.isRequired,
        resetView: PropTypes.func.isRequired,
        submitView: PropTypes.func.isRequired,
    }

    state = {
        isSubmitting: false
    }

    _onClickUpdate = () => {
        const activeView = this.props.activeView

        if (window.confirm('You\'re about to edit this view for all users. Are you sure?')) {
            this.setState({
                isSubmitting: true
            })
            this._submitView(activeView)
            logEvent('Updated view')
        }
    }

    _onClickNew = () => {
        this.setState({
            isSubmitting: true
        })

        let activeView = this.props.activeView
        const original = this.props.pristineActiveView

        // new means it has no id set
        activeView = activeView.delete('id')

        // if the name wasn't changed, add (copy) to it
        if (original.get('name') === activeView.get('name')) {
            const newName = `${activeView.get('name', '')} - copy`
            const newSlug = slugify(newName)

            activeView = activeView
                .set('name', newName)
                .set('slug', newSlug)
        }

        this._submitView(activeView)
        logEvent('Saved as new view')
    }

    _cancel = () => {
        const {config, isUpdate, fetchPage, resetView} = this.props
        if (isUpdate) {
            // if is updating an existing view, on cancel we reset current view
            resetView()
            fetchPage(1)
        } else {
            // if is updating an existing view, on cancel we leave edition
            browserHistory.push(`/app/${config.get('routeList')}/`)
        }
    }

    _createView = () => {
        this.setState({
            isSubmitting: true
        })

        let activeView = this.props.activeView
        // new means it has no id set
        activeView = activeView
            .delete('id')
            .set('name', activeView.get('name') || 'New view')
        activeView = activeView.set('slug', slugify(activeView.get('name')))

        this._submitView(activeView)
        logEvent('Created a new view')
    }

    _submitView = (view) => {
        this.props.submitView(view).then(() => {
            this.setState({
                isSubmitting: false
            })
        })
    }

    render() {
        const {activeView, isUpdate, agents, currentUser} = this.props
        const {isSubmitting} = this.state
        const buttonClass = classNames('ui', 'button', {loading: this.state.isSubmitting})
        if (!activeView.get('editMode')) {
            return null
        }

        return (
            <div className="filter-topbar">
                <div className="filter-topbar-content">
                    <Filters
                        view={activeView}
                        removeFieldFilter={(...args) => {
                            this.props.removeFieldFilter(...args)
                            this.props.fetchPage(1)
                        }}
                        updateFieldFilterOperator={(...args) => {
                            this.props.updateFieldFilterOperator(...args)
                            this.props.fetchPage(1)
                        }}
                        agents={agents}
                        currentUser={currentUser}
                        updateFieldFilter={(...args) => {
                            this.props.updateFieldFilter(...args)
                            this.props.fetchPage(1)
                        }}
                    />

                    <button
                        type="button"
                        className="filter-topbar-close"
                        onClick={this._cancel}
                    >
                        <i className="icon remove large" />
                    </button>
                </div>
                <div className="filter-topbar-actions">
                    {isUpdate ?
                        <span>
                            <button
                                className={`${buttonClass} green`}
                                disabled={isSubmitting}
                                onClick={this._onClickUpdate}
                            >
                                UPDATE VIEW
                            </button>
                            <button
                                className={buttonClass}
                                disabled={isSubmitting}
                                onClick={this._onClickNew}
                            >
                                SAVE AS NEW VIEW
                            </button>
                        </span>
                        :
                        <button
                            className={`${buttonClass} green`}
                            disabled={isSubmitting}
                            onClick={this._createView}
                        >
                            CREATE VIEW
                        </button>
                    }
                    <span className="ml15 text-light-black">
                        <i className="info circle icon" />
                        Click on a column's name to add a filter.
                    </span>

                    <button
                        className="ui button floated right"
                        onClick={this._cancel}
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        agents: usersSelectors.getAgents(state),
        activeView: viewsSelectors.getActiveView(state),
        config: viewsSelectors.getViewConfig(ownProps.type),
        currentUser: state.currentUser,
        isEditMode: viewsSelectors.isEditMode(state),
        pristineActiveView: viewsSelectors.getPristineActiveView(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}

const mapDispatchToProps = {
    deleteView: viewsActions.deleteView,
    fetchPage: viewsActions.fetchPage,
    toggleSelection: viewsActions.toggleSelection,
    updateView: viewsActions.updateView,
    removeFieldFilter: viewsActions.removeFieldFilter,
    resetView: viewsActions.resetView,
    submitView: viewsActions.submitView,
    updateFieldFilter: viewsActions.updateFieldFilter,
    updateFieldFilterOperator: viewsActions.updateFieldFilterOperator,
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterTopbar)
