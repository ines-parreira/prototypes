import type { IntentResponseDto } from '../types'
import { transformToArticleFirstView } from './transformToArticleFirstView'

describe('transformToArticleFirstView', () => {
    it('should transform intent-first data to article-first view', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Track Your Order',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result).toEqual([
            {
                id: 1,
                title: 'Track Your Order',
                status: 'enabled',
                intents: [
                    {
                        name: 'order::status',
                        formattedName: 'Order / Status',
                    },
                ],
                publishedVersion: {
                    locale: 'en',
                    article_translation_version_id: 100,
                },
            },
        ])
    })

    it('should group multiple intents linking to the same article', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Order Information',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
            {
                name: 'order::tracking' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Order Information',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result).toHaveLength(1)
        expect(result[0].intents).toHaveLength(2)
        expect(result[0].intents).toEqual([
            { name: 'order::status', formattedName: 'Order / Status' },
            { name: 'order::tracking', formattedName: 'Order / Tracking' },
        ])
    })

    it('should handle both published and draft versions of the same article', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Order Tracking',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                    {
                        id: 1,
                        title: 'Order Tracking',
                        locale: 'en',
                        article_translation_version_id: 101,
                        status: 'draft',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result).toHaveLength(1)
        expect(result[0].publishedVersion).toEqual({
            locale: 'en',
            article_translation_version_id: 100,
        })
        expect(result[0].draftVersion).toEqual({
            locale: 'en',
            article_translation_version_id: 101,
        })
    })

    it('should map PUBLIC visibility status to enabled', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Test Article',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result[0].status).toBe('enabled')
    })

    it('should map non-PUBLIC visibility status to disabled', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Test Article',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'UNLISTED',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result[0].status).toBe('disabled')
    })

    it('should not duplicate intents when same intent appears multiple times for same article', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Order Info',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                    {
                        id: 1,
                        title: 'Order Info',
                        locale: 'en',
                        article_translation_version_id: 101,
                        status: 'draft',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result).toHaveLength(1)
        expect(result[0].intents).toHaveLength(1)
    })

    it('should return empty array when no intents provided', () => {
        const result = transformToArticleFirstView([])

        expect(result).toEqual([])
    })

    it('should format intent names correctly', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'account::password reset' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Reset Password',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result[0].intents[0].formattedName).toBe(
            'Account / Password Reset',
        )
    })

    it('should handle multiple articles from different intents', () => {
        const intents: IntentResponseDto[] = [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Order Status',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
            {
                name: 'shipping::info' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 2,
                        title: 'Shipping Information',
                        locale: 'en',
                        article_translation_version_id: 200,
                        status: 'published',
                        template_key: 'standard',
                        visibility_status: 'PUBLIC',
                    },
                ],
            },
        ]

        const result = transformToArticleFirstView(intents)

        expect(result).toHaveLength(2)
        expect(result[0].id).toBe(1)
        expect(result[1].id).toBe(2)
    })
})
