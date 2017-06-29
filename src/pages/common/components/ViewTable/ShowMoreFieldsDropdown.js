import React, {PropTypes} from 'react'
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
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'
import {notify} from '../../../../state/notifications/actions'

import BooleanField from '../../forms/BooleanField'

class ShowMoreFieldsDropdown extends React.Component {
    _setFieldVisibility = (name, state) => {
        if (!state && this.props.visibleFields.size <= 1) {
            return this.props.notify({
                type: 'error',
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
                onClick={() => logEvent('Opened more fields (column options)')}
            >
                <DropdownToggle
                    className="hidden-sm-down"
                    color="link"
                    type="button"
                    style={{
                        paddingTop: '2px',
                    }}
                >
                    <i className="fa fa-fw fa-table" />
                </DropdownToggle>
                <DropdownMenu right>
                    <DropdownItem
                        className="pb-2"
                        header
                    >
                        Columns
                    </DropdownItem>
                    {
                        this.props.fields
                            .map((field) => {
                                const isMandatory = this.props.config.get('mainField') === field.get('name')
                                const isChecked = visibleFieldsNames.includes(field.get('name')) || isMandatory

                                return (
                                    <DropdownItem
                                        key={field.get('name')}
                                        type="button"
                                        className="pt-1 pb-1"
                                        style={{height: '28px'}}
                                        toggle={false}
                                        disabled={isMandatory}
                                    >
                                        <BooleanField
                                            value={isChecked}
                                            onChange={value => this._setFieldVisibility(field.get('name'), value)}
                                            label={field.get('title')}
                                            inline
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

