// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router-dom'
import {Button, Row, Col, Container, Form, Label} from 'reactstrap'
import classnames from 'classnames'

import PageHeader from '../../common/components/PageHeader.tsx'
import InputField from '../../common/forms/InputField'
import {getMomentTimezoneNames} from '../../../utils/date.ts'

import * as currentAccountActions from '../../../state/currentAccount/actions.ts'
import * as currentAccountConstants from '../../../state/currentAccount/constants'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors.ts'

import {DEFAULT_BUSINESS_HOUR, MAX_BUSINESS_HOURS} from './constants'
import BusinessHoursForm from './BusinessHoursForm'
import css from './BusinessHours.less'

type Props = {
    submitSetting: (Object) => Promise<*>,
    businessHoursSettings: Map<*, *>,
}

type State = {
    items: List<Map<*, *>>,
    timezone: string,
    loading: boolean,
}

export class BusinessHoursContainer extends React.Component<Props, State> {
    state = {
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

        const setting = {
            id: businessHoursSettings.get('id'),
            type: currentAccountConstants.SETTING_TYPE_BUSINESS_HOURS,
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

                <Container fluid className="page-container">
                    <p>
                        Let customers know when your team is online.
                        <br />
                        This way, you can set different auto-responders in the
                        rules based on when your team is working.
                    </p>
                    <p>
                        The appearance of your{' '}
                        <Link to="/app/settings/integrations/gorgias_chat">
                            Chat integrations
                        </Link>{' '}
                        will change when outside business hours.
                    </p>

                    <Form onSubmit={this._onSubmit}>
                        <Row className="mb-2">
                            <Col md="9">
                                <div className="mb-3">
                                    <Label
                                        className={classnames(
                                            'control-label',
                                            css.businessHoursLabel
                                        )}
                                    >
                                        Business hours
                                    </Label>
                                    {items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={
                                                css.businessHoursInputWrapper
                                            }
                                        >
                                            <BusinessHoursForm
                                                businessHour={item}
                                                onChange={(data) =>
                                                    this.setState({
                                                        items: items.set(
                                                            idx,
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
                                                            idx
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
                                        <i className="material-icons">add</i>{' '}
                                        Add business hours
                                    </Button>
                                </div>

                                <InputField
                                    type="select"
                                    name="timezone"
                                    label="Timezone"
                                    value={this.state.timezone}
                                    onChange={(timezone) =>
                                        this.setState({timezone})
                                    }
                                >
                                    {getMomentTimezoneNames().map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
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
                            Save changes
                        </Button>
                    </Form>
                </Container>
            </div>
        )
    }
}

export default connect(
    (state) => {
        return {
            businessHoursSettings: currentAccountSelectors.getBusinessHoursSettings(
                state
            ),
        }
    },
    {
        submitSetting: currentAccountActions.submitSetting,
    }
)(BusinessHoursContainer)
