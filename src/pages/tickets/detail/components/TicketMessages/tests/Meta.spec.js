//@flow
import {shallow} from 'enzyme'
import React from 'react'

import {TicketVias} from '../../../../../../business/ticket.ts'
import Meta from '../Meta'
import {TWITTER_TWEET_SOURCE} from '../../../../../../config/ticket.ts'
import {TicketChannel} from '../../../../../../business/types/ticket.ts'

describe('ticket message meta', () => {
    it('should add a -sent via rule- label because the message was sent by a rule', () => {
        const component = shallow(
            <Meta messageId="some-id" via="rule" ruleId="4" />
        )
        const fromVia = component.find('From')

        const html = fromVia.render()
        html.find('.material-icons').remove()
        expect(html.text()).toBe('sent via a Rule')
    })

    it(
        'should add a -sent via campaign- label because the message was sent by a campaign on a ' +
            'smooch_inside integration',
        () => {
            const component = shallow(
                <Meta
                    messageId="some-id"
                    via="something"
                    integrationId={118}
                    meta={{
                        campaign_id: '123',
                    }}
                />
            )
            const fromVia = component.find('From')
            expect(fromVia).toMatchSnapshot()
        }
    )

    it(
        'should add a -sent via campaign- label because the message was sent by a campaign on a ' +
            'gorgias-chat integration',
        () => {
            const component = shallow(
                <Meta
                    messageId="some-id"
                    via={TicketVias.GORGIAS_CHAT}
                    integrationId={118}
                    meta={{
                        campaign_id: '123',
                    }}
                />
            )
            const fromVia = component.find('From')
            expect(fromVia).toMatchSnapshot()
        }
    )

    describe('facebook', () => {
        it('should display "go to post" link', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const source = {
                extra: {page_id: pageId, post_id: `${pageId}_${postId}`},
                from: {address: `${pageId}-${pageId}`, name: 'Nulastin'},
                type: 'facebook-post',
                to: [{address: `${pageId}-${pageId}`, name: 'Nulastin'}],
            }

            const component = shallow(
                <Meta via="facebook" integrationId={118} source={source} />
            )

            const from = component.find('From').dive()
            expect(from.text()).toBe('go to post')
            expect(from.find('a').prop('href')).toEqual(
                `https://facebook.com/${pageId}/posts/${postId}`
            )
        })

        it('should display "go to comment" link', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const userId = '2941872749234184'
            const commentId = '2823237684438170'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${pageId}_${postId}`,
                    parent_id: `${pageId}_${postId}`,
                },
                from: {address: `${pageId}-${userId}`, name: 'Foo Bar'},
                type: 'facebook-comment',
                to: [{address: `${pageId}-${pageId}`, name: 'Nulastin'}],
            }

            const component = shallow(
                <Meta
                    messageId={`${postId}_${commentId}`}
                    via="facebook"
                    integrationId={118}
                    source={source}
                />
            )

            const from = component.find('From').dive()
            expect(from.text()).toBe('go to comment')
            expect(from.find('a').prop('href')).toEqual(
                `https://facebook.com/${pageId}/posts/${postId}?comment_id=${commentId}`
            )
        })

        it('should display "go to reply" link', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const userId = '2941872749234184'
            const commentId = '2823237684438170'
            const replyId = '2824439047651367'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${pageId}_${postId}`,
                    parent_id: `${pageId}_${commentId}`,
                },
                from: {address: `${pageId}-${pageId}`, name: 'Nulastin'},
                type: 'facebook-comment',
                to: [{address: `${pageId}-${userId}`, name: 'Foo Bar'}],
            }

            const component = shallow(
                <Meta
                    messageId={`${postId}_${replyId}`}
                    via="facebook"
                    integrationId={118}
                    source={source}
                />
            )

            const from = component.find('From').dive()
            expect(from.text()).toBe('go to reply')
            expect(from.find('a').prop('href')).toEqual(
                `https://facebook.com/${pageId}/posts/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`
            )
        })

        it('should not display link when IDs are missing', () => {
            const pageId = '2022935111288280'
            const userId = '1940476102688095'
            const source = {
                extra: {page_id: pageId, post_id: null, parent_id: null},
                from: {address: `${pageId}-${userId}`, name: 'A Virk'},
                type: 'facebook-comment',
                to: [{address: `${pageId}-${pageId}-${pageId}`, name: 'IQ²'}],
            }

            const component = shallow(
                <Meta via="facebook" integrationId={118} source={source} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display "go to post" link for mentions', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${pageId}_${postId}`,
                    permalink: 'https://facebook.com/permalink',
                },
                from: {address: `${pageId}-${pageId}`, name: 'Nulastin'},
                type: 'facebook-mention-post',
                to: [{address: `${pageId}-${pageId}`, name: 'Nulastin'}],
            }

            const component = shallow(
                <Meta via="facebook" integrationId={118} source={source} />
            )

            const from = component.find('From').dive()
            expect(from.text()).toBe('go to post')
            expect(from.find('a').prop('href')).toEqual(
                'https://facebook.com/permalink'
            )
        })
    })

    describe('instagram', () => {
        it('should display "go to media" link', () => {
            const permalink = 'https://www.instagram.com/p/B_V7_Znngrv/'
            const source = {
                from: {name: 'trudoglife', address: 'trudoglife'},
                to: [{name: 'trudoglife', address: 'trudoglife'}],
                extra: {media_id: '18101302111081366', permalink},
                type: 'instagram-media',
            }

            const component = shallow(
                <Meta via="instagram" integrationId={118} source={source} />
            )

            const from = component.find('From').dive()
            expect(from.text()).toBe('go to media')
            expect(from.find('a').prop('href')).toEqual(permalink)
        })
    })

    describe('twitter', () => {
        it('should display "go to tweet" link', () => {
            const fromUsername = 'gorgiasio'
            const tweetId = '1399880580741935107'
            const tweetPermalink = `https://twitter.com/${fromUsername}/status/${tweetId}`
            const source = {
                from: {name: fromUsername, address: '12345'},
                to: [{name: fromUsername, address: '12345'}],
                extra: {
                    parent_id: null,
                    conversation_id: tweetId,
                },
                type: TWITTER_TWEET_SOURCE,
            }

            const component = shallow(
                <Meta
                    via={TicketChannel.Twitter}
                    integrationId={118}
                    source={source}
                />
            )

            const from = component.find('From').dive()
            expect(from.text()).toBe('go to tweet')
            expect(from.find('a').prop('href')).toEqual(tweetPermalink)
        })

        it('should display "replying to @twitter_handle - go to tweet" link', () => {
            const fromUsername = 'SmsBump'
            const toUsername = 'gorgiasio'
            const tweetId = '1400472973371445249'
            const tweetPermalink = `https://twitter.com/${fromUsername}/status/${tweetId}`
            const toProfileLink = `https://twitter.com/${toUsername}`
            const source = {
                from: {name: fromUsername, address: '12346'},
                to: [{name: toUsername, address: '12345'}],
                extra: {
                    parent_id: '1399880580741935107',
                    conversation_id: tweetId,
                },
                type: TWITTER_TWEET_SOURCE,
            }

            const component = shallow(
                <Meta
                    via={TicketChannel.Twitter}
                    integrationId={118}
                    source={source}
                />
            )

            const from = component.find('From').dive()

            expect(from.text()).toBe(`replying to @${toUsername} - go to tweet`)
            expect(from.find('a').at(0).prop('href')).toEqual(toProfileLink)
            expect(from.find('a').at(1).prop('href')).toEqual(tweetPermalink)
        })
    })
})
