import React, {Component, FormEvent} from 'react'
import classnames from 'classnames'
import {Form, FormGroup, Button, Container} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'
import {EditorState} from 'draft-js'

import {convertToHTML, getPlainText} from '../../../utils/editor'
import BooleanField from '../../common/forms/BooleanField.js'
import InputField from '../../common/forms/InputField.js'
import RichFieldWithVariables from '../../common/forms/RichFieldWithVariables'
import PageHeader from '../../common/components/PageHeader'
import {getSurveysSettings} from '../../../state/currentAccount/selectors'
import {submitSetting} from '../../../state/currentAccount/actions'
import {DELAY_SURVEY_FOR} from '../../../config'
import {RootState} from '../../../state/types'
import {
    AccountSettingSatisfactionSurvey,
    AccountSettingType,
} from '../../../state/currentAccount/types'

type Props = ConnectedProps<typeof connector>

type State = {
    isLoading: boolean
    settings: Map<any, any>
}

class SatisfactionSurveyView extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            isLoading: false,
            settings: props.surveysSettings.get('data'),
        }
    }

    _updateSurveyEmail = (editorState: EditorState) => {
        const contentState = editorState.getCurrentContent()

        this.setState((prevState) => ({
            settings: prevState.settings.mergeDeep({
                survey_email_text: getPlainText(contentState),
                survey_email_html: convertToHTML(contentState),
            }),
        }))
    }

    _onSubmit = (e: FormEvent) => {
        e.preventDefault()

        this.setState({isLoading: true})

        const newSettings: AccountSettingSatisfactionSurvey = {
            id: this.props.surveysSettings.get('id'),
            type: AccountSettingType.SatisfactionSurveys,
            data: this.state.settings.toJS(),
        }

        return this.props.submitSetting(newSettings).then(() => {
            this.setState({isLoading: false})
        })
    }

    _renderSettings() {
        return (
            <div>
                <div className="mb-3">
                    <p>
                        Keep track of the performance of your support team by
                        sending a satisfaction survey after a ticket is closed.
                    </p>
                </div>
                <div>
                    <Form onSubmit={this._onSubmit}>
                        <div>
                            <h5>
                                Send survey after the ticket has been closed for
                            </h5>

                            <InputField
                                type="select"
                                name="survey_interval"
                                label=""
                                help="No survey will be sent after the ticket is snoozed."
                                value={this.state.settings.get(
                                    'survey_interval'
                                )}
                                onChange={(value) =>
                                    this.setState({
                                        settings: this.state.settings.set(
                                            'survey_interval',
                                            value
                                        ),
                                    })
                                }
                            >
                                {DELAY_SURVEY_FOR.map((interval, idx) => (
                                    <option key={idx} value={interval.value}>
                                        {interval.label}
                                    </option>
                                ))}
                            </InputField>
                        </div>
                        <div>
                            <h5>Send survey email for following channels</h5>
                            <FormGroup className="mr-3">
                                <BooleanField
                                    name="send_survey_on_email"
                                    type="checkbox"
                                    label="Email"
                                    value={this.state.settings.get(
                                        'send_survey_for_email'
                                    )}
                                    onChange={(value: boolean) =>
                                        this.setState({
                                            settings: this.state.settings.set(
                                                'send_survey_for_email',
                                                value
                                            ),
                                        })
                                    }
                                />
                                <BooleanField
                                    name="send_survey_on_chat"
                                    type="checkbox"
                                    label="Chat"
                                    value={this.state.settings.get(
                                        'send_survey_for_chat'
                                    )}
                                    onChange={(value: boolean) =>
                                        this.setState({
                                            settings: this.state.settings.set(
                                                'send_survey_for_chat',
                                                value
                                            ),
                                        })
                                    }
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
                                        text: this.state.settings.get(
                                            'survey_email_text'
                                        ),
                                        html: this.state.settings.get(
                                            'survey_email_html'
                                        ),
                                    }}
                                    variableTypes={[
                                        'ticket.customer',
                                        'current_user',
                                        'survey',
                                    ]}
                                    onChange={this._updateSurveyEmail}
                                />
                            </FormGroup>
                        </div>
                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': this.state.isLoading,
                            })}
                            disabled={this.state.isLoading}
                        >
                            Save
                        </Button>
                    </Form>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="full-width">
                <PageHeader title="Satisfaction" />
                <Container fluid className="page-container">
                    {this._renderSettings()}
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        surveysSettings: getSurveysSettings(state),
    }),
    {
        submitSetting,
    }
)

export default connector(SatisfactionSurveyView)
