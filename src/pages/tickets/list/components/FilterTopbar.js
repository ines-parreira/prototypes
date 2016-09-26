import React, {PropTypes} from 'react'
import ViewFilters from './ViewFilters'


export default class FilterTopbar extends React.Component {
    _onClickUpdate = () => {
        amplitude.getInstance().logEvent('Updated view')
        const view = this.props.views.get('active')

        if (window.confirm('You\'re about to edit this view for all users. Are you sure?')) {
            this.props.submitView(view)
        }
    }

    _onClickNew = () => {
        amplitude.getInstance().logEvent('Saved as new view')

        let active = this.props.views.get('active')
        const original = this.props.views.get('items').find(v => v.get('id') === active.get('id'))

        // new means it has no id set
        active = active.delete('id')

        // if the name wasn't changed, add (copy) to it
        if (original.get('name') === active.get('name')) {
            const newName = `${active.get('name')} - copy`
            const newSlug = newName.toLowerCase().trim().replace(/[ ]/g, '-')

            active = active.set('name', newName).set('slug', newSlug)
        }

        this.props.submitView(active)
    }

    render() {
        const {views, agents, tags, currentUser, updateFieldFilter} = this.props
        const view = views.get('active')
        if (!views.getIn(['active', 'editMode'])) {
            return null
        }

        return (
            <div className="filter-topbar">
                <div className="filter-topbar-content">
                    <ViewFilters
                        view={view}
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
                    <button
                        className="ui green button right floated"
                        onClick={this._onClickUpdate}
                    >
                        UPDATE VIEW
                    </button>
                    <button
                        className="ui button right floated filter-topbar-save-new"
                        onClick={this._onClickNew}
                    >
                        SAVE AS NEW VIEW
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
    tags: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
