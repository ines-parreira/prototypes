import { renderHook } from '@testing-library/react'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'

import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import { useFeedbackTracking } from '../useFeedbackTracking'

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('common/segment/segment', () => ({
    logEvent: jest.fn(),
}))

describe('useFeedbackTracking', () => {
    const defaultProps = {
        ticketId: 123,
        accountId: 456,
        userId: 789,
    }

    const mockResourceId = 'resource-123'
    const mockResourceType = AiAgentKnowledgeResourceTypeEnum.ARTICLE

    const expectedEventContext = {
        ticketId: defaultProps.ticketId,
        accountId: defaultProps.accountId,
        userId: defaultProps.userId,
    }

    describe('when onKnowledgeResourceClick is called', () => {
        it('logs the correct event with resource details', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            result.current.onKnowledgeResourceClick(
                mockResourceId,
                mockResourceType,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceClicked,
                {
                    ...expectedEventContext,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                },
            )
        })
    })

    describe('when onKnowledgeResourceEditClick is called', () => {
        it('logs the correct event with resource details', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            result.current.onKnowledgeResourceEditClick(
                mockResourceId,
                mockResourceType,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceEditClicked,
                {
                    ...expectedEventContext,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                },
            )
        })
    })

    describe('when onKnowledgeResourceCreateClick is called', () => {
        it('logs the correct event with resource type', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            result.current.onKnowledgeResourceCreateClick(mockResourceType)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceCreateClicked,
                {
                    ...expectedEventContext,
                    resourceType: mockResourceType,
                },
            )
        })
    })

    describe('when onKnowledgeResourceSaved is called', () => {
        it('logs the correct event with isNew true for new resources', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            result.current.onKnowledgeResourceSaved(
                mockResourceId,
                mockResourceType,
                true,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceSaved,
                {
                    ...expectedEventContext,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                    isNew: true,
                },
            )
        })
    })

    describe('when hook props change', () => {
        it('updates the event context', () => {
            const { result, rerender } = renderHook(
                (props) => useFeedbackTracking(props),
                { initialProps: defaultProps },
            )

            const newProps = {
                ticketId: 999,
                accountId: 888,
                userId: 777,
            }

            rerender(newProps)

            result.current.onKnowledgeResourceClick(
                mockResourceId,
                mockResourceType,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceClicked,
                {
                    ticketId: newProps.ticketId,
                    accountId: newProps.accountId,
                    userId: newProps.userId,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                },
            )
        })
    })
})
