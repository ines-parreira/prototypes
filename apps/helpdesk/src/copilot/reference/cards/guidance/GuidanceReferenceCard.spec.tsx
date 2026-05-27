import { screen } from '@testing-library/react'

import { render } from '@repo/testing'

import {
    useGetHelpCenterArticle,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'
import type { ArticleWithLocalTranslationAndRating } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'

import { GuidanceReferenceCard } from './GuidanceReferenceCard'

// Mock the project-local query layer that wraps the legacy help-center SDK
// (one step below the `useAiAgentHelpCenter` / `useGuidanceArticle`
// convenience hooks). This keeps the convenience hooks running for real, so
// the two-step lookup, the `enabled` gating, and the raw→GuidanceArticle
// mapping are all exercised end-to-end.
jest.mock('models/helpCenter/queries', () => {
    const actual = jest.requireActual('models/helpCenter/queries')
    return {
        ...actual,
        useGetHelpCenterArticle: jest.fn(),
        useGetHelpCenterList: jest.fn(),
    }
})

// `useGetGuidancesAvailableActions` wraps `useQuery` against the workflows
// OpenAPI client. There's no clean lower seam available without mounting the
// async client factory, so we keep this mocked at the hook level.
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)

const mockUseGetHelpCenterArticle =
    useGetHelpCenterArticle as jest.MockedFunction<
        typeof useGetHelpCenterArticle
    >
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.MockedFunction<
    typeof useGetHelpCenterList
>
const mockUseGetGuidancesAvailableActions =
    useGetGuidancesAvailableActions as jest.MockedFunction<
        typeof useGetGuidancesAvailableActions
    >

// Raw API article shape — passes through `mapArticleApiToGuidanceArticle` in
// the real `useGuidanceArticle`. Keep this in sync with the mapper at
// pages/aiAgent/utils/guidance.utils.ts.
const baseArticleApi = {
    id: 7,
    template_key: null,
    created_datetime: '2025-12-01T00:00:00.000Z',
    origin: 'guidance',
    translation: {
        title: 'Refund policy guidance',
        content: '<p>Refund window is <strong>30 days</strong>.</p>',
        locale: 'en-US',
        visibility_status: 'PUBLIC',
        updated_datetime: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 3,
        ).toISOString(),
        is_current: true,
        draft_version_id: null,
        published_version_id: 11,
        intents: [],
        use_supporting_content: null,
    },
} as unknown as ArticleWithLocalTranslationAndRating

function setHelpCenter(present = true) {
    mockUseGetHelpCenterList.mockReturnValue({
        data: present
            ? { data: { data: [{ id: 1, default_locale: 'en-US' }] } }
            : { data: { data: [] } },
        isLoading: false,
        isFetching: false,
        isError: false,
    } as unknown as ReturnType<typeof useGetHelpCenterList>)
}

function setArticle(
    article: typeof baseArticleApi | undefined,
    overrides: Partial<ReturnType<typeof useGetHelpCenterArticle>> = {},
) {
    mockUseGetHelpCenterArticle.mockReturnValue({
        data: article,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: jest.fn(),
        ...overrides,
    } as unknown as ReturnType<typeof useGetHelpCenterArticle>)
}

