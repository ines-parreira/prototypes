import { Map } from 'immutable'

import { getActionByName } from 'config/actions'
import useAppSelector from 'hooks/useAppSelector'
import { isTicketEvent, isTicketRuleSuggestion } from 'models/ticket/predicates'
import {
    getRuleSuggestionContent,
    isSuggestionEmpty,
} from 'pages/tickets/detail/components/RuleSuggestion/RuleSuggestion'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import useGroupedElements from '../useGroupedElements'
import useRuleSuggestionForDemos from '../useRuleSuggestionForDemos'

jest.mock('config/actions', () => ({
    getActionByName: jest.fn(),
}))
jest.mock('constants/event', () => ({
    PHONE_EVENTS: ['phone-event'],
}))
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('models/ticket/predicates', () => ({
    isTicketEvent: jest.fn(),
    isTicketRuleSuggestion: jest.fn(),
}))
jest.mock('pages/tickets/detail/components/AuditLogEvent', () => ({
    contentfulEventTypesValues: ['audit-log-event'],
}))
jest.mock(
    'pages/tickets/detail/components/PrivateReplyEvent/constants',
    () => ({
        PRIVATE_REPLY_ACTIONS: ['private-reply-action'],
    }),
)
jest.mock(
    'pages/tickets/detail/components/RuleSuggestion/RuleSuggestion',
    () => ({
        getRuleSuggestionContent: jest.fn(),
        isSuggestionEmpty: jest.fn(),
    }),
)

jest.mock('../useRuleSuggestionForDemos', () => jest.fn())

// not using `assumeMock` for this one since I
// don't need/want to pass a correct entity
const mockGetRuleSuggestionContent = getRuleSuggestionContent as jest.Mock

const mockGetActionByName = assumeMock(getActionByName)
const mockIsSuggestionEmpty = assumeMock(isSuggestionEmpty)
const mockIsTicketEvent = assumeMock(isTicketEvent)
const mockIsTicketRuleSuggestion = assumeMock(isTicketRuleSuggestion)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockShouldDisplayDemoSuggestion = assumeMock(useRuleSuggestionForDemos)

describe('useGroupedElements', () => {
    beforeEach(() => {
        mockGetActionByName.mockReturnValue(undefined)
        mockIsTicketEvent.mockReturnValue(true)
        mockIsTicketRuleSuggestion.mockReturnValue(false)
        mockShouldDisplayDemoSuggestion.mockReturnValue({
            shouldDisplayDemoSuggestion: true,
            setDemoSuggestionSettingPerAccount: jest.fn(),
            setDemoSuggestionSettingPerUser: jest.fn(),
        })
    })

    it('should return elements that are arrays', () => {
        mockUseAppSelector
            .mockReturnValueOnce([[]]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([[]])
    })

    it('should not return rule suggestion elements that are empty', () => {
        mockUseAppSelector
            .mockReturnValueOnce([{ foo: 'bar' }]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        mockIsTicketRuleSuggestion.mockReturnValue(true)
        mockIsSuggestionEmpty.mockReturnValue(true)

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([])
    })

    it('should return rule suggestion elements that have content', () => {
        mockUseAppSelector
            .mockReturnValueOnce([{ foo: 'bar' }]) // bodyElement
            .mockReturnValueOnce(Map({ ticket: true })) // ticket

        mockIsTicketRuleSuggestion.mockReturnValue(true)
        mockGetRuleSuggestionContent.mockReturnValue('rule-suggestion-content')
        mockIsSuggestionEmpty.mockReturnValue(false)

        const { result } = renderHook(() => useGroupedElements())

        expect(mockGetRuleSuggestionContent).toHaveBeenCalledWith({
            ticket: true,
        })
        expect(mockIsSuggestionEmpty).toHaveBeenCalledWith(
            'rule-suggestion-content',
        )

        expect(result.current).toEqual([{ foo: 'bar' }])
    })

    it('should return elements that are not ticket events', () => {
        mockUseAppSelector
            .mockReturnValueOnce([{ foo: 'bar' }]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        mockIsTicketEvent.mockReturnValue(false)

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([{ foo: 'bar' }])
    })

    it('should return audit log events that have content', () => {
        mockUseAppSelector
            .mockReturnValueOnce([{ type: 'audit-log-event' }]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([{ type: 'audit-log-event' }])
    })

    it('should return phone events that have content', () => {
        mockUseAppSelector
            .mockReturnValueOnce([{ type: 'phone-event' }]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([{ type: 'phone-event' }])
    })

    it('should return private reply actions', () => {
        mockUseAppSelector
            .mockReturnValueOnce([
                { data: { action_name: 'private-reply-action' } },
            ]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([
            { data: { action_name: 'private-reply-action' } },
        ])
    })

    it('should return elements that have an action config', () => {
        mockUseAppSelector
            .mockReturnValueOnce([{ foo: 'bar' }]) // bodyElement
            .mockReturnValueOnce(Map()) // ticket

        mockGetActionByName.mockReturnValue({
            name: 'foo',
            label: 'bar',
            objectType: 'baz',
        })

        const { result } = renderHook(() => useGroupedElements())
        expect(result.current).toEqual([{ foo: 'bar' }])
    })
})
