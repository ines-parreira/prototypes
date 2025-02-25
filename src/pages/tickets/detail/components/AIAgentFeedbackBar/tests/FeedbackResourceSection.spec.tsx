import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCookies } from 'react-cookie'

import { logEventWithSampling } from 'common/segment/segment'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { Feedback, FeedbackOnResource } from 'models/aiAgentFeedback/types'
import { assumeMock } from 'utils/testing'

import { SegmentEvent } from '../../../../../../common/segment'
import {
    FeedbackResourceSection,
    TOOLTIP_COOKIE_NAME,
} from '../FeedbackResourceSection'
import { ActionStatus, ResourceSection } from '../types'

const mockHandleSubmitFeedback = jest.fn()
const mockSetCookie = jest.fn()
const mockRemoveCookie = jest.fn()
const mockResetCookies = jest.fn()
const mockedUseCookies = jest.mocked(useCookies)
const logEventMock = assumeMock(logEventWithSampling)
jest.mock('state/ticket/actions', () => ({
    addTags: jest.fn(),
    removeTag: jest.fn(),
}))
jest.mock('react-cookie')
jest.mock('hooks/useHasAgentPrivileges')
jest.mock('common/segment/segment')

const guidanceResource = {
    id: 1,
    name: 'Sample Resource',
    feedback: 'thumbs_up' as const,
    status: ActionStatus.CONFIRMED,
}

const mockResourceConfirmed = {
    id: 1,
    name: 'Test Action',
    status: ActionStatus.CONFIRMED,
    feedback: 'thumbs_up' as const,
}

const mockResourceCancelled = {
    id: 2,
    name: 'Test Action',
    status: ActionStatus.NOT_CONFIRMED,
    feedback: 'thumbs_up' as const,
}

const resourceSection = 'someSection' as ResourceSection
const renderFeedbackResourceComponent = (
    feedback: Feedback = 'thumbs_up',
    resource = guidanceResource,
    resourceType: FeedbackOnResource['resourceType'] = 'guidance',
) =>
    render(
        <FeedbackResourceSection
            resource={{ ...resource, feedback }}
            resourceType={resourceType}
            handleSubmitFeedback={mockHandleSubmitFeedback}
            href="https://example.com"
            dataTestId="feedback-section"
            resourceId={1}
            resourceSection={resourceSection}
            accountId={1}
        />,
    )

describe('FeedbackResourceSection', () => {
    beforeEach(() => {
        mockedUseCookies.mockReturnValue([
            { [TOOLTIP_COOKIE_NAME]: false },
            mockSetCookie,
            mockRemoveCookie,
            mockResetCookies,
        ])

        const mockedUseHasAgentPrivileges = jest.mocked(useHasAgentPrivileges)
        mockedUseHasAgentPrivileges.mockReturnValue(true)
    })
    it('does not call handleSubmitFeedback with thumbs_down when thumbs down button is clicked', () => {
        renderFeedbackResourceComponent('thumbs_down')
        const thumbsButton = screen.getByTitle('Mark as Incorrect')
        userEvent.click(thumbsButton)

        expect(mockHandleSubmitFeedback).not.toHaveBeenCalledWith()
        expect(mockSetCookie).not.toHaveBeenCalledWith()
    })

    it('calls handleSubmitFeedback with thumbs_up when thumbs up button is clicked', () => {
        renderFeedbackResourceComponent('thumbs_down')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        userEvent.click(thumbsButton)

        expect(mockHandleSubmitFeedback).toHaveBeenCalledWith(
            guidanceResource.id,
            'guidance',
            'thumbs_up',
            resourceSection,
        )

        expect(logEventMock).toHaveBeenNthCalledWith(
            1,
            SegmentEvent.AiAgentFeedbackSubmitFeedback,
            {
                accountId: 1,
                outcome: 'thumbs_up',
                source: 'guidance',
            },
        )
    })

    it('does not display the tooltip when the cookie is set', () => {
        mockedUseCookies.mockImplementation(() => [
            { [TOOLTIP_COOKIE_NAME]: true },
            mockSetCookie,
            mockRemoveCookie,
            mockResetCookies,
        ])
        renderFeedbackResourceComponent('thumbs_up')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        userEvent.click(thumbsButton)
        const tooltip = screen.queryByAltText(
            `thumbs down for ${guidanceResource.id}`,
        )
        expect(tooltip).toBeNull()
    })

    it('calls setCookie when handleBlur is triggered and cookie is not set', () => {
        renderFeedbackResourceComponent('thumbs_up')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        userEvent.click(thumbsButton)
        userEvent.tab() // simulate blur event on button by tabbing

        expect(mockSetCookie).toHaveBeenCalledWith(TOOLTIP_COOKIE_NAME, true)
    })

    it('does not call setCookie when handleBlur is triggered and cookie is already set', () => {
        mockedUseCookies.mockImplementation(() => [
            { [TOOLTIP_COOKIE_NAME]: true },
            mockSetCookie,
            mockRemoveCookie,
            mockResetCookies,
        ])
        renderFeedbackResourceComponent('thumbs_up')
        const thumbsButton = screen.getByTitle('Mark as Correct')
        userEvent.click(thumbsButton)
        userEvent.tab() // simulate blur event on button by tabbing

        expect(mockSetCookie).not.toHaveBeenCalled()
    })

    it('should render a success badge when the action is confirmed', () => {
        renderFeedbackResourceComponent(
            'thumbs_up',
            mockResourceConfirmed,
            'hard_action',
        )

        const badge = screen.getByTestId('badge-test-id')
        expect(badge).toHaveTextContent('confirmed')
    })

    it('should render an error badge when the action is cancelled', () => {
        renderFeedbackResourceComponent(
            'thumbs_up',
            mockResourceCancelled,
            'hard_action',
        )

        const badge = screen.getByTestId('badge-test-id')
        expect(badge).toHaveTextContent('Not confirmed')
    })
})
