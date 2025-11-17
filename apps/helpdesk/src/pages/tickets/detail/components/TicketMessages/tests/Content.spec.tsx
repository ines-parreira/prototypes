import type { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { mockTicketMessageTranslation } from '@gorgias/helpdesk-mocks'

import { THEME_NAME } from 'core/theme'

import Content from '../Content'

jest.mock(
    'react-player',
    () =>
        ({
            url,
            controls,
            light,
            width,
            height,
        }: {
            url: string
            controls: boolean
            light: boolean
            width: number | string
            height: number | string
        }) => (
            <div
                data-mocked-react-player-here
                data-url={url}
                data-controls={controls}
                data-light={light}
                data-width={width}
                data-height={height}
            />
        ),
)

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
        }) as typeof import('@repo/logging'),
)

const sharedProps: ComponentProps<typeof Content> = {
    messageId: 1,
    meta: null,
    messagePosition: 1,
    toggleQuote: jest.fn(),
    isMessageExpanded: false,
}

describe('Content', () => {
    afterAll(() => {
        jest.resetAllMocks()
    })
    it('should render empty if empty props', () => {
        const { container } = render(<Content {...sharedProps} />)

        expect(container.firstChild).toBe(null)
    })

    it('should display html by default', () => {
        const html = 'html'
        const { getByText } = render(
            <Content {...sharedProps} text="text" html={html} />,
        )
        expect(getByText(html))
    })

    it('should use text when no html', () => {
        const text = 'text'
        const { getByText } = render(
            <Content {...sharedProps} text={text} html="" />,
        )
        expect(getByText(text))
    })

    it('should display strippedHtml and ellipis', () => {
        const { getByText } = render(
            <Content
                {...sharedProps}
                text="text"
                html="long html"
                strippedHtml="stripped html"
                strippedText="stripped text"
            />,
        )
        expect(getByText('stripped html')).toBeInTheDocument()
        expect(getByText('…')).toBeInTheDocument()
    })

    it('should linkify text', () => {
        const link = 'http://gorgias.io/'
        const { getByText } = render(
            <Content {...sharedProps} text={`text ${link}`} />,
        )
        expect(getByText(link).getAttribute('href')).toBe(link)
        expect(getByText(link).textContent).toBe(link)
    })

    it('should not escape quotes', () => {
        const text = 'these "quotes" here'
        const { getByText } = render(
            <Content {...sharedProps} text={text} html={text} />,
        )
        expect(getByText(text)).toBeInTheDocument()
    })

    it('should not remove invalid characters', () => {
        const text = 'Thank you <3 you are the best'
        const { getByText } = render(
            <Content {...sharedProps} text={text} html={text} />,
        )
        expect(getByText(text)).toBeInTheDocument()
    })

    it('should linkify html', () => {
        const link = 'http://gorgias.io/'
        const { getByText } = render(
            <Content {...sharedProps} html={`html ${link}`} />,
        )

        expect(getByText(link).getAttribute('href')).toBe(link)
        expect(getByText(link).textContent).toBe(link)
    })

    it('should linkify invalid html', () => {
        const link = 'gorgias.io'
        const { getByText } = render(
            <Content
                {...sharedProps}
                html={`
                    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional //EN">
                    <!doctype html>
                    <html>
                        <head>
                            <title>Pepperoni</title>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                        </head>
                        <table>
                            http://${link}
                        <body>
                            <![CDATA[pizza]]>
                            <a href="https://gorgias.io">${link}</a>
                        </body>
                    </html>
                `}
            />,
        )

        expect(getByText(link).getAttribute('href')).toBe(`https://${link}`)
        expect(getByText(link).getAttribute('target')).toBe('_blank')
        expect(getByText(link).textContent).toBe(link)
    })

    it('should set target=_blank for linkified links', () => {
        const text = 'https://gorgias.io/'
        const { getByText } = render(<Content {...sharedProps} text={text} />)

        expect(getByText(text).getAttribute('target')).toBe('_blank')
    })

    it('should set target=_blank for body_html links', () => {
        const text = 'text'
        const { getByText } = render(
            <Content {...sharedProps} html={`<a href="#">${text}</a>`} />,
        )
        expect(getByText(text).getAttribute('target')).toBe('_blank')
    })

    it('should set rel=noopener noreferrer for all links', () => {
        const text = 'https://gorgias.io/'
        const { getByText } = render(<Content {...sharedProps} text={text} />)
        expect(getByText(text).getAttribute('rel')).toBe('noreferrer noopener')
    })

    it('should set rel=noopener noreferrer for all links', () => {
        const text = 'https://gorgias.io/'
        const { getByText } = render(
            <Content {...sharedProps} html={`<a href="#">${text}</a>`} />,
        )
        expect(getByText(text).getAttribute('rel')).toBe('noreferrer noopener')
    })

    it('should set new-line-interpret class', () => {
        const { getByText } = render(
            <Content {...sharedProps} text="my test \n with a new line" />,
        )
        expect(getByText('my test \\n with a new line')).toBeInTheDocument()
    })

    it('should keep the quotation marks and incomplete tags', () => {
        const text = '"text" <3'

        const { getByText } = render(<Content {...sharedProps} text={text} />)
        expect(getByText(text)).toBeInTheDocument()
    })

    it('should ignore whitespace only body', () => {
        const text = 'text'
        const { getByText } = render(
            <Content
                {...sharedProps}
                text={text}
                html="

                "
            />,
        )
        expect(getByText(text)).toBeInTheDocument()
    })

    it('should render react player video after the content', () => {
        render(
            <Content
                {...sharedProps}
                html={`
                <div>text before video</div>
                <div><br /></div>
                <div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div>
                <div>text after video</div>
                `}
            />,
        )
        const lastContent = screen.getByText('text after video')
        const video = document.querySelector('[data-mocked-react-player-here]')
        expect(
            lastContent.compareDocumentPosition(video!) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
    })

    it('should not display disclaimer when message is not truncated', () => {
        const { queryByText } = render(<Content {...sharedProps} text="text" />)
        expect(
            queryByText(/This message is too large to display/),
        ).not.toBeInTheDocument()
    })

    it('should display disclaimer when html of message is truncated', () => {
        const { getByText } = render(
            <Content
                {...sharedProps}
                html="Thank you <3 you are the best"
                meta={{
                    body_html_truncated: true,
                }}
            />,
        )
        expect(
            getByText(/This message is too large to display/),
        ).toBeInTheDocument()
    })

    it('should display disclaimer when text of message is truncated', () => {
        const { getByText } = render(
            <Content
                {...sharedProps}
                text="Thank you <3 you are the best"
                meta={{
                    body_text_truncated: true,
                }}
            />,
        )
        expect(
            getByText(/This message is too large to display/),
        ).toBeInTheDocument()
    })

    it('should display message content without forcing light theme', () => {
        const { container } = render(
            <Content {...sharedProps} html="<div style='height: 100%'><div>" />,
        )
        expect(
            (container.firstChild as Element).classList.contains(
                THEME_NAME.Light,
            ),
        ).toBeFalsy()
    })

    it('should display message content with light theme when it overrides color style', () => {
        const { container } = render(
            <Content {...sharedProps} html="<div style='color: blue'><div>" />,
        )
        expect(
            (container.firstChild as Element).classList.contains(
                THEME_NAME.Light,
            ),
        ).toBeTruthy()
    })

    it('should toggle quote and track event when clicking ellipsis for non-first message', () => {
        const toggleQuote = jest.fn()
        const { getByText } = render(
            <Content
                {...sharedProps}
                text="text"
                html="long html"
                strippedHtml="stripped html"
                strippedText="stripped text"
                messagePosition={2}
                toggleQuote={toggleQuote}
            />,
        )

        userEvent.click(getByText('…'))
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.MessageThreadClicked)
        expect(toggleQuote).toHaveBeenCalledWith(1)
    })

    it('should toggle quote without tracking event when clicking ellipsis for first message', () => {
        const toggleQuote = jest.fn()
        const { getByText } = render(
            <Content
                {...sharedProps}
                text="text"
                html="long html"
                strippedHtml="stripped html"
                strippedText="stripped text"
                messagePosition={1}
                toggleQuote={toggleQuote}
            />,
        )

        userEvent.click(getByText('…'))
        expect(logEvent).not.toHaveBeenCalledWith(
            SegmentEvent.MessageThreadClicked,
        )
        expect(toggleQuote).toHaveBeenCalledWith(1)
    })

    describe('Translations', () => {
        it('should display original content when no translations provided', () => {
            const { getByText } = render(
                <Content
                    {...sharedProps}
                    text="original text"
                    html="<strong>original html</strong>"
                    strippedHtml="<strong>stripped original</strong>"
                />,
            )
            expect(getByText('stripped original')).toBeInTheDocument()
        })

        it('should display translated stripped content when translations object is provided', () => {
            const { getByText } = render(
                <Content
                    {...sharedProps}
                    text="original text"
                    html="<strong>original html</strong>"
                    strippedHtml="<strong>stripped original</strong>"
                    translations={mockTicketMessageTranslation({
                        stripped_html: '<strong>translated stripped</strong>',
                        stripped_text: 'translated stripped text',
                    })}
                />,
            )
            expect(getByText('translated stripped')).toBeInTheDocument()
        })

        it('should fall back to original stripped content when translations object lacks stripped_html & stripped_text', () => {
            const { getByText } = render(
                <Content
                    {...sharedProps}
                    text="original text"
                    html="<strong>original html</strong>"
                    strippedHtml="<strong>stripped original</strong>"
                    translations={mockTicketMessageTranslation({
                        stripped_html: '',
                        stripped_text: '',
                    })}
                />,
            )
            expect(getByText('stripped original')).toBeInTheDocument()
        })

        it('should display translated stripped text when only stripped_text translation is provided', () => {
            const { getByText } = render(
                <Content
                    {...sharedProps}
                    text="original text"
                    strippedText="stripped original text"
                    translations={mockTicketMessageTranslation({
                        stripped_html: '',
                        stripped_text: 'translated stripped text',
                    })}
                />,
            )
            expect(getByText('translated stripped text')).toBeInTheDocument()
        })

        it('should prefer translated stripped_html over stripped_text when both are provided', () => {
            const { getByText, queryByText } = render(
                <Content
                    {...sharedProps}
                    text="original text"
                    html="<strong>original html</strong>"
                    strippedHtml="<strong>stripped original</strong>"
                    translations={mockTicketMessageTranslation({
                        stripped_html: '<strong>translated html</strong>',
                        stripped_text: 'translated text',
                    })}
                />,
            )
            expect(getByText('translated html')).toBeInTheDocument()
            expect(queryByText('translated text')).not.toBeInTheDocument()
        })

        it('should display translated content when not expanded and translations available', () => {
            const { getByText, queryByText } = render(
                <Content
                    {...sharedProps}
                    messageId={123}
                    text="original text"
                    html="<strong>original html</strong>"
                    strippedHtml="<strong>stripped original</strong>"
                    translations={mockTicketMessageTranslation({
                        stripped_html: '<strong>translated stripped</strong>',
                        stripped_text: 'translated stripped text',
                    })}
                />,
            )

            expect(getByText('translated stripped')).toBeInTheDocument()
            expect(queryByText('stripped original')).not.toBeInTheDocument()
            expect(getByText('…')).toBeInTheDocument()
        })

        it('should display translated content when stripped fields are null but body fields have content', () => {
            const { getByText } = render(
                <Content
                    {...sharedProps}
                    text="original text"
                    html="<strong>original html</strong>"
                    strippedHtml={null}
                    strippedText={null}
                    translations={mockTicketMessageTranslation({
                        stripped_html: '<strong>translated html</strong>',
                        stripped_text: 'translated text',
                    })}
                />,
            )

            expect(getByText('translated html')).toBeInTheDocument()
        })
    })
})
