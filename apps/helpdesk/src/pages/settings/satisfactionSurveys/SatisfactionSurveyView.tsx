import React, { FormEvent, useCallback, useState } from 'react'

import classnames from 'classnames'
import { EditorState } from 'draft-js'
import { Map } from 'immutable'
import { Form, FormGroup, Label, Row } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import { DELAY_SURVEY_FOR } from 'config'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { useGetContactFormList } from 'pages/settings/contactForm/queries'
import { submitSetting } from 'state/currentAccount/actions'
import { getSurveysSettings } from 'state/currentAccount/selectors'
import {
    AccountSettingSatisfactionSurvey,
    AccountSettingType,
} from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { convertToHTML, getPlainText } from 'utils/editor'

import css from '../settings.less'

function SatisfactionSurveyView() {
    const surveysSettings = useAppSelector(getSurveysSettings)
    const { data: contactForms } = useGetContactFormList({})
    const { data: helpCenters } = useGetHelpCenterList({ type: 'faq' })
    const dispatch = useAppDispatch()

    const [isLoading, setIsLoading] = useState(false)
    const [settings, setSettings] = useState<Map<string, any>>(
        surveysSettings.get('data'),
    )
    const hasChanges = !settings.equals(surveysSettings.get('data'))

    const updateSurveyEmail = (editorState: EditorState) => {
        const contentState = editorState.getCurrentContent()

        setSettings((prevState) =>
            prevState.mergeDeep({
                survey_email_text: getPlainText(contentState),
                survey_email_html: convertToHTML(contentState),
            }),
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

        return dispatch(
            submitSetting(newSettings, 'Satisfaction Survey settings saved'),
        ).then(() => {
            setIsLoading(false)
        })
    }

    const handleCancel = () => {
        setSettings(surveysSettings.get('data'))
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'Changes have been canceled',
            }),
        )
    }

    const checkBox = useCallback(
        (name: string, label: string, enabled: boolean = true) => {
            return (
                <CheckBox
                    name={name}
                    isChecked={enabled && settings.get(name)}
                    onChange={(value: boolean) =>
                        setSettings(settings.set(name, value))
                    }
                    className="mr-4"
                    isDisabled={!enabled}
                >
                    {label}
                </CheckBox>
            )
        },
        [settings],
    )

    return (
        <div className="full-width">
            <PageHeader title="Satisfaction survey" />
            <div className={css.pageContainer}>
                <div className={classnames(css.contentWrapper, 'body-regular')}>
                    <div className="mb-4">
                        <p>
                            Keep track of your team’s support performance by
                            sending a satisfaction survey after a ticket is
                            closed. Exclude tickets using rules or create rules
                            based on CSAT scores to get notified.
                        </p>
                        <a
                            className={classnames(css.link, 'd-block')}
                            href="https://docs.gorgias.com/en-US/exclude-tickets-from-receiving-the-satisfaction-survey-(csat)-188964"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <i className="material-icons">menu_book</i>{' '}
                            <span>Learn About Ticket Exclusion</span>
                        </a>
                        <a
                            className={classnames(css.link, 'd-block')}
                            href="https://updates.gorgias.com/publications/csat-scores-are-now-available-in-rules"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <i className="material-icons">menu_book</i>{' '}
                            <span>Learn About Creating CSAT Rules</span>
                        </a>
                    </div>
                    <div>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup className="mb-4">
                                <Label
                                    className={classnames(
                                        'control-label',
                                        css.mb8,
                                    )}
                                >
                                    Send a satisfaction survey email to
                                    customers with closed tickets for the
                                    following channels:
                                </Label>
                                <Row className="ml-0">
                                    {checkBox('send_survey_for_email', 'Email')}
                                    {checkBox('send_survey_for_chat', 'Chat')}
                                    {checkBox(
                                        'send_survey_for_contact_form',
                                        'Contact Form',
                                        !!contactForms?.pages[0]?.data.length,
                                    )}
                                    {checkBox(
                                        'send_survey_for_help_center',
                                        'Help Center',
                                        !!helpCenters?.data.data.length,
                                    )}
                                </Row>
                            </FormGroup>
                            <FormGroup
                                className={classnames(css.inputField, 'mb-4')}
                            >
                                <RichFieldWithVariables
                                    allowExternalChanges
                                    label="Satisfaction survey message"
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
                            <FormGroup
                                className={classnames(css.inputField, 'mb-5')}
                            >
                                <Row className="ml-0 align-items-center ">
                                    <Label className="control-label mr-2 mb-0">
                                        Email satisfaction survey
                                    </Label>
                                    <SelectField
                                        value={settings.get('survey_interval')}
                                        options={DELAY_SURVEY_FOR}
                                        onChange={(value) =>
                                            setSettings(
                                                settings.set(
                                                    'survey_interval',
                                                    value,
                                                ),
                                            )
                                        }
                                    />
                                    <Label className="control-label ml-2 mb-0">
                                        after tickets are closed.
                                    </Label>
                                </Row>
                                <div
                                    className={classnames(
                                        css.mt4,
                                        'caption-regular',
                                    )}
                                >
                                    Note: Surveys will not be sent for snoozed
                                    tickets.
                                </div>
                            </FormGroup>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="mr-2"
                            >
                                Save Changes
                            </Button>
                            <Button
                                type="button"
                                intent="secondary"
                                isLoading={isLoading}
                                onClick={handleCancel}
                                isDisabled={!hasChanges}
                            >
                                Cancel
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SatisfactionSurveyView
