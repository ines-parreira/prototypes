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
    const mockResourceSetId = 'helpCenter-456'

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
                mockResourceSetId,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceClicked,
                {
                    ...expectedEventContext,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                    resourceSetId: mockResourceSetId,
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
                mockResourceSetId,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceEditClicked,
                {
                    ...expectedEventContext,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                    resourceSetId: mockResourceSetId,
                },
            )
        })
    })

    describe('when onKnowledgeResourceCreateClick is called', () => {
        it('logs the correct event with resource type', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            result.current.onKnowledgeResourceCreateClick(
                mockResourceType,
                mockResourceSetId,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceCreateClicked,
                {
                    ...expectedEventContext,
                    resourceType: mockResourceType,
                    resourceSetId: mockResourceSetId,
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
                mockResourceSetId,
                true,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceSaved,
                {
                    ...expectedEventContext,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                    resourceSetId: mockResourceSetId,
                    isNew: true,
                },
            )
        })
    })

    describe('when onFeedbackTabOpened is called', () => {
        it('logs the correct event with openedFrom', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            const openedFrom = 'give-feedback-buton-from-reasoning'
            result.current.onFeedbackTabOpened(openedFrom)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackTabOpened,
                {
                    ...expectedEventContext,
                    openedFrom,
                },
            )
        })
    })

    describe('when onFeedbackGiven is called', () => {
        it('logs the correct event with type', () => {
            const { result } = renderHook(() =>
                useFeedbackTracking(defaultProps),
            )

            const type = 'thumbs_up'
            result.current.onFeedbackGiven(type)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackGiven,
                { ...expectedEventContext, type },
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
                mockResourceSetId,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentFeedbackKnowledgeResourceClicked,
                {
                    ticketId: newProps.ticketId,
                    accountId: newProps.accountId,
                    userId: newProps.userId,
                    resourceId: mockResourceId,
                    resourceType: mockResourceType,
                    resourceSetId: mockResourceSetId,
                },
            )
        })
    })
})
