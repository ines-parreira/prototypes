import React, {PropTypes} from 'react'
import TicketColumns from './TicketColumns'
import _ from 'lodash'


export default class ShowMoreFieldsDropdown extends React.Component {
    getCheckboxColumns = () => {
        return $('.ShowMoreFieldsDropdown .checkbox input:checked').map(function() {
            return $(this).attr('name')
        })
    }

    componentDidMount = () => {
        const self = this
        $('.ShowMoreFieldsDropdown .custom.button').popup({
          popup: $('.custom.popup'),
          on: 'click',
          position: 'bottom center',
        })

        $('.ShowMoreFieldsDropdown .checkbox').checkbox({
            onChange: (event) => {
                self.props.updateView({
                    columns: [...self.getCheckboxColumns()]
                })
            }
        })
    }

    renderCheckbox = (column) => {
        const checked = this.props.columns.includes(column.name)
        return (
            <div className="field" key={column.name}>
              <div className="ui checkbox">
                <input type="checkbox" name={column.name} defaultChecked={checked} />
                <label>{column.header}</label>
              </div>
            </div>
        )
    }

    render() {
        return (
            <div className="ShowMoreFieldsDropdown">
                <div className="ui button teal basic custom">
                    <i className="columns icon"/>
                    Show more fields
                </div>
                <div className="ui popup custom">
                    <div className="ui form">
                        <div className="grouped fields">
                            {
                                _.sortBy(TicketColumns.toJS(), 'name').map(this.renderCheckbox)
                            }
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
