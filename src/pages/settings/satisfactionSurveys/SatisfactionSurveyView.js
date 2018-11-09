import React from 'react'
import classnames from 'classnames'
import {Form, FormGroup, Button, Container} from 'reactstrap'
import {connect} from 'react-redux'

import {DELAY_SURVEY_FOR} from './../../../config'
import {convertToHTML} from '../../../utils/editor'

import BooleanField from '../../common/forms/BooleanField'
import InputField from '../../common/forms/InputField'
import RichFieldWithVariables from '../../common/forms/RichFieldWithVariables'

import PageHeader from '../../common/components/PageHeader'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as currentAccountActions from '../../../state/currentAccount/actions'


type Props = {
    submitSetting: Object,
    surveysSettings: Object
}


class SatisfactionSurveyView extends React.Component<Props> {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            settings: props.surveysSettings.get('data')
        }
    }

    _updateSurveyEmail = (editorState) => {
        const contentState = editorState.getCurrentContent()

        this.setState((prevState) => ({
            settings: prevState.settings.mergeDeep({
                survey_email_text: contentState.getPlainText(),
                survey_email_html: convertToHTML(contentState),
            })
        }))
    }

    _onSubmit = (e) => {
        e.preventDefault()

        this.setState({isLoading: true})

        const newSettings = {
            'id': this.props.surveysSettings.get('id'),
            'type': 'satisfaction-surveys',
            'data': this.state.settings.toJS()
        }

        return this.props.submitSetting(newSettings, true)
            .then(() => {
                this.setState({isLoading: false})
            })
    }

    render() {
        return (
            <div className="full-width">
                <PageHeader title="Satisfaction"/>
                <Container fluid className="page-container">
                    <div className="mb-3">
                        <p>
                            Keep track of the performance of your support team by sending a satisfaction survey after a
                            ticket is closed.
                        </p>
                    </div>
                    <div>
                      <Form onSubmit={this._onSubmit}>
                          <div>
                            <h5>Send survey after the ticket has been closed for</h5>

                            <InputField
                                type="select"
                                name="survey_interval"
                                label=""
                                help="No survey will be sent after the ticket is snoozed."
                                value={this.state.settings.get('survey_interval')}
                                onChange={value => this.setState({
                                    settings: this.state.settings.set('survey_interval', value)
                                })}
                            >
                                {
                                    DELAY_SURVEY_FOR.map((interval, idx) => (
                                        <option
                                            key={idx}
                                            value={interval.value}
                                        >
                                            {interval.label}
                                        </option>
                                    ))
                                }
                            </InputField>
                          </div>
                          <div>
                            <h5>Send survey email for following channels</h5>
                            <FormGroup className="mr-3">
                                <BooleanField
                                    name="send_survey_on_email"
                                    type="checkbox"
                                    label="Email"
                                    value={this.state.settings.get('send_survey_for_email')}
                                    onChange={value => this.setState({
                                        settings: this.state.settings.set('send_survey_for_email', value)
                                    })}
                                />
                                <BooleanField
                                    name="send_survey_on_chat"
                                    type="checkbox"
                                    label="Chat"
                                    value={this.state.settings.get('send_survey_for_chat')}
                                    onChange={value => this.setState({
                                        settings: this.state.settings.set('send_survey_for_chat', value)
                                    })}
                                />
                            </FormGroup>
                          </div>
                          <div>
                              <FormGroup>
                                  <RichFieldWithVariables
                                      allowExternalChanges
                                      name="survey_email"
                                      label="Survey email"
                                      value={{
                                          text: this.state.settings.get('survey_email_text'),
                                          html: this.state.settings.get('survey_email_html')
                                      }}
                                      variableTypes={['ticket.customer', 'current_user', 'survey']}
                                      onChange={this._updateSurveyEmail}
                                  />
                              </FormGroup>
                          </div>
                          <Button
                                type="submit"
                                color="success"
                                className={classnames({'btn-loading': this.state.isLoading})}
                                disabled={this.state.isLoading}
                            >
                                Save
                            </Button>
                        </Form>
                    </div>
                </Container>
            </div>
        )
    }
}

export default connect((state) => ({
    surveysSettings: currentAccountSelectors.getSurveysSettings(state)
}), {
    submitSetting: currentAccountActions.submitSetting
})(SatisfactionSurveyView)
