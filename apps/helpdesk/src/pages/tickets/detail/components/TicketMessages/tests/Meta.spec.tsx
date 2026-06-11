import type { ReactElement } from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'

import { TicketVias } from 'business/ticket'
import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import { fetchRule } from 'models/rule/resources'
import { ManagedRuleDisplayName } from 'state/rules/constants'
import type { ManagedRule } from 'state/rules/types'
import { ManagedRulesSlugs, RuleType } from 'state/rules/types'
import type { RootState, StoreDispatch } from 'state/types'

import { Meta } from '../Meta'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const store = mockStore({
    entities: {
        rules: { 4: { id: '4', name: 'rule 4' } } as unknown,
        ruleRecipes: { [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture },
    },
} as RootState)

const renderWithStore = (ui: ReactElement) =>
    render(ui, {
        storeState: store.getState(),
    })

jest.mock('models/rule/resources')

describe('ticket message meta', () => {
    it('should add a -sent via rule- label because the message was sent by a rule', async () => {
        renderWithStore(<Meta messageId="some-id" via="rule" ruleId="4" />)

        await screen.findByText('sent via:')
        await screen.findByText('rule 4')
    })

    it('should fetch rule and display its name', async () => {
        const mockFetchRule = fetchRule as jest.MockedFunction<typeof fetchRule>
        const rule = { id: '5', name: 'rule 5' }
        mockFetchRule.mockImplementation(() => {
            return Promise.resolve(rule as any)
        })

        renderWithStore(
            <Meta messageId="some-id" via="rule" ruleId={rule.id} />,
        )

        expect(mockFetchRule).toHaveBeenCalled()

        await screen.findByText('sent via:')
        await screen.findByText(rule.name)
    })

    it('should display managed rule recipe name', async () => {
        const mockFetchRule = fetchRule as jest.MockedFunction<typeof fetchRule>

        const ruleName = 'rule 5'
        const rule: Pick<ManagedRule, 'id' | 'type' | 'name' | 'settings'> = {
            id: 1,
            name: ruleName,
            type: RuleType.Managed,
            settings: { slug: ManagedRulesSlugs.AutoReplyWismo },
        }

        mockFetchRule.mockImplementation(() => {
            return Promise.resolve(rule as any)
        })

        renderWithStore(
            <Meta messageId="some-id" via="rule" ruleId={rule.id.toString()} />,
        )

        expect(await screen.findByText('sent via:')).toBeTruthy()
        expect(
            await screen.findByText(
                ManagedRuleDisplayName.get(rule.settings.slug)!,
            ),
        ).toBeTruthy()

        expect(mockFetchRule).toHaveBeenCalled()
    })

    it('should persist fetched rule in redux store', async () => {
        const mockFetchRule = fetchRule as jest.MockedFunction<typeof fetchRule>
        const rule = { id: '5', name: 'rule 5' }
        mockFetchRule.mockImplementation(() => {
            return Promise.resolve(rule as any)
        })

        const { rerender } = renderWithStore(
            <Meta messageId="some-id" via="rule" ruleId={rule.id} />,
        )

        rerender(<Meta messageId="some-id" via="rule" ruleId={rule.id} />)

        expect(mockFetchRule).toHaveBeenCalledTimes(1)
        await screen.findByText('sent via:')
        await screen.findByText(rule.name)
    })

    it('should display rule suggestion', async () => {
        renderWithStore(
            <Meta
                messageId="some-id"
                via="something"
                meta={{ rule_suggestion_slug: emptyRuleRecipeFixture.slug }}
            />,
        )

        await screen.findByText('sent via suggested rule:')
        await screen.findByText(emptyRuleRecipeFixture.rule.name)
    })

    it('should display AI suggestion', async () => {
        renderWithStore(
            <Meta
                messageId="some-id"
                via="something"
                meta={{ ai_suggestion: true }}
            />,
        )

        await screen.findByText('answer suggested from Gorgias AI')
    })

    it('should display AI sales agent help on search', async () => {
        renderWithStore(
            <Meta
                messageId="some-id"
                via={TicketVias.GORGIAS_CHAT}
                meta={{
                    ai_campaign_id: '123',
                    ai_campaign_trigger_key: 'manual',
                    ai_campaign_trigger_operator: 'aiSalesAgentHelpOnSearch',
                    ai_campaign_trigger_value: 'backpacks',
                }}
            />,
        )

        await screen.findByText('from search')
        await screen.findByText('backpacks')
    })

    it(
        'should add a -sent via campaign- label because the message was sent by a campaign on a ' +
            'gorgias-chat integration',
        () => {
            const { container } = renderWithStore(
                <Meta
                    messageId="some-id"
                    via={TicketVias.GORGIAS_CHAT}
                    integrationId={118}
                    meta={{
                        campaign_id: '123',
                    }}
                />,
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    describe('facebook', () => {
        it('should display "go to post" link', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const source = {
                extra: { page_id: pageId, post_id: `${pageId}_${postId}` },
                from: { address: `${pageId}-${pageId}`, name: 'Nulastin' },
                type: TicketMessageSourceType.FacebookPost,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const { container } = renderWithStore(
                <Meta via="facebook" integrationId={118} source={source} />,
            )

            expect(container.textContent).toBe('go to post')
            expect(container.querySelector('a')?.href).toBe(
                `https://facebook.com/${pageId}/posts/${postId}`,
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
                from: { address: `${pageId}-${userId}`, name: 'Foo Bar' },
                type: TicketMessageSourceType.FacebookComment,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const { container } = renderWithStore(
                <Meta
                    messageId={`${postId}_${commentId}`}
                    via="facebook"
                    integrationId={118}
                    source={source}
                />,
            )

            expect(container.textContent).toBe('go to comment')
            expect(container.querySelector('a')?.href).toBe(
                `https://facebook.com/${pageId}/posts/${postId}?comment_id=${commentId}`,
            )
        })

        it('should display "responded to via Messenger by" with ticket link', async () => {
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
                from: { address: `${pageId}-${userId}`, name: 'Foo Bar' },
                type: TicketMessageSourceType.FacebookComment,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const meta = {
                replied_by: {
                    ticket_id: 3312,
                    ticket_message_id: 123,
                },
            }

            const { container } = renderWithStore(
                <Meta
                    via="facebook"
                    messageId={`${postId}_${commentId}`}
                    integrationId={118}
                    source={source}
                    meta={meta}
                />,
            )
            await waitFor(() =>
                expect(container.textContent).toContain(
                    'responded to via Messenger',
                ),
            )

            const links = Array.from(container.querySelectorAll('a'))
            expect(links[0].href).toEqual(
                `https://facebook.com/${pageId}/posts/${postId}?comment_id=${commentId}`,
            )
            expect(links[1].href).toEqual(`${window.location.href}3312`)
        })

        it('should display "responded via Messenger to" with ticket link', async () => {
            const meta = {
                replied_to: {
                    ticket_id: 3312,
                    ticket_message_id: 123,
                },
            }

            const { container, getByText } = renderWithStore(
                <Meta via="facebook" meta={meta} />,
            )

            await waitFor(() =>
                expect(container.textContent).toContain(
                    'responded via Messenger to',
                ),
            )

            expect(getByText('Comment')).toHaveAttribute('href', '3312')
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
                from: { address: `${pageId}-${pageId}`, name: 'Nulastin' },
                type: TicketMessageSourceType.FacebookComment,
                to: [{ address: `${pageId}-${userId}`, name: 'Foo Bar' }],
            }

            const { container } = renderWithStore(
                <Meta
                    messageId={`${postId}_${replyId}`}
                    via="facebook"
                    integrationId={118}
                    source={source}
                />,
            )

            expect(container.textContent).toBe('go to reply')
            expect(container.querySelector('a')?.href).toBe(
                `https://facebook.com/${pageId}/posts/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`,
            )
        })

        it('should not display link when IDs are missing', () => {
            const pageId = '2022935111288280'
            const userId = '1940476102688095'
            const source = {
                extra: { page_id: pageId },
                from: { address: `${pageId}-${userId}`, name: 'A Virk' },
                type: TicketMessageSourceType.FacebookComment,
                to: [{ address: `${pageId}-${pageId}-${pageId}`, name: 'IQ²' }],
            }

            const { container } = renderWithStore(
                <Meta via="facebook" integrationId={118} source={source} />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display "go to post" link for mention posts', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${pageId}_${postId}`,
                    permalink: 'https://facebook.com/permalink',
                },
                from: { address: `${pageId}-${pageId}`, name: 'Nulastin' },
                type: TicketMessageSourceType.FacebookMentionPost,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const { container } = renderWithStore(
                <Meta via="facebook" integrationId={118} source={source} />,
            )

            expect(container.textContent).toBe('go to post')
            expect(container.querySelector('a')?.href).toBe(
                'https://facebook.com/permalink',
            )
        })

        it('should display "go to comment" link for mention comments', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const feedId = '19837193719213'
            const commentId = '18762371983'
            const permalink = 'https://facebook.com/permalink'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${feedId}_${postId}`,
                    parent_id: `${feedId}_${postId}`,
                    permalink: permalink,
                },
                from: { address: `${pageId}-${pageId}`, name: 'Nulastin' },
                type: TicketMessageSourceType.FacebookMentionComment,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const { container } = renderWithStore(
                <Meta
                    via="facebook"
                    integrationId={118}
                    source={source}
                    messageId={`${postId}_${commentId}`}
                />,
            )

            expect(container.textContent).toBe('go to comment')
            expect(container.querySelector('a')?.href).toBe(permalink)
        })

        it('should display "go to comment" link for mention comments with no permalink', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const feedId = '19837193719213'
            const commentId = '18762371983'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${feedId}_${postId}`,
                    parent_id: `${feedId}_${postId}`,
                },
                from: { address: `${pageId}-${pageId}`, name: 'Nulastin' },
                type: TicketMessageSourceType.FacebookMentionComment,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const { container } = renderWithStore(
                <Meta
                    via="facebook"
                    integrationId={118}
                    source={source}
                    messageId={`${postId}_${commentId}`}
                />,
            )

            expect(container.textContent).toBe('go to comment')
            expect(container.querySelector('a')?.href).toBe(
                `https://facebook.com/${feedId}/posts/${postId}?comment_id=${commentId}`,
            )
        })

        it('should display "go to reply" link for mention reply comments', () => {
            const pageId = '871900732905218'
            const postId = '2750858871676052'
            const feedId = '19837193719213'
            const replyId = '18762371983'
            const commentId = '12321890383'
            const source = {
                extra: {
                    page_id: pageId,
                    post_id: `${feedId}_${postId}`,
                    parent_id: `${postId}_${commentId}`,
                    permalink: 'https://facebook.com/permalink',
                },
                from: { address: `${pageId}-${pageId}`, name: 'Nulastin' },
                type: TicketMessageSourceType.FacebookMentionComment,
                to: [{ address: `${pageId}-${pageId}`, name: 'Nulastin' }],
            }

            const { container } = renderWithStore(
                <Meta
                    via="facebook"
                    integrationId={118}
                    source={source}
                    messageId={`${commentId}_${replyId}`}
                />,
            )

            expect(container.textContent).toBe('go to reply')
            expect(container.querySelector('a')?.href).toBe(
                `https://facebook.com/${feedId}/posts/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`,
            )
        })
    })

    describe('instagram', () => {
        it('should display "go to media" link', () => {
            const permalink = 'https://www.instagram.com/p/B_V7_Znngrv/'
            const source = {
                from: { name: 'trudoglife', address: 'trudoglife' },
                to: [{ name: 'trudoglife', address: 'trudoglife' }],
                extra: { media_id: '18101302111081366', permalink },
                type: TicketMessageSourceType.InstagramMedia,
            }

            const { container } = renderWithStore(
                <Meta via="instagram" integrationId={118} source={source} />,
            )

            expect(container.textContent).toBe('go to media')
            expect(container.querySelector('a')?.href).toBe(permalink)
        })

        it('should display "responded to via Messenger by" with ticket link', async () => {
            const permalink = 'https://www.instagram.com/p/B_V7_Znngrv/'
            const source = {
                from: { name: 'trudoglife', address: 'trudoglife' },
                to: [{ name: 'trudoglife', address: 'trudoglife' }],
                extra: { media_id: '18101302111081366', permalink },
                type: TicketMessageSourceType.InstagramComment,
            }

            const meta = {
                replied_by: {
                    ticket_id: 3312,
                    ticket_message_id: 123,
                },
            }

            const { container } = renderWithStore(
                <Meta
                    via="instagram"
                    integrationId={118}
                    source={source}
                    meta={meta}
                />,
            )
            await waitFor(() =>
                expect(container.textContent).toContain(
                    'responded to via Messenger',
                ),
            )
            expect(container.querySelector('a')?.href).toBe(
                `${window.location.href}3312`,
            )
        })
    })

    describe('twitter', () => {
        it.each([
            TicketMessageSourceType.TwitterTweet,
            TicketMessageSourceType.TwitterMentionTweet,
        ])(
            'should display "go to tweet" link',
            (type: TicketMessageSourceType) => {
                const fromUsername = 'gorgiasio'
                const tweetId = '1399880580741935107'
                const tweetPermalink = `https://twitter.com/${fromUsername}/status/${tweetId}`
                const source = {
                    from: { name: fromUsername, address: '12345' },
                    to: [{ name: fromUsername, address: '12345' }],
                    extra: {
                        conversation_id: tweetId,
                    },
                    type: type,
                }

                const { container } = renderWithStore(
                    <Meta
                        via={TicketChannel.Twitter}
                        integrationId={118}
                        source={source}
                    />,
                )

                expect(container.textContent).toBe('go to tweet')
                expect(container.querySelector('a')?.href).toBe(tweetPermalink)
            },
        )

        it('should display "replying to @twitter_handle - go to tweet" link', () => {
            const fromUsername = 'SmsBump'
            const toUsername = 'gorgiasio'
            const tweetId = '1400472973371445249'
            const tweetPermalink = `https://twitter.com/${fromUsername}/status/${tweetId}`
            const toProfileLink = `https://twitter.com/${toUsername}`
            const source = {
                from: { name: fromUsername, address: '12346' },
                to: [{ name: toUsername, address: '12345' }],
                extra: {
                    parent_id: '1399880580741935107',
                    conversation_id: '1399880580741935107',
                },
                type: TicketMessageSourceType.TwitterTweet,
            }

            const { container } = renderWithStore(
                <Meta
                    externalId={tweetId}
                    via={TicketChannel.Twitter}
                    integrationId={118}
                    source={source}
                />,
            )

            expect(container.textContent).toBe(
                `replying to @${toUsername} - go to tweet`,
            )

            const links = Array.from(container.querySelectorAll('a'))

            expect(links[0].href).toEqual(toProfileLink)
            expect(links[1].href).toEqual(tweetPermalink)
        })

        it('should display "retweeting @twitter_handle - go to tweet" link', () => {
            const fromUsername = 'SmsBump'
            const toUsername = 'gorgiasio'
            const tweetId = '1400472973371445249'
            const tweetPermalink = `https://twitter.com/${fromUsername}/status/${tweetId}`
            const toProfileLink = `https://twitter.com/${toUsername}`
            const source = {
                from: { name: fromUsername, address: '12346' },
                to: [{ name: toUsername, address: '12345' }],
                extra: {
                    parent_id: '1399880580741935107',
                    conversation_id: '1399880580741935107',
                },
                type: TicketMessageSourceType.TwitterQuotedTweet,
            }
            const meta = {
                quoted_tweet: {
                    id: '1435008444520615940',
                    text: 'pictures &lt;3 https://t.co/FcqJwG9tbn',
                    user: {
                        id: '12345',
                        name: 'Gorgias Inc.',
                        username: 'gorgiasio',
                    },
                    attachments: [],
                },
            }

            const { container } = renderWithStore(
                <Meta
                    externalId={tweetId}
                    via={TicketChannel.Twitter}
                    integrationId={118}
                    source={source}
                    meta={meta}
                />,
            )

            expect(container.textContent).toBe(
                `retweeting @${toUsername} - go to tweet`,
            )

            const links = Array.from(container.querySelectorAll('a'))

            expect(links[0].href).toEqual(toProfileLink)
            expect(links[1].href).toEqual(tweetPermalink)
        })
    })

    describe('live-chat-message', () => {
        it('should add a `from https://...` with because the message was sent via live chat', () => {
            const { container } = renderWithStore(
                <Meta
                    messageId="some-id"
                    via="something"
                    integrationId={118}
                    meta={{
                        current_page: 'https://gorgias.com/best-helpdesk-ever/',
                    }}
                />,
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('chat-contact-form', () => {
        it('should add a `via contact form from https://...` because the message was sent via chat contact form', () => {
            const { container } = renderWithStore(
                <Meta
                    messageId="some-id"
                    via="something"
                    integrationId={118}
                    source={{
                        type: TicketMessageSourceType.ChatContactForm,
                        to: [{ address: 'someAddress', name: 'someName' }],
                    }}
                    meta={{
                        current_page: 'https://gorgias.com/best-helpdesk-ever/',
                    }}
                />,
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should add a `via contact form` because the message was sent via chat contact form (but no current_url metadata)', () => {
            const { container } = renderWithStore(
                <Meta
                    messageId="some-id"
                    via="something"
                    integrationId={118}
                    source={{
                        type: TicketMessageSourceType.ChatContactForm,
                        to: [{ address: 'someAddress', name: 'someName' }],
                    }}
                    meta={{
                        current_page: undefined,
                    }}
                />,
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should add sms deflection details', () => {
            const { getByText } = renderWithStore(
                <Meta
                    messageId="some-id"
                    via="something"
                    integrationId={118}
                    source={{
                        type: TicketMessageSourceType.Sms,
                        to: [{ address: 'someAddress', name: 'someName' }],
                    }}
                    meta={{
                        sms_deflection:
                            'sent via: Fake phone integration Menu Option 123',
                    }}
                />,
            )
            expect(
                getByText('sent via: Fake phone integration Menu Option 123'),
            ).toBeInTheDocument()
        })
    })
})
