//@flow
import {shallow} from 'enzyme'
import React from 'react'

import Meta from '../Meta'

describe('ticket message meta', () => {
    it('should add a -sent via rule- label because the message was sent by a rule', () => {
        const component = shallow(
            <Meta
                messageId="some-id"
                via="rule"
                ruleId='4'
            />
        )
        const fromVia = component.find('From')

        const html = fromVia.render()
        html.find('.material-icons').remove()
        expect(html.text()).toBe('sent via a Rule')
    })

    it('should add a -sent via campaign- label because the message was sent by a campaign', () => {
        const component = shallow(
            <Meta
                messageId="some-id"
                via="something"
                integrationId="118"
                meta={{
                    campaign_id: '123'
                }}
            />
        )
        const fromVia = component.find('From')

        const html = fromVia.render()
        html.find('.material-icons').remove()
        expect(html.text()).toBe('sent via a Campaign')
    })

    it('should display "go to post" link', () => {
        const pageId = '871900732905218'
        const postId = '2750858871676052'
        const source = {
            extra: {page_id: pageId, post_id: `${pageId}_${postId}`},
            from: {address: `${pageId}-${pageId}`, name: 'Nulastin'},
            type: 'facebook-post',
            to: [{address: `${pageId}-${pageId}`, name: 'Nulastin'}]
        }

        const component = shallow(
            <Meta
                via="facebook"
                integrationId="118"
                source={source}
            />
        )

        const from = component.find('From').dive()
        expect(from.text()).toBe('go to post')
        expect(from.find('a').prop('href')).toEqual(`https://facebook.com/${postId}`)
    })

    it('should display "go to comment" link', () => {
        const pageId = '871900732905218'
        const postId = '2750858871676052'
        const userId = '2941872749234184'
        const commentId = '2823237684438170'
        const source = {
            extra: {page_id: pageId, post_id: `${pageId}_${postId}`, parent_id: `${pageId}_${postId}`},
            from: {address: `${pageId}-${userId}`, name: 'Foo Bar'},
            type: 'facebook-comment',
            to: [{address: `${pageId}-${pageId}`, name: 'Nulastin'}]
        }

        const component = shallow(
            <Meta
                messageId={`${postId}_${commentId}`}
                via="facebook"
                integrationId="118"
                source={source}
            />
        )

        const from = component.find('From').dive()
        expect(from.text()).toBe('go to comment')
        expect(from.find('a').prop('href')).toEqual(`https://facebook.com/${postId}?comment_id=${commentId}`)
    })

    it('should display "go to reply" link', () => {
        const pageId = '871900732905218'
        const postId = '2750858871676052'
        const userId = '2941872749234184'
        const commentId = '2823237684438170'
        const replyId = '2824439047651367'
        const source = {
            extra: {page_id: pageId, post_id: `${pageId}_${postId}`, parent_id: `${pageId}_${commentId}`},
            from: {address: `${pageId}-${pageId}`, name: 'Nulastin'},
            type: 'facebook-comment',
            to: [{address: `${pageId}-${userId}`, name: 'Foo Bar'}]
        }

        const component = shallow(
            <Meta
                messageId={`${postId}_${replyId}`}
                via="facebook"
                integrationId="118"
                source={source}
            />
        )

        const from = component.find('From').dive()
        expect(from.text()).toBe('go to reply')
        expect(from.find('a').prop('href'))
            .toEqual(`https://facebook.com/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`)
    })
})
