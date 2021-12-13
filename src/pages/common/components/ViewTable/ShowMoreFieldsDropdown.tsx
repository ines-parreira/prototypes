import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'
import {Map, List} from 'immutable'

import {GorgiasThunkDispatch} from 'types/redux-thunk'
import {setFieldVisibility} from '../../../../state/views/actions'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import {notify} from '../../../../state/notifications/actions'

import BooleanField from '../../forms/BooleanField.js'
import {NotificationStatus} from '../../../../state/notifications/types'

type OwnProps = {
    config: Map<any, any>
    fields: List<any>
    visibleFields: List<any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

class ShowMoreFieldsDropdown extends React.Component<Props> {
    _setFieldVisibility = (name: string, state: boolean) => {
        if (!state && this.props.visibleFields.size <= 1) {
            return this.props.notify({
                status: NotificationStatus.Error,
                message: 'You can not remove all columns of a view',
            })
        }

        return this.props.setFieldVisibility(name, state)
    }

    render() {
        const visibleFieldsNames = this.props.visibleFields.map(
            (field: Map<any, any>) => field.get('name') as string
        )

        return (
            <UncontrolledDropdown
                className="d-flex"
                onClick={() => {
                    segmentTracker.logEvent(
                        segmentTracker.EVENTS.SHOW_MORE_FIELDS_CLICKED
                    )
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
                    <DropdownItem className="pb-2" header>
                        COLUMNS
                    </DropdownItem>
                    {this.props.fields.map((field: Map<any, any>) => {
                        const isMandatory =
                            this.props.config.get('mainField') ===
                            field.get('name')
                        const isChecked =
                            visibleFieldsNames.includes(field.get('name')) ||
                            isMandatory
                        const setFieldVisibility = (value: boolean) =>
                            this._setFieldVisibility(field.get('name'), value)

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
                    })}
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }
}

function mapDispatchToProps(dispatch: GorgiasThunkDispatch<any, any, any>) {
    return {
        setFieldVisibility: bindActionCreators(setFieldVisibility, dispatch),
        notify: bindActionCreators(notify, dispatch),
    }
}

const connector = connect(null, mapDispatchToProps)

export default connector(ShowMoreFieldsDropdown)
