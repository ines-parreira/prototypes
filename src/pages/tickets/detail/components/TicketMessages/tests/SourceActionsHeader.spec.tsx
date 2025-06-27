import { ReactElement } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { TicketMessageSourceType } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useElementSize from 'hooks/useElementSize'
import { isTicketMessageDeleted } from 'models/ticket/predicates'
import { Source, TicketMessage } from 'models/ticket/types'
import * as infobarActions from 'state/infobar/actions'

import SourceActionsHeader from '../SourceActionsHeader'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('hooks/useDebouncedValue', () => jest.fn())
jest.mock('hooks/useElementSize', () => jest.fn())
jest.mock('models/ticket/predicates', () => ({
    isTicketMessageDeleted: jest.fn(),
}))
jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn(),
}))
jest.mock(
    '../CollapsedSourceActions/CollapsedSourceActions',
    () =>
        ({ children }: { children?: React.ReactNode }) => (
            <div>
                <span>collapsed-actions</span>
                {children}
            </div>
        ),
)
jest.mock(
    '../IntentsFeedback/IntentsFeedback',
    () => (): ReactElement => (
        <div data-testid="intents-feedback">intents-feedback</div>
    ),
)
jest.mock(
    'pages/common/components/PrivateReplyToFBComment/PrivateReply',
    () =>
        ({ children }: { children?: React.ReactNode }) => (
            <div>
                <span>private-reply</span>
                {children}
            </div>
        ),
)

// Get typed mock functions
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseAppSelector = jest.mocked(useAppSelector)
const mockUseDebouncedValue = jest.mocked(useDebouncedValue)
const mockUseElementSize = jest.mocked(useElementSize)
const mockIsTicketMessageDeleted = jest.mocked(isTicketMessageDeleted)
const mockExecuteAction = jest.mocked(infobarActions.executeAction)

type MessageOverrides = Partial<TicketMessage> & {
    source?: Source | Partial<Source> | null
}

const createMessage = (overrides: MessageOverrides = {}): TicketMessage =>
    ({
        id: 1,
        ticket_id: 1,
        message_id: '123',
        integration_id: 456,
        body_text: 'test',
        sender: { id: 1 },
        from_agent: false,
        created_datetime: '2023-01-01',
        meta: {},
        source: { type: TicketMessageSourceType.FacebookComment },
        ...overrides,
    }) as TicketMessage

