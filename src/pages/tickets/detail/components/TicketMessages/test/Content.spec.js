//@flow
import React from 'react'
import {mount} from 'enzyme'

import Content from '../Content'

describe('Content', () => {
    it('should render empty if empty props', () => {
        const component = mount(
            <Content/>,
        )

        expect(component).toBeEmptyRender()
    })

    it('should display html by default', () => {
        const component = mount(
            <Content
                text="text"
                html="html"
            />,
        )
        expect(component).toHaveText('html')
    })

    it('should use text when no html', () => {
        const component = mount(
            <Content
                text="text"
                html=""
            />,
        )
        expect(component).toHaveText('text')
    })

    it('should display strippedHtml and ellipis', () => {
        const component = mount(
            <Content
                text="text"
                html="long html"
                strippedHtml="stripped html"
                strippedText="stripped text"
            />,
        )
        expect(component).toIncludeText('stripped html')
        // TODO (@pwlmaciejewski): Invalid type declaration for toContainMatchingElement.
        // Ignored for now. It should go away after jest version bump.
        // $FlowFixMe
        expect(component).toContainMatchingElement('Ellipsis')
    })

    it('should linkify text', () => {
        const component = mount(
            <Content
                text="text http://gorgias.io/"
            />,
        )
        const link = component.render().find('a')
        expect(link.prop('href')).toBe('http://gorgias.io/')
        expect(link.text()).toBe('http://gorgias.io/')
    })

    it('should not escape quotes', () => {
        const component = mount(
            <Content
                text='these "quotes" here'
                html='these "quotes" here'
            />,
        )
        expect(component).toHaveText('these "quotes" here')
    })

    it('should not remove invalid characters', () => {
        const component = mount(
            <Content
                text="Thank you <3 you are the best"
                html="Thank you <3 you are the best"
            />,
        )
        expect(component).toHaveText('Thank you <3 you are the best')
    })

    it('should linkify html', () => {
        const component = mount(
            <Content
                html="html http://gorgias.io/"
            />,
        )
        const link = component.render().find('a')
        expect(link.prop('href')).toBe('http://gorgias.io/')
        expect(link.text()).toBe('http://gorgias.io/')
    })

    it('should linkify invalid html', () => {
        const component = mount(
            <Content
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
            />,
        )
        const link = component.render().find('a').first()
        expect(link.prop('href')).toBe('http://gorgias.io')
        expect(link.prop('target')).toBe('_blank')
        expect(link.text()).toBe('http://gorgias.io')
    })

    it('should set target=_blank for linkified links', () => {
        const component = mount(
            <Content
                text="https://gorgias.io"
            />,
        )
        expect(component.render().find('a').prop('target')).toBe('_blank')
    })

    it('should set target=_blank for body_html links', () => {
        const component = mount(
            <Content
                html='<a href="#">text</a>'
            />,
        )
        expect(component.render().find('a').prop('target')).toBe('_blank')
    })

    it('should set rel=noopener noreferrer  for all links', () => {
        const component = mount(
            <Content
                text="https://gorgias.io"
            />,
        )
        expect(component.render().find('a').prop('rel')).toBe('noreferrer noopener')
    })

    it('should set rel=noopener noreferrer  for all links', () => {
        const component = mount(
            <Content
                html='<a href="#">text</a>'
            />,
        )
        expect(component.render().find('a').prop('rel')).toBe('noreferrer noopener')
    })

    it('should set new-line-interpret class', () => {
        const component = mount(
            <Content
                text="my test \n with a new line"
            />,
        )
        expect(component.find('.new-line-interpret')).toExist()
    })

    it('should keep the quotation marks and incomplete tags', () => {
        const component = mount(
            <Content
                text='"text" <3'
            />,
        )
        expect(component.render().text()).toBe('"text" <3')
    })

    it('should ignore whitespace only body', () => {
        const component = mount(
            <Content
                text="text"
                html="

                "
            />,
        )
        expect(component.render().text()).toBe('text')
    })
})
