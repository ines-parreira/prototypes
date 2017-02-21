import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setFieldVisibility} from '../../../../state/views/actions'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

class ShowMoreFieldsDropdown extends React.Component {
    componentDidMount = () => {
        $(this.refs.showmoreButton)
            .popup({
                distanceAway: 6,
                offset: 11,
                popup: $(this.refs.showmorePopup),
                on: 'click',
                position: 'bottom right',
                onVisible: () => logEvent('Opened more fields (column options)')
            })
    }

    _setFieldVisibility = (name, state) => {
        if (!state && this.props.visibleFields.size <= 1) {
            return window.alert('You can not remove all columns of a view')
        }

        $(this.refs.showmoreButton).popup('hide')
        return this.props.setFieldVisibility(name, state)
    }

    render() {
        const visibleFieldsNames = this.props.visibleFields.map(field => field.get('name'))

        return (
            <div>
                <i
                    ref="showmoreButton"
                    className="block layout icon"
                    title="Show more fields"
                    style={{cursor: 'pointer'}}
                />
                <div
                    ref="showmorePopup"
                    className="ui popup"
                >
                    <div className="ui form">
                        <div className="grouped fields">
                            {
                                this.props.fields
                                    .map((field) => {
                                        const isChecked = visibleFieldsNames.includes(field.get('name'))

                                        return (
                                            <div
                                                className="field"
                                                key={field.get('name')}
                                            >
                                                <div className="ui checkbox">
                                                    <input
                                                        id={`field-visibility-${field.get('name')}`}
                                                        type="checkbox"
                                                        name={field.get('name')}
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            this._setFieldVisibility(field.get('name'), !isChecked)
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`field-visibility-${field.get('name')}`}
                                                        style={{cursor: 'pointer'}}
                                                    >
                                                        {field.get('title')}
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ShowMoreFieldsDropdown.propTypes = {
    setFieldVisibility: PropTypes.func,
    fields: PropTypes.object,
    visibleFields: PropTypes.object.isRequired,
}

function mapDispatchToProps(dispatch) {
    return {
        setFieldVisibility: bindActionCreators(setFieldVisibility, dispatch)
    }
}

export default connect(null, mapDispatchToProps)(ShowMoreFieldsDropdown)