describe('SourceActionsHeader', () => {
    const mockDispatch = jest.fn()
    const mockActionObject = {
        type: 'EXECUTE_ACTION_START',
        payload: {
            actionName: 'testAction',
            integrationId: 456,
            comment_id: '123',
        },
    }

    beforeEach(() => {
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseAppSelector.mockReturnValue(false)
        mockUseDebouncedValue.mockImplementation((value: unknown) => value)
        mockUseElementSize.mockReturnValue([500, 300])
        mockIsTicketMessageDeleted.mockReturnValue(false)
        mockExecuteAction.mockReturnValue(mockActionObject as any)
    })

    it('returns null for no source', () => {
        const { container } = render(
            <SourceActionsHeader
                message={createMessage({ source: null } as MessageOverrides)}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('returns null for no source type', () => {
        const { container } = render(
            <SourceActionsHeader
                message={createMessage({
                    source: { from: undefined, to: undefined } as Source,
                })}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('returns null for duplicated message', () => {
        const { container } = render(
            <SourceActionsHeader
                message={createMessage({ meta: { is_duplicated: true } })}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('returns null for deleted message', () => {
        mockIsTicketMessageDeleted.mockReturnValue(true)
        const { container } = render(
            <SourceActionsHeader message={createMessage()} />,
        )
        expect(container.firstChild).toBeNull()
    })

    it.each([
        [TicketMessageSourceType.InstagramComment, true, true],
        [TicketMessageSourceType.InstagramAdComment, true, true],
        [TicketMessageSourceType.FacebookComment, true, true],
        [TicketMessageSourceType.Email, false, false],
    ])(
        'handles source type %s correctly',
        (sourceType, showHide, showPrivate) => {
            mockUseAppSelector.mockReturnValue(
                sourceType === TicketMessageSourceType.FacebookComment,
            )
            render(
                <SourceActionsHeader
                    message={createMessage({ source: { type: sourceType } })}
                />,
            )

            if (showHide) {
                expect(screen.getByTitle(/hide|unhide/i)).toBeInTheDocument()
                if (showPrivate)
                    expect(
                        screen.getByText('private-reply'),
                    ).toBeInTheDocument()
            }
        },
    )

    it.each([
        [300, true],
        [500, false],
    ])('collapses actions when width is %d', (width, collapsed) => {
        mockUseElementSize.mockReturnValue([width, 300])
        render(<SourceActionsHeader message={createMessage()} />)

        if (collapsed)
            expect(screen.getByText('collapsed-actions')).toBeInTheDocument()
        else
            expect(
                screen.queryByText('collapsed-actions'),
            ).not.toBeInTheDocument()
    })

    it.each([
        [250, true],
        [350, false],
    ])('collapses intents when width is %d', (width, collapsed) => {
        mockUseElementSize.mockReturnValue([width, 300])
        render(<SourceActionsHeader message={createMessage()} />)

        if (collapsed)
            expect(
                screen.queryByText('intents-feedback'),
            ).not.toBeInTheDocument()
        else expect(screen.getByText('intents-feedback')).toBeInTheDocument()
    })

    it.each([
        ['hide', undefined, 'instagramHideComment'],
        ['unhide', '2023-01-01', 'instagramUnhideComment'],
    ])(
        'handles Instagram %s action',
        (action, hiddenDatetime, expectedAction) => {
            render(
                <SourceActionsHeader
                    message={createMessage({
                        source: {
                            type: TicketMessageSourceType.InstagramComment,
                        },
                        meta: { hidden_datetime: hiddenDatetime },
                    })}
                />,
            )

            fireEvent.click(
                screen.getByTitle(action === 'hide' ? 'Hide' : 'Unhide'),
            )
            expect(mockDispatch).toHaveBeenCalledWith(mockActionObject)
            expect(mockExecuteAction).toHaveBeenCalledWith({
                actionName: expectedAction,
                integrationId: 456,
                payload: {
                    comment_id: '123',
                },
            })
        },
    )

    it.each([
        ['hide', undefined, 'facebookHideComment'],
        ['unhide', '2023-01-01', 'facebookUnhideComment'],
    ])(
        'handles Facebook %s action',
        (action, hiddenDatetime, expectedAction) => {
            render(
                <SourceActionsHeader
                    message={createMessage({
                        source: {
                            type: TicketMessageSourceType.FacebookComment,
                        },
                        meta: { hidden_datetime: hiddenDatetime },
                    })}
                />,
            )

            fireEvent.click(
                screen.getByTitle(action === 'hide' ? 'Hide' : 'Unhide'),
            )
            expect(mockDispatch).toHaveBeenCalledWith(mockActionObject)
            expect(mockExecuteAction).toHaveBeenCalledWith({
                actionName: expectedAction,
                integrationId: 456,
                payload: {
                    comment_id: '123',
                },
            })
        },
    )

    it('does not show actions for agent messages', () => {
        render(
            <SourceActionsHeader
                message={createMessage({ from_agent: true })}
            />,
        )
        expect(screen.queryByTitle(/hide|unhide/i)).not.toBeInTheDocument()
        expect(screen.queryByText('intents-feedback')).not.toBeInTheDocument()
    })

    it('shows private reply for Instagram with modern helpdesk', () => {
        mockUseAppSelector.mockReturnValue(false)
        render(
            <SourceActionsHeader
                message={createMessage({
                    source: { type: TicketMessageSourceType.InstagramComment },
                })}
            />,
        )
        expect(screen.getByText('private-reply')).toBeInTheDocument()
    })

    it('hides private reply for Instagram with legacy helpdesk', () => {
        mockUseAppSelector.mockReturnValue(true)
        render(
            <SourceActionsHeader
                message={createMessage({
                    source: { type: TicketMessageSourceType.InstagramComment },
                })}
            />,
        )
        expect(screen.queryByText('private-reply')).not.toBeInTheDocument()
    })
})
