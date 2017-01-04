import React, {PropTypes} from 'react'
import ViewFilters from './ComplexTableFilters'
import {browserHistory} from 'react-router'
import {slugify, getPluralObjectName} from '../../../../utils'
import classNames from 'classnames'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

export default class FilterTopbar extends React.Component {
    state = {
        isSubmitting: false
    }

    _onClickUpdate = () => {
        logEvent('Updated view')
        const activeView = this.props.views.get('active')

        if (window.confirm('You\'re about to edit this view for all users. Are you sure?')) {
            this.setState({
                isSubmitting: true
            })
            this._submitView(activeView)
        }
    }

    _onClickNew = () => {
        this.setState({
            isSubmitting: true
        })
        logEvent('Saved as new view')

        let activeView = this.props.views.get('active')
        const original = this.props.views
            .get('items')
            .find(v => v.get('id') === activeView.get('id'))

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
    }

    _cancel = () => {
        const {isUpdate, views, resetView} = this.props
        const objectName = getPluralObjectName(views.getIn(['active', 'type'], 'ticket-list'))

        if (isUpdate) {
            resetView()
        } else {
            browserHistory.push(`/app/${objectName}/`)
        }
    }

    _createView = () => {
        this.setState({
            isSubmitting: true
        })

        let activeView = this.props.views.get('active')
        // new means it has no id set
        activeView = activeView
            .delete('id')
            .set('name', activeView.get('name') || 'New view')
        activeView = activeView.set('slug', slugify(activeView.get('name')))

        logEvent('Created a new view')

        this._submitView(activeView)
    }

    _submitView = (view) => {
        this.props.submitView(view).then(() => {
            this.setState({
                isSubmitting: false
            })
        })
    }

    render() {
        const {isUpdate, views, agents, currentUser, updateFieldFilter} = this.props
        const {isSubmitting} = this.state
        const activeView = views.get('active')
        const buttonClass = classNames('ui', 'button', {loading: this.state.isSubmitting})
        if (!activeView.get('editMode')) {
            return null
        }

        return (
            <div className="filter-topbar">
                <div className="filter-topbar-content">
                    <ViewFilters
                        view={activeView}
                        removeFieldFilter={this.props.removeFieldFilter}
                        updateFieldFilterOperator={this.props.updateFieldFilterOperator}
                        schemas={this.props.schemas}
                        agents={agents}
                        currentUser={currentUser}
                        updateFieldFilter={updateFieldFilter}
                    />

                    <button
                        type="button"
                        className="filter-topbar-close"
                        onClick={this._cancel}
                    >
                        <i className="icon remove large"/>
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
                        <i className="info circle icon"/>
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

FilterTopbar.propTypes = {
    views: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    submitView: PropTypes.func.isRequired,
    resetView: PropTypes.func.isRequired,
    removeFieldFilter: PropTypes.func.isRequired,
    updateFieldFilter: PropTypes.func.isRequired,
    updateFieldFilterOperator: PropTypes.func.isRequired,

    agents: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired
}
