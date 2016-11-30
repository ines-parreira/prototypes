import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setFieldVisibility} from '../../../../state/views/actions'

class ShowMoreFieldsDropdown extends React.Component {
    componentDidMount = () => {
        $(this.refs.showmoreButton)
            .popup({
                distanceAway: 6,
                offset: 11,
                popup: $(this.refs.showmorePopup),
                on: 'click',
                position: 'bottom right',
                onVisible: () => amplitude.getInstance().logEvent('Opened more fields (column options)')
            })
    }

    _setFieldVisibility = (name, state) => {
        $(this.refs.showmoreButton).popup('hide')
        return this.props.setFieldVisibility(name, state)
    }

    render() {
        const {visibleFields} = this.props

        return (
            <th className="show-more-fields-dropdown">
                <div className="show-more-fields-dropdown-icon">
                    <i
                        ref="showmoreButton"
                        className="block layout icon"
                        title="Show more fields"
                    />
                </div>
                <div
                    ref="showmorePopup"
                    className="ui popup"
                >
                    <div className="ui form">
                        <div className="grouped fields">
                            {
                                this.props.fields
                                    .map((field) => {
                                        const isChecked = visibleFields.includes(field.get('name'))

                                        return (
                                            <div
                                                className="field"
                                                key={field.get('name')}
                                            >
                                                <div className="ui checkbox">
                                                    <input
                                                        id="field-visibility-{field.get('name')}"
                                                        type="checkbox"
                                                        name={field.get('name')}
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            this._setFieldVisibility(field.get('name'), !isChecked)
                                                        }}
                                                    />
                                                    <label htmlFor="field-visibility-{field.get('name')}">
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
            </th>
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

