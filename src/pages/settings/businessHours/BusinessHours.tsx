import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List} from 'immutable'
import {Link} from 'react-router-dom'
import {Button, Row, Col, Container, Form, Label} from 'reactstrap'
import classnames from 'classnames'

import PageHeader from '../../common/components/PageHeader'
import InputField from '../../common/forms/InputField.js'
import {getMomentTimezoneNames} from '../../../utils/date'
import {submitSetting} from '../../../state/currentAccount/actions'
import {DEPRECATED_getBusinessHoursSettings} from '../../../state/currentAccount/selectors'
import {RootState} from '../../../state/types'
import {
    AccountSettingType,
    AccountSettingBusinessHours,
} from '../../../state/currentAccount/types'
import settingsCss from '../settings.less'

import {DEFAULT_BUSINESS_HOUR, MAX_BUSINESS_HOURS} from './constants.js'
import BusinessHoursForm from './BusinessHoursForm'
import css from './BusinessHours.less'

type Props = ConnectedProps<typeof connector>

type State = {
    items: List<any>
    timezone: string
    loading: boolean
}

export class BusinessHoursContainer extends Component<Props, State> {
    state: State = {
        items: fromJS([DEFAULT_BUSINESS_HOUR]),
        timezone: 'UTC',
        loading: false,
    }

    componentDidMount() {
        const {businessHoursSettings} = this.props

        if (!businessHoursSettings.isEmpty()) {
            this.setState({
                timezone: businessHoursSettings.getIn(['data', 'timezone']),
                items: businessHoursSettings.getIn(['data', 'business_hours']),
            })
        }
    }

    _onSubmit = async (evt: Event) => {
        evt.preventDefault()
        this.setState({loading: true})

        const {businessHoursSettings} = this.props
        const {timezone, items} = this.state

        const setting: AccountSettingBusinessHours = {
            id: businessHoursSettings.get('id'),
            type: AccountSettingType.BusinessHours,
            data: {
                timezone: timezone,
                business_hours: items.toJS(),
            },
        }

        try {
            await this.props.submitSetting(setting)
        } catch (error) {
            // pass
        }

        return this.setState({loading: false})
    }

    _addBusinessHours = () => {
        const {items} = this.state

        if (items.size >= MAX_BUSINESS_HOURS) {
            return
        }

        this.setState({items: items.push(DEFAULT_BUSINESS_HOUR)})
    }

    render() {
        const {items} = this.state

        return (
            <div className="full-width">
                <PageHeader title="Business hours" />

                <Container fluid className={settingsCss.pageContainer}>
                    <div
                        className={classnames(
                            settingsCss['body-regular'],
                            settingsCss.contentWrapper
                        )}
                    >
                        <div className={settingsCss.mb32}>
                            <p>
                                Let customers know when your team is online.
                                <br />
                                This way, you can set different auto-responders
                                in the rules based on when your team is working.
                            </p>
                            <p>
                                The appearance of your{' '}
                                <Link to="/app/settings/integrations/gorgias_chat">
                                    Chat integrations
                                </Link>{' '}
                                will change when outside business hours.
                            </p>
                        </div>

                        <Form onSubmit={this._onSubmit as any}>
                            <Row>
                                <Col>
                                    <div
                                        className={classnames(
                                            settingsCss.inputField,
                                            settingsCss.mb32
                                        )}
                                    >
                                        <Label className="control-label">
                                            Business hours
                                        </Label>
                                        {items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={classnames(
                                                    'flex',
                                                    settingsCss.mb24
                                                )}
                                            >
                                                <BusinessHoursForm
                                                    businessHour={item}
                                                    onChange={(data) =>
                                                        this.setState({
                                                            items: items.set(
                                                                idx!,
                                                                data
                                                            ),
                                                        })
                                                    }
                                                />
                                                <div
                                                    className={css.deleteButton}
                                                    onClick={() =>
                                                        this.setState({
                                                            items: items.delete(
                                                                idx!
                                                            ),
                                                        })
                                                    }
                                                >
                                                    <i className="material-icons red">
                                                        clear
                                                    </i>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            onClick={this._addBusinessHours}
                                        >
                                            <i className="material-icons">
                                                add
                                            </i>{' '}
                                            Add business hours
                                        </Button>
                                    </div>

                                    <InputField
                                        type="select"
                                        name="timezone"
                                        label="Time zone"
                                        value={this.state.timezone}
                                        onChange={(timezone) =>
                                            this.setState({timezone})
                                        }
                                        className={classnames(
                                            settingsCss.inputField,
                                            settingsCss.mb40
                                        )}
                                    >
                                        {getMomentTimezoneNames().map(
                                            (name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            )
                                        )}
                                    </InputField>
                                </Col>
                            </Row>

                            <Button
                                type="submit"
                                color="success"
                                className={classnames({
                                    'btn-loading': this.state.loading,
                                })}
                                disabled={this.state.loading}
                            >
                                Save Changes
                            </Button>
                        </Form>
                    </div>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        businessHoursSettings: DEPRECATED_getBusinessHoursSettings(state),
    }),
    {
        submitSetting,
    }
)

export default connector(BusinessHoursContainer)
