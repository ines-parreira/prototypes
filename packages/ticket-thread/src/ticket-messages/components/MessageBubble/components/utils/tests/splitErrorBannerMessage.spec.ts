import { splitErrorBannerMessage } from '#ticket-messages/components/MessageBubble/components/utils/splitErrorBannerMessage'

describe('splitErrorBannerMessage', () => {
    it('keeps short text as the title only', () => {
        expect(splitErrorBannerMessage('This message was not sent.')).toEqual({
            title: 'This message was not sent.',
        })
    })

    it('splits on a sentence boundary when the first sentence is compact', () => {
        expect(
            splitErrorBannerMessage(
                'Review already has a comment. Check the guide for more information.',
            ),
        ).toEqual({
            title: 'Review already has a comment.',
            content: 'Check the guide for more information.',
        })
    })

    it('splits on a colon when there is no sentence boundary', () => {
        expect(
            splitErrorBannerMessage(
                'Message not sent: Shopify refund failed because the amount exceeds the order total.',
            ),
        ).toEqual({
            title: 'Message not sent',
            content:
                'Shopify refund failed because the amount exceeds the order total.',
        })
    })

    it('does not split inside URLs', () => {
        expect(
            splitErrorBannerMessage(
                'Learn more at https://example.com/docs/errors for details.',
            ),
        ).toEqual({
            title: 'Learn more at https://example.com/docs/errors for details.',
        })
    })

    it('keeps HTML content unsplit', () => {
        expect(
            splitErrorBannerMessage(
                "This comment can not be sent.<br />Check Yotpo's <a href='https://example.com'>Comment guide</a> for more information.",
            ),
        ).toEqual({
            content:
                "This comment can not be sent.<br />Check Yotpo's <a href='https://example.com'>Comment guide</a> for more information.",
        })
    })
})
