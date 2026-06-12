import { screen } from '@testing-library/react'

import { render } from '@repo/testing'

import {
    useGetHelpCenterArticle,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'
import type { ArticleWithLocalTranslationAndRating } from 'models/helpCenter/types'

import { SkillReferenceCard } from './SkillReferenceCard'

// Mock the project-local query layer that wraps the legacy help-center SDK.
// Mocking the queries module (rather than the convenience `useAiAgentHelpCenter`
// and `useGuidanceArticle` hooks above it) keeps the convenience hooks running
// for real, so the two-step lookup + cache fallback + raw→GuidanceArticle
// mapping are all exercised.
jest.mock('models/helpCenter/queries', () => {
    const actual = jest.requireActual('models/helpCenter/queries')
    return {
        ...actual,
        useGetHelpCenterArticle: jest.fn(),
        useGetHelpCenterList: jest.fn(),
    }
})

const mockUseGetHelpCenterArticle =
    useGetHelpCenterArticle as jest.MockedFunction<
        typeof useGetHelpCenterArticle
    >
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.MockedFunction<
    typeof useGetHelpCenterList
>

// Raw API article shape — passes through `mapArticleApiToGuidanceArticle` in
// the real `useGuidanceArticle`. Keep this in sync with the mapper at
// pages/aiAgent/utils/guidance.utils.ts.
const baseArticleApi = {
    id: 12,
    template_key: null,
    created_datetime: '2025-12-01T00:00:00.000Z',
    origin: 'skill',
    translation: {
        title: 'Refund handler',
        content: '<p>Handles refund requests.</p>',
        locale: 'en-US',
        visibility_status: 'PUBLIC',
        updated_datetime: new Date(
            Date.now() - 1000 * 60 * 60 * 2,
        ).toISOString(),
        is_current: true,
        draft_version_id: null,
        published_version_id: 21,
        intents: ['return::request', 'return::status'],
        use_supporting_content: null,
    },
} as unknown as ArticleWithLocalTranslationAndRating

function setHelpCenter() {
    mockUseGetHelpCenterList.mockReturnValue({
        data: {
            data: { data: [{ id: 1, default_locale: 'en-US' }] },
        },
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

describe('SkillReferenceCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the title, an Enabled status, and intent chips', () => {
        setHelpCenter()
        setArticle(baseArticleApi)

        render(
            <SkillReferenceCard articleId={12} shopName="acme" isOpen={true} />,
        )

        expect(screen.getByText('Refund handler')).toBeInTheDocument()
        expect(screen.getByText('Enabled')).toBeInTheDocument()
        expect(
            screen.getByText('Skill').closest('[data-color]'),
        ).toHaveAttribute('data-color', 'purple')
        expect(screen.getByText('Return / Request')).toBeInTheDocument()
        expect(screen.getByText('Return / Status')).toBeInTheDocument()
    })

    it('renders a Disabled status for unlisted skills', () => {
        setHelpCenter()
        setArticle({
            ...baseArticleApi,
            translation: {
                ...baseArticleApi.translation,
                visibility_status: 'UNLISTED',
            },
        } as typeof baseArticleApi)

        render(
            <SkillReferenceCard articleId={12} shopName="acme" isOpen={true} />,
        )

        expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('hides the intents section when none are linked', () => {
        setHelpCenter()
        setArticle({
            ...baseArticleApi,
            translation: { ...baseArticleApi.translation, intents: [] },
        } as typeof baseArticleApi)

        render(
            <SkillReferenceCard articleId={12} shopName="acme" isOpen={true} />,
        )

        expect(screen.queryByText('Intents')).not.toBeInTheDocument()
    })

    it('always renders the skill layout regardless of article origin', () => {
        // We trust the agent's reference type. Even when the underlying
        // article isn't classified as a skill, a `skill` reference renders
        // the skill card.
        setHelpCenter()
        setArticle({
            ...baseArticleApi,
            origin: 'guidance',
        } as unknown as typeof baseArticleApi)

        render(
            <SkillReferenceCard articleId={12} shopName="acme" isOpen={true} />,
        )

        expect(screen.getByText('Skill')).toBeInTheDocument()
        expect(screen.queryByText('Guidance')).not.toBeInTheDocument()
    })

    it('renders an error fallback when the fetch fails', () => {
        setHelpCenter()
        setArticle(undefined, { isError: true })

        render(
            <SkillReferenceCard articleId={12} shopName="acme" isOpen={true} />,
        )

        expect(
            screen.getByText("Couldn't load this skill."),
        ).toBeInTheDocument()
    })
})
