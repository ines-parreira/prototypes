import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {mount} from 'enzyme'

import {ContentComponent} from '../Content'

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
        }) =>
            (
                <div
                    data-mocked-react-player-here
                    data-url={url}
                    data-controls={controls}
                    data-light={light}
                    data-width={width}
                    data-height={height}
                />
            )
)

const sharedProps: ComponentProps<typeof ContentComponent> = {
    toggleQuote: jest.fn(),
    isMessageExpanded: false,
    messageId: 1,
}

describe('Content', () => {
    afterAll(() => {
        jest.resetAllMocks()
    })
    it('should render empty if empty props', () => {
        const component = mount(<ContentComponent {...sharedProps} />)

        expect(component).toBeEmptyRender()
    })

    it('should display html by default', () => {
        const component = mount(
            <ContentComponent {...sharedProps} text="text" html="html" />
        )
        expect(component).toHaveText('html')
    })

    it('should use text when no html', () => {
        const component = mount(
            <ContentComponent {...sharedProps} text="text" html="" />
        )
        expect(component).toHaveText('text')
    })

    it('should display strippedHtml and ellipis', () => {
        const component = mount(
            <ContentComponent
                {...sharedProps}
                text="text"
                html="long html"
                strippedHtml="stripped html"
                strippedText="stripped text"
            />
        )
        expect(component).toIncludeText('stripped html')
        // TODO (@pwlmaciejewski): Invalid type declaration for toContainMatchingElement.
        // Ignored for now. It should go away after jest version bump.
        // $FlowFixMe
        expect(component).toContainMatchingElement('Ellipsis')
    })

    it('should linkify text', () => {
        const component = mount(
            <ContentComponent {...sharedProps} text="text http://gorgias.io/" />
        )
        const link = component.render().find('a')
        expect(link.prop('href')).toBe('http://gorgias.io/')
        expect(link.text()).toBe('http://gorgias.io/')
    })

    it('should not escape quotes', () => {
        const component = mount(
            <ContentComponent
                {...sharedProps}
                text='these "quotes" here'
                html='these "quotes" here'
            />
        )
        expect(component).toHaveText('these "quotes" here')
    })

    it('should not remove invalid characters', () => {
        const component = mount(
            <ContentComponent
                {...sharedProps}
                text="Thank you <3 you are the best"
                html="Thank you <3 you are the best"
            />
        )
        expect(component).toHaveText('Thank you <3 you are the best')
    })

    it('should linkify html', () => {
        const component = mount(
            <ContentComponent {...sharedProps} html="html http://gorgias.io/" />
        )
        const link = component.render().find('a')
        expect(link.prop('href')).toBe('http://gorgias.io/')
        expect(link.text()).toBe('http://gorgias.io/')
    })

    it('should linkify invalid html', () => {
        const component = mount(
            <ContentComponent
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
                            http://gorgias.io
                        <body>
                            <![CDATA[pizza]]>
                            <a href="https://gorgias.io">gorgias.io</a>
                        </body>
                    </html>
                `}
            />
        )
        const link = component.render().find('a').first()
        expect(link.prop('href')).toBe('http://gorgias.io')
        expect(link.prop('target')).toBe('_blank')
        expect(link.text()).toBe('http://gorgias.io')
    })

    it('should set target=_blank for linkified links', () => {
        const component = mount(
            <ContentComponent {...sharedProps} text="https://gorgias.io" />
        )
        expect(component.render().find('a').prop('target')).toBe('_blank')
    })

    it('should set target=_blank for body_html links', () => {
        const component = mount(
            <ContentComponent {...sharedProps} html='<a href="#">text</a>' />
        )
        expect(component.render().find('a').prop('target')).toBe('_blank')
    })

    it('should set rel=noopener noreferrer  for all links', () => {
        const component = mount(
            <ContentComponent {...sharedProps} text="https://gorgias.io" />
        )
        expect(component.render().find('a').prop('rel')).toBe(
            'noreferrer noopener'
        )
    })

    it('should set rel=noopener noreferrer  for all links', () => {
        const component = mount(
            <ContentComponent {...sharedProps} html='<a href="#">text</a>' />
        )
        expect(component.render().find('a').prop('rel')).toBe(
            'noreferrer noopener'
        )
    })

    it('should set new-line-interpret class', () => {
        const component = mount(
            <ContentComponent
                {...sharedProps}
                text="my test \n with a new line"
            />
        )
        expect(component.render().text()).toBe('my test \\n with a new line')
    })

    it('should keep the quotation marks and incomplete tags', () => {
        const component = mount(
            <ContentComponent {...sharedProps} text='"text" <3' />
        )
        expect(component.render().text()).toBe('"text" <3')
    })

    it('should ignore whitespace only body', () => {
        const component = mount(
            <ContentComponent
                {...sharedProps}
                text="text"
                html="

                "
            />
        )
        expect(component.render().text()).toBe('text')
    })

    it('should render react player video after the content', () => {
        const {container} = render(
            <ContentComponent
                {...sharedProps}
                html={`
                <div>text before video</div>
                <div><br /></div>
                <div class="react-player-container" data-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div>
                <div>text after video</div>
                `}
            />
        )
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div>
                <div
                  class="content"
                >
                  <div>
                    text before video
                  </div>
                  
                            
                  <div>
                    <br />
                  </div>
                  
                            
                            
                  <div>
                    text after video
                  </div>
                </div>
                
                <div
                  class="content"
                >
                  <div
                    data-controls="true"
                    data-height="225"
                    data-light="true"
                    data-mocked-react-player-here="true"
                    data-url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
                    data-width="400"
                  />
                </div>
              </div>
            </div>
        `)
    })
})
