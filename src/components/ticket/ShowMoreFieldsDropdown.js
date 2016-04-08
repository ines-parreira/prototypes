import React, {PropTypes} from 'react'
import TicketColumns from './TicketColumns'
import _ from 'lodash'


export default class ShowMoreFieldsDropdown extends React.Component {
    getCheckboxColumns = () => {
        return $('.ShowMoreFieldsDropdown .checkbox input:checked').map(function () {
            return $(this).attr('name')
        })
    }

    componentDidMount = () => {
        $('#showmorefields').popup({
            popup: $('.custom.popup'),
            on: 'click',
            position: 'bottom center',
        })
    }

    renderCheckbox = (column) => {
        const checked = this.props.columns.includes(column.name)
        return (
            <div className="field" key={column.name}>
                <div className="ui checkbox">
                    <input
                        type="checkbox"
                        name={column.name}
                        checked={checked}
                        onChange={() => this.props.updateView({
                            columns: [...this.getCheckboxColumns()]
                        })}
                    />
                    <label>{column.header}</label>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="ShowMoreFieldsDropdown">
                <div id="showmorefields" className="ui borderless label light blue basic custom">
                    <i className="columns icon"/>
                    Show more fields
                </div>
                <div className="ui popup custom">
                    <div className="ui form">
                        <div className="grouped fields">
                            {_.sortBy(TicketColumns.toJS(), 'name').map(this.renderCheckbox)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ShowMoreFieldsDropdown.propTypes = {
    updateView: PropTypes.func.isRequired,
    columns: PropTypes.object.isRequired,
}
