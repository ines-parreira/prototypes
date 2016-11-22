import React, {PropTypes} from 'react'
import ViewFilters from './ComplexTableFilters'
import {slugify} from '../../../../utils'

export default class FilterTopbar extends React.Component {
    _onClickUpdate = () => {
        amplitude.getInstance().logEvent('Updated view')
        const activeView = this.props.views.get('active')

        if (window.confirm('You\'re about to edit this view for all users. Are you sure?')) {
            this.props.submitView(activeView)
        }
    }

    _onClickNew = () => {
        amplitude.getInstance().logEvent('Saved as new view')

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

        this.props.submitView(activeView)
    }

    render() {
        const {views, agents, tags, currentUser, updateFieldFilter} = this.props
        const activeView = views.get('active')
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
                        tags={tags}
                        currentUser={currentUser}
                        updateFieldFilter={updateFieldFilter}
                    />

                    <button
                        type="button"
                        className="filter-topbar-close"
                        onClick={this.props.resetView}
                    >
                        <i className="icon remove large" />
                    </button>
                </div>
                <div className="filter-topbar-actions">
                    <button
                        className="ui button"
                        onClick={this.props.resetView}
                    >
                        CANCEL
                    </button>
                    <span className="ml15 text-light-black">
                        <i className="info circle icon"/>
                        Click on a column's name to add a filter.
                    </span>
                    <div className="ui right floated">
                        <button
                            className="ui button"
                            onClick={this._onClickNew}
                        >
                            SAVE AS NEW VIEW
                        </button>
                        <button
                            className="ui green button"
                            onClick={this._onClickUpdate}
                        >
                            UPDATE VIEW
                        </button>
                    </div>
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
    tags: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
