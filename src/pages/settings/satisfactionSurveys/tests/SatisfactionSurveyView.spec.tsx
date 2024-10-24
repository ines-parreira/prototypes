import {render, screen} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {Map, fromJS} from 'immutable'
import React from 'react'

import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import {submitSetting} from 'state/currentAccount/actions'
import {getSurveysSettings} from 'state/currentAccount/selectors'
import {
    AccountSettingSatisfactionSurvey,
    AccountSettingType,
} from 'state/currentAccount/types'
import {assumeMock} from 'utils/testing'

import SatisfactionSurveyView from '../SatisfactionSurveyView'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')
jest.mock('pages/common/forms/RichFieldWithVariables', () =>
    jest.fn(() => <div>RichFieldWithVariables</div>)
)
jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('hooks/useAppDispatch', () => () => (anything: unknown) => anything)
jest.mock('state/currentAccount/selectors')
jest.mock('state/currentAccount/actions', () => ({
    submitSetting: jest.fn(() => Promise.resolve()),
}))

const mockedGetSurveysSettings = assumeMock(getSurveysSettings)
const mockedSubmitSetting = assumeMock(submitSetting)
const MockedRichFieldWithVariables = RichFieldWithVariables as jest.Mock

const initialSurveyData: AccountSettingSatisfactionSurvey = {
    id: 1,
    type: AccountSettingType.SatisfactionSurveys,
    data: {
        survey_email_text: 'email text',
        survey_email_html: '<p>email text</p>',
        send_survey_for_chat: true,
        send_survey_for_email: true,
        survey_interval: 1,
    },
}

describe('SatisfactionSurveyView', () => {
    beforeEach(() => {
        mockedGetSurveysSettings.mockImplementation(
            () => fromJS(initialSurveyData) as Map<any, any>
        )
    })

    it('should render current survey settings form', () => {
        const {container} = render(<SatisfactionSurveyView />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call RichFieldWithVariables with correct props', () => {
        render(<SatisfactionSurveyView />)

        expect(MockedRichFieldWithVariables).toHaveBeenCalledWith(
            {
                allowExternalChanges: true,
                label: 'Survey message',
                onChange: expect.any(Function),
                uploadType: 'public_attachment',
                value: {
                    html: initialSurveyData.data.survey_email_html,
                    text: initialSurveyData.data.survey_email_text,
                },
                variableTypes: ['ticket.customer', 'current_user', 'survey'],
            },
            {}
        )
    })

    it('should submit user data', () => {
        render(<SatisfactionSurveyView />)

        userEvent.click(screen.getByText(/Save/))

        expect(mockedSubmitSetting).toHaveBeenCalledWith(initialSurveyData)
    })
})
