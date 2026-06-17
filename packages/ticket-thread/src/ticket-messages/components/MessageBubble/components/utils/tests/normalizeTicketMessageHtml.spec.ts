import { normalizeTicketMessageHtml } from '#ticket-messages/components/MessageBubble/components/utils/normalizeTicketMessageHtml'

describe('normalizeTicketMessageHtml', () => {
    it('renders positioned Outlook fallback elements as image overlays', () => {
        const html =
            '<p>if !vml<span style="mso-ignore:vglayout;position:absolute;z-index:251659264;margin-left:474px;margin-top:384px;width:970px;height:90px"><img alt="overlay" height="60" src="overlay.png" width="647"></span>endif<img alt="screenshot" height="550" src="screenshot.png" width="1009"></p>'

        const normalizedHtml = normalizeTicketMessageHtml(html)
        const template = document.createElement('template')
        template.innerHTML = normalizedHtml
        const frameElement = template.content.querySelector<HTMLElement>(
            '.ticket-thread-message-outlook-overlay-frame',
        )
        const fallbackElement = template.content.querySelector<HTMLElement>(
            '.ticket-thread-message-outlook-overlay',
        )
        const overlayImageElement = template.content.querySelector(
            '.ticket-thread-message-outlook-overlay-image',
        )

        expect(normalizedHtml).not.toContain('if !vml')
        expect(normalizedHtml).not.toContain('endif')
        expect(frameElement).toContainElement(
            template.content.querySelector('img[alt="screenshot"]'),
        )
        expect(frameElement).toContainElement(fallbackElement)
        expect((frameElement as HTMLElement | null)?.style.display).toBe(
            'inline-block',
        )
        expect((frameElement as HTMLElement | null)?.style.position).toBe(
            'relative',
        )
        expect((frameElement as HTMLElement | null)?.style.width).toBe('1009px')
        expect(fallbackElement?.style.position).toBe('absolute')
        expect(fallbackElement?.style.pointerEvents).toBe('none')
        expect(fallbackElement?.style.left).toBe('46.9772%')
        expect(fallbackElement?.style.top).toBe('69.8182%')
        expect(fallbackElement?.style.width).toBe('64.1229%')
        expect((overlayImageElement as HTMLElement | null)?.style.display).toBe(
            'block',
        )
        expect((overlayImageElement as HTMLElement | null)?.style.height).toBe(
            '100%',
        )
        expect(template.content.querySelectorAll('img')).toHaveLength(2)
    })

    it('renders Outlook fallback overlays without child images', () => {
        const normalizedHtml = normalizeTicketMessageHtml(
            '<p>if !vml<span style="position:absolute;margin-left:96px;margin-top:48px;width:192px;height:96px;border:1px solid red"></span>endif<img alt="screenshot" src="screenshot.png" style="width:4in;height:2in"></p>',
        )
        const template = document.createElement('template')
        template.innerHTML = normalizedHtml
        const frameElement = template.content.querySelector<HTMLElement>(
            '.ticket-thread-message-outlook-overlay-frame',
        )
        const fallbackElement = template.content.querySelector<HTMLElement>(
            '.ticket-thread-message-outlook-overlay',
        )

        expect(frameElement?.style.width).toBe('384px')
        expect(fallbackElement?.style.left).toBe('25.0000%')
        expect(fallbackElement?.style.top).toBe('25.0000%')
        expect(fallbackElement?.style.width).toBe('50.0000%')
        expect(fallbackElement?.style.height).toBe('50.0000%')
        expect(
            template.content.querySelector(
                '.ticket-thread-message-outlook-overlay-image',
            ),
        ).toBeNull()
    })

    it('neutralizes positioned elements that are not Outlook fallbacks', () => {
        const normalizedHtml = normalizeTicketMessageHtml(
            '<p><span style="position:absolute;z-index:1;margin-left:474px;margin-top:384px;width:970px;height:90px">Hello</span></p>',
        )
        const template = document.createElement('template')
        template.innerHTML = normalizedHtml
        const positionedElement = template.content.querySelector('span')

        expect(positionedElement?.style.position).toBe('')
        expect(positionedElement?.style.zIndex).toBe('')
        expect(positionedElement?.style.marginLeft).toBe('')
        expect(positionedElement?.style.marginTop).toBe('')
        expect(positionedElement?.style.width).toBe('970px')
    })

    it('neutralizes Outlook fallbacks that do not have a target image', () => {
        const normalizedHtml = normalizeTicketMessageHtml(
            '<p>if !vml<span style="position:absolute;margin-left:10px;margin-top:20px;width:30px;height:40px">Hello</span>endif</p>',
        )
        const template = document.createElement('template')
        template.innerHTML = normalizedHtml
        const fallbackElement = template.content.querySelector('span')

        expect(fallbackElement).not.toHaveClass(
            'ticket-thread-message-outlook-overlay',
        )
        expect(fallbackElement?.style.position).toBe('')
        expect(fallbackElement?.style.width).toBe('30px')
    })

    it('neutralizes Outlook fallbacks with invalid overlay dimensions', () => {
        const normalizedHtml = normalizeTicketMessageHtml(
            '<p>if !vml<span style="position:absolute;margin-left:auto;margin-top:20px;width:30px;height:40px">Hello</span>endif<img alt="screenshot" height="100" src="screenshot.png" width="100"></p>',
        )
        const template = document.createElement('template')
        template.innerHTML = normalizedHtml
        const fallbackElement = template.content.querySelector('span')

        expect(fallbackElement).not.toHaveClass(
            'ticket-thread-message-outlook-overlay',
        )
        expect(fallbackElement?.style.position).toBe('')
        expect(fallbackElement?.style.marginLeft).toBe('')
    })

    it('removes empty style attributes after neutralizing positioned elements', () => {
        const normalizedHtml = normalizeTicketMessageHtml(
            '<p><span style="position:fixed;top:1px">Hello</span></p>',
        )
        const template = document.createElement('template')
        template.innerHTML = normalizedHtml
        const positionedElement = template.content.querySelector('span')

        expect(positionedElement).not.toHaveAttribute('style')
    })

    it('keeps regular styled email elements unchanged', () => {
        const html =
            '<p><span style="margin-left:12px;color:#333">Hello</span></p>'

        expect(normalizeTicketMessageHtml(html)).toBe(html)
    })

    it('keeps content unchanged when no styled element uses positioned layout', () => {
        const html = '<p>position:absolute</p>'

        expect(normalizeTicketMessageHtml(html)).toBe(html)
    })

    it('keeps content unchanged outside browser-like environments', () => {
        const html = '<p><span style="position:absolute">Hello</span></p>'
        const originalDocument = document

        Object.defineProperty(globalThis, 'document', {
            configurable: true,
            value: undefined,
        })

        try {
            expect(normalizeTicketMessageHtml(html)).toBe(html)
        } finally {
            Object.defineProperty(globalThis, 'document', {
                configurable: true,
                value: originalDocument,
            })
        }
    })
})
