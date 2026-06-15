import { screen } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { render } from '../../../../../tests/render.utils'
import { TicketThreadItemTag } from '../../../../../thread/itemTags'
import * as ExpandedMessagesModule from '../../../../context/ExpandedMessages'
import type { TicketThreadRegularMessageItem } from '../../../../types'
import { MessageVideos } from '../MessageVideos'

vi.mock('react-player', () => ({
    default: ({ url }: { url: string }) => <div>{`react-player:${url}`}</div>,
}))

const mockUseExpandedMessages = vi.spyOn(
    ExpandedMessagesModule,
    'useExpandedMessages',
)

function makeItem(
    overrides: Partial<TicketThreadRegularMessageItem['data']> = {},
) {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: mockTicketMessage({
            id: 456,
            channel: 'chat',
            body_html: null,
            body_text: 'Hello world',
            stripped_html: null,
            stripped_text: 'Hello world',
            ...overrides,
        }),
        datetime: '2024-03-21T11:00:00Z',
    } as TicketThreadRegularMessageItem
}

beforeEach(() => {
    mockUseExpandedMessages.mockReturnValue({
        expandedMessageIds: [],
        toggleMessage: vi.fn(),
        isMessageExpanded: vi.fn(() => false),
    })
})

describe('MessageVideos', () => {
    it('renders videos extracted from html content', () => {
        render(
            <MessageVideos
                item={makeItem({
                    body_html: `
                        <div>text before video</div>
                        <div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div>
                        <div>text after video</div>
                    `,
                    body_text: null,
                    stripped_html: null,
                    stripped_text: null,
                })}
            />,
        )

        expect(
            screen.getByText(
                'react-player:https://www.youtube.com/watch?v=4sLFpe-xbhk',
            ),
        ).toBeInTheDocument()
    })

    it('does not render videos when html content has none', () => {
        render(
            <MessageVideos
                item={makeItem({
                    body_html: '<div>Hello world</div>',
                    body_text: null,
                    stripped_html: null,
                    stripped_text: null,
                })}
            />,
        )

        expect(
            screen.queryByText(
                'react-player:https://www.youtube.com/watch?v=4sLFpe-xbhk',
            ),
        ).not.toBeInTheDocument()
    })
})
