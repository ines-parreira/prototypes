import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Label,
    Input,
} from 'reactstrap'

import {setFieldVisibility} from '../../../../state/views/actions'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import css from './ShowMoreFieldsDropdown.less'

class ShowMoreFieldsDropdown extends React.Component {
    _setFieldVisibility = (name, state) => {
        if (!state && this.props.visibleFields.size <= 1) {
            return window.alert('You can not remove all columns of a view')
        }

        return this.props.setFieldVisibility(name, state)
    }

    render() {
        const visibleFieldsNames = this.props.visibleFields.map(field => field.get('name'))

        return (
            <UncontrolledDropdown
                onClick={() => logEvent('Opened more fields (column options)')}
            >
                <DropdownToggle
                    color="link"
                    type="button"
                    style={{
                        paddingTop: '2px',
                    }}
                >
                    <i className="fa fa-fw fa-table" />
                </DropdownToggle>
                <DropdownMenu right>
                    <DropdownItem header>Columns</DropdownItem>
                    {
                        this.props.fields
                            .map((field) => {
                                const isChecked = visibleFieldsNames.includes(field.get('name'))

                                return (
                                    <DropdownItem
                                        key={field.get('name')}
                                        type="button"
                                        className={css.item}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            this._setFieldVisibility(field.get('name'), !isChecked)
                                        }}
                                        toggle={false}
                                    >
                                        <Label
                                            check
                                            className={css.label}
                                        >
                                            <Input
                                                className="mr-2"
                                                type="checkbox"
                                                checked={isChecked}
                                            />
                                            {' '}{field.get('title')}
                                        </Label>
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

