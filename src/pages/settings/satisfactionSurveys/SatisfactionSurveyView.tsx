import React, {FormEvent, useState} from 'react'
import classnames from 'classnames'
import {Form, FormGroup, Label} from 'reactstrap'
import {Map} from 'immutable'
import {EditorState} from 'draft-js'

import {UploadType} from 'common/types'
import {DELAY_SURVEY_FOR} from 'config'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {submitSetting} from 'state/currentAccount/actions'
import {getSurveysSettings} from 'state/currentAccount/selectors'
import {
    AccountSettingSatisfactionSurvey,
    AccountSettingType,
} from 'state/currentAccount/types'
import {convertToHTML, getPlainText} from 'utils/editor'

import css from '../settings.less'

function SatisfactionSurveyView() {
    const surveysSettings = useAppSelector(getSurveysSettings)
    const dispatch = useAppDispatch()

    const [isLoading, setIsLoading] = useState(false)
    const [settings, setSettings] = useState<Map<string, any>>(
        surveysSettings.get('data')
    )

    const updateSurveyEmail = (editorState: EditorState) => {
        const contentState = editorState.getCurrentContent()

        setSettings((prevState) =>
            prevState.mergeDeep({
                survey_email_text: getPlainText(contentState),
                survey_email_html: convertToHTML(contentState),
            })
        )
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        setIsLoading(true)

        const newSettings: AccountSettingSatisfactionSurvey = {
            id: surveysSettings.get('id'),
            type: AccountSettingType.SatisfactionSurveys,
            data: settings.toJS(),
        }

        return dispatch(submitSetting(newSettings)).then(() => {
            setIsLoading(false)
        })
    }

    return (
        <div className="full-width">
            <PageHeader title="Satisfaction survey" />
            <div className={css.pageContainer}>
                <div className={classnames(css.contentWrapper, 'body-regular')}>
                    <div className={css.mb24}>
                        <p>
                            Keep track of the performance of your support team
                            by sending a satisfaction survey after a ticket is
                            closed.
                        </p>
                    </div>
                    <div>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup className={css.inputField}>
                                <Label className="control-label">
                                    Send survey after the ticket has been closed
                                    for
                                </Label>
                                <SelectField
                                    value={settings.get('survey_interval')}
                                    options={DELAY_SURVEY_FOR}
                                    onChange={(value) =>
                                        setSettings(
                                            settings.set(
                                                'survey_interval',
                                                value
                                            )
                                        )
                                    }
                                    fullWidth
                                />
                                <div
                                    className={classnames(
                                        css.mt4,
                                        'caption-regular'
                                    )}
                                >
                                    No survey will be sent after the ticket is
                                    snoozed.
                                </div>
                            </FormGroup>
                            <FormGroup className={css.mb24}>
                                <Label
                                    className={classnames(
                                        'control-label',
                                        css.mb8
                                    )}
                                >
                                    Send survey email for following channels
                                </Label>
                                <CheckBox
                                    name="send_survey_on_email"
                                    isChecked={settings.get(
                                        'send_survey_for_email'
                                    )}
                                    onChange={(value: boolean) =>
                                        setSettings(
                                            settings.set(
                                                'send_survey_for_email',
                                                value
                                            )
                                        )
                                    }
                                    className={css.mb8}
                                >
                                    Email
                                </CheckBox>
                                <CheckBox
                                    name="send_survey_on_chat"
                                    isChecked={settings.get(
                                        'send_survey_for_chat'
                                    )}
                                    onChange={(value: boolean) =>
                                        setSettings(
                                            settings.set(
                                                'send_survey_for_chat',
                                                value
                                            )
                                        )
                                    }
                                >
                                    Chat
                                </CheckBox>
                            </FormGroup>
                            <FormGroup
                                className={classnames(css.inputField, css.mb24)}
                            >
                                <RichFieldWithVariables
                                    allowExternalChanges
                                    label="Survey message"
                                    value={{
                                        text: settings.get('survey_email_text'),
                                        html: settings.get('survey_email_html'),
                                    }}
                                    variableTypes={[
                                        'ticket.customer',
                                        'current_user',
                                        'survey',
                                    ]}
                                    onChange={updateSurveyEmail}
                                    uploadType={UploadType.PublicAttachment}
                                />
                            </FormGroup>
                            <Button type="submit" isLoading={isLoading}>
                                Save
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SatisfactionSurveyView
