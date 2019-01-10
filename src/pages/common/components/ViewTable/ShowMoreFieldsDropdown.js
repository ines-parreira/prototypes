import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {setFieldVisibility} from '../../../../state/views/actions'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import {notify} from '../../../../state/notifications/actions'

import BooleanField from '../../forms/BooleanField'

class ShowMoreFieldsDropdown extends React.Component {
    _setFieldVisibility = (name, state) => {
        if (!state && this.props.visibleFields.size <= 1) {
            return this.props.notify({
                status: 'error',
                message: 'You can not remove all columns of a view',
            })
        }

        return this.props.setFieldVisibility(name, state)
    }

    render() {
        const visibleFieldsNames = this.props.visibleFields.map(field => field.get('name'))

        return (
            <UncontrolledDropdown
                className="d-flex"
                onClick={() => {
                    segmentTracker.logEvent(segmentTracker.EVENTS.SHOW_MORE_FIELDS_CLICKED)
                }}
            >
                <DropdownToggle
                    className="d-none d-md-inline-block text-secondary"
                    color="link"
                    type="button"
                    caret
                >
                    <i className="icon material-icons md-2">view_column</i>
                </DropdownToggle>
                <DropdownMenu right>
                    <DropdownItem
                        className="pb-2"
                        header
                    >
                        COLUMNS
                    </DropdownItem>
                    {
                        this.props.fields
                            .map((field) => {
                                const isMandatory = this.props.config.get('mainField') === field.get('name')
                                const isChecked = visibleFieldsNames.includes(field.get('name')) || isMandatory
                                let setFieldVisibility = (value) => this._setFieldVisibility(field.get('name'), value)

                                return (
                                    <DropdownItem
                                        key={field.get('name')}
                                        tag="label"
                                        className="pt-1 pb-1 mb-0"
                                        toggle={false}
                                        disabled={isMandatory}
                                    >
                                        <BooleanField
                                            value={isChecked}
                                            onChange={setFieldVisibility}
                                            label={field.get('title')}
                                            disabled={isMandatory}
                                        />
                                    </DropdownItem>
                                )
                            })
                    }
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }
}

ShowMoreFieldsDropdown.propTypes = {
    config: ImmutablePropTypes.map.isRequired,
    setFieldVisibility: PropTypes.func,
    fields: PropTypes.object,
    visibleFields: PropTypes.object.isRequired,
    notify: PropTypes.func.isRequired,
}

function mapDispatchToProps(dispatch) {
    return {
        setFieldVisibility: bindActionCreators(setFieldVisibility, dispatch),
        notify: bindActionCreators(notify, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(ShowMoreFieldsDropdown)

