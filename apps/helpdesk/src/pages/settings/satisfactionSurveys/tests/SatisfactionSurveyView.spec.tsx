import React from 'react'

import { userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import { submitSetting } from 'state/currentAccount/actions'
import { getSurveysSettings } from 'state/currentAccount/selectors'
import {
    AccountSettingSatisfactionSurvey,
    AccountSettingType,
} from 'state/currentAccount/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import SatisfactionSurveyView from '../SatisfactionSurveyView'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')
jest.mock('pages/common/forms/RichFieldWithVariables', () =>
    jest.fn(() => <div>RichFieldWithVariables</div>),
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

// mock help center list
const testQueryClient = mockQueryClient()
jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)
const mockHelpCenterListData = {
    data: axiosSuccessResponse({
        data: [
            {
                id: 1,
                name: 'help center 1',
                type: 'faq',
                shop_name: 'test-shop',
            },
            { id: 2, name: 'help center 2', type: 'faq' },
        ],
    }),
    isLoading: false,
} as unknown as ReturnType<typeof useGetHelpCenterList>

describe('SatisfactionSurveyView', () => {
    beforeEach(() => {
        mockedGetSurveysSettings.mockImplementation(
            () => fromJS(initialSurveyData) as Map<any, any>,
        )
        mockUseGetHelpCenterList.mockReturnValue(mockHelpCenterListData)
    })

    it('should render current survey settings form', () => {
        const { container } = render(
            <QueryClientProvider client={testQueryClient}>
                <SatisfactionSurveyView />
            </QueryClientProvider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call RichFieldWithVariables with correct props', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SatisfactionSurveyView />
            </QueryClientProvider>,
        )

        expect(MockedRichFieldWithVariables).toHaveBeenCalledWith(
            {
                allowExternalChanges: true,
                label: 'Satisfaction survey message',
                onChange: expect.any(Function),
                uploadType: 'public_attachment',
                value: {
                    html: initialSurveyData.data.survey_email_html,
                    text: initialSurveyData.data.survey_email_text,
                },
                variableTypes: ['ticket.customer', 'current_user', 'survey'],
            },
            {},
        )
    })

    it('should submit user data', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SatisfactionSurveyView />
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByText(/Save/))

        expect(mockedSubmitSetting).toHaveBeenCalledWith(
            initialSurveyData,
            'Satisfaction Survey settings saved',
        )
    })

    it('should receive correct interval settings', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SatisfactionSurveyView />
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByText(/30 minutes/))
        userEvent.click(screen.getByText(/Save/))

        expect(mockedSubmitSetting).toHaveBeenCalledWith(
            {
                ...initialSurveyData,
                data: {
                    ...initialSurveyData.data,
                    survey_interval: 0.5,
                },
            },
            'Satisfaction Survey settings saved',
        )
    })

    it('should have cancel disabled then enabled', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SatisfactionSurveyView />
            </QueryClientProvider>,
        )

        expect(screen.getByText(/Cancel/).parentElement).toHaveAttribute(
            'aria-disabled',
            'true',
        )

        userEvent.click(screen.getByText(/Chat/))

        expect(screen.getByText(/Cancel/).parentElement).toHaveAttribute(
            'aria-disabled',
            'false',
        )
    })

    it('cancel button should reset form', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SatisfactionSurveyView />
            </QueryClientProvider>,
        )

        expect(screen.getByText(/Chat/).children[0]).toBeChecked()
        userEvent.click(screen.getByText(/Chat/))
        expect(screen.getByText(/Chat/).children[0]).not.toBeChecked()

        userEvent.click(screen.getByText(/Cancel/))
        expect(screen.getByText(/Chat/).children[0]).toBeChecked()
    })

    it.each([
        [{} as ReturnType<typeof useGetHelpCenterList>, true],
        [mockHelpCenterListData, false],
    ])(
        'should disable/enable help center checkbox',
        (helpcentersList, isDisabled) => {
            mockUseGetHelpCenterList.mockReturnValue(helpcentersList)
            render(
                <QueryClientProvider client={testQueryClient}>
                    <SatisfactionSurveyView />
                </QueryClientProvider>,
            )

            const element =
                screen.getByLabelText(/Help Center/).parentElement?.className

            if (isDisabled) expect(element).toContain('isdisabled')
            else expect(element).not.toContain('isdisabled')
        },
    )
})
