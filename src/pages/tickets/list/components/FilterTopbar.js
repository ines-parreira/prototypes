import React, {PropTypes} from 'react'
import ViewFilters from './ViewFilters'


export default class FilterTopbar extends React.Component {
    onClickUpdate = () => {
        amplitude.getInstance().logEvent('Updated view')
        const view = this.props.views.get('active')
        this.props.submitView(view)
    }

    onClickNew = () => {
        amplitude.getInstance().logEvent('Saved as new view')
        // new means it has no id set
        const view = this.props.views.get('active').delete('id')
        this.props.submitView(view)
    }

    onDelete = () => {
        const view = this.props.views.get('active')
        this.props.deleteView(view)
    }

    render() {
        const {views} = this.props
        const view = views.get('active')
        if (!views.getIn(['active', 'dirty'])) {
            return null
        }

        return (
            <div>
                <div className="ui card FilterTopbar" style={{ width: this.props.width }}>
                    <div className="content">
                        <ViewFilters
                            view={view}
                            removeFieldFilter={this.props.removeFieldFilter}
                            updateFieldFilterOperator={this.props.updateFieldFilterOperator}
                            schemas={this.props.schemas}
                        />
                    </div>
                </div>
                <div>
                    <div className="extra content">
                        <div className="right menu">
                            <button className="ui green label item" onClick={this.onClickUpdate}>
                                UPDATE VIEW
                            </button>
                            <button className="ui basic green label item" onClick={this.onClickNew}>
                                SAVE AS NEW VIEW
                            </button>
                            <button className="ui basic label right floated item" onClick={this.props.resetView}>
                                RESET VIEW
                            </button>
                            <button className="ui red label right floated item" onClick={this.onDelete}>
                                DELETE VIEW
                            </button>
                        </div>
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
    deleteView: PropTypes.func.isRequired,
    removeFieldFilter: PropTypes.func.isRequired,
    updateFieldFilterOperator: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired
}