describe('GuidanceReferenceCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
            rawActions: [],
        } as unknown as ReturnType<typeof useGetGuidancesAvailableActions>)
    })

    it('propagates the popover-closed state down through the data hooks', () => {
        setHelpCenter(true)
        setArticle(undefined)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={false}
            />,
        )

        // Help-center list query is gated `enabled: false` while closed.
        expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
            expect.objectContaining({ shop_name: 'acme' }),
            expect.objectContaining({ enabled: false }),
        )
        // Article fetch is also disabled (the article-id and help-center-id
        // are passed positionally, so we check the override at index 4).
        const articleCall = mockUseGetHelpCenterArticle.mock.calls[0]
        expect(articleCall?.[4]).toEqual(
            expect.objectContaining({ enabled: false }),
        )
        // Actions are also gated.
        expect(mockUseGetGuidancesAvailableActions).toHaveBeenCalledWith(
            'acme',
            'shopify',
            false,
        )
    })

    it('renders action placeholders in the body via the guidance editor parser', () => {
        setHelpCenter(true)
        setArticle({
            ...baseArticleApi,
            translation: {
                ...baseArticleApi.translation,
                content:
                    '<p>If returning, $$$refund-action$$$ and notify the customer.</p>',
            },
        } as typeof baseArticleApi)
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [
                {
                    name: 'Issue full refund',
                    value: 'refund-action',
                } as never,
            ],
            rawActions: [],
        } as unknown as ReturnType<typeof useGetGuidancesAvailableActions>)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        // The action placeholder renders as an inline pill: "Use action:" prefix
        // and the action name in separate spans.
        expect(screen.getByText('Use action:')).toBeInTheDocument()
        expect(screen.getByText('Issue full refund')).toBeInTheDocument()
    })

    it('renders variable placeholders as inline pills', () => {
        setHelpCenter(true)
        setArticle({
            ...baseArticleApi,
            translation: {
                ...baseArticleApi.translation,
                content: '<p>Greet &&&customer.name&&& politely.</p>',
            },
        } as typeof baseArticleApi)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        // Label is `${Capitalized category}: ${variable name}` — matches the
        // editor's GuidanceVariableTag.
        expect(screen.getByText('Customer: Full name')).toBeInTheDocument()
    })

    it('renders a skeleton while loading', () => {
        setHelpCenter(false)
        setArticle(undefined)

        const { container } = render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        // Skeleton has no semantic role — check that no title text rendered.
        expect(
            screen.queryByText(/refund policy guidance/i),
        ).not.toBeInTheDocument()
        // And the icon/label header is still there.
        expect(container.textContent).toMatch(/guidance/i)
    })

    it('renders the title, published status, body, and relative timestamp', () => {
        setHelpCenter(true)
        setArticle(baseArticleApi)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Refund policy guidance')).toBeInTheDocument()
        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(
            screen.getByText(/refund window is 30 days/i),
        ).toBeInTheDocument()
    })

    it('always renders the guidance layout regardless of article origin', () => {
        // We trust the agent's reference type. Even when the underlying
        // article is classified as a skill, a `guidance` reference renders
        // the guidance card.
        setHelpCenter(true)
        setArticle({
            ...baseArticleApi,
            origin: 'skill',
            translation: {
                ...baseArticleApi.translation,
                intents: [{ name: 'foo' }, { name: 'bar' }],
            },
        } as unknown as typeof baseArticleApi)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Guidance')).toBeInTheDocument()
        expect(screen.queryByText('Skill')).not.toBeInTheDocument()
        // Intent count still surfaces as a secondary row when present.
        expect(screen.getByText('2 linked intents')).toBeInTheDocument()
    })

    it('shows a "Draft changes" tag when isCurrent is false and a published version exists', () => {
        setHelpCenter(true)
        setArticle({
            ...baseArticleApi,
            translation: {
                ...baseArticleApi.translation,
                is_current: false,
                draft_version_id: 12,
                published_version_id: 11,
            },
        } as typeof baseArticleApi)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Draft changes')).toBeInTheDocument()
    })

    it('shows "Published" when isCurrent is true even if draftVersionId is set', () => {
        setHelpCenter(true)
        setArticle({
            ...baseArticleApi,
            translation: {
                ...baseArticleApi.translation,
                is_current: true,
                draft_version_id: 12,
                published_version_id: 11,
            },
        } as typeof baseArticleApi)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(screen.queryByText('Draft changes')).not.toBeInTheDocument()
    })

    it('shows a "Draft" tag when the article has never been published', () => {
        setHelpCenter(true)
        setArticle({
            ...baseArticleApi,
            translation: {
                ...baseArticleApi.translation,
                is_current: false,
                published_version_id: null,
                draft_version_id: 12,
            },
        } as typeof baseArticleApi)

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders an error fallback when the fetch fails', () => {
        setHelpCenter(true)
        setArticle(undefined, { isError: true })

        render(
            <GuidanceReferenceCard
                articleId={7}
                shopName="acme"
                shopType="shopify"
                isOpen={true}
            />,
        )

        expect(
            screen.getByText("Couldn't load this guidance."),
        ).toBeInTheDocument()
    })
})
