import { fireEvent, screen } from '@testing-library/react'

import { render } from '@repo/testing'

import {
    useGetHelpCenterArticle,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'
import type { ArticleWithLocalTranslationAndRating } from 'models/helpCenter/types'

import { SkillConfirmationPreview } from './SkillConfirmationPreview'

const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))

// Mock the project-local query layer one step below the convenience hooks, so
// the two-step help-center lookup + raw→GuidanceArticle mapping run for real
// (same seam as GuidanceConfirmationPreview.spec.tsx).
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

const baseArticleApi = {
    id: 2002,
    template_key: null,
    created_datetime: '2025-12-01T00:00:00.000Z',
    origin: 'guidance',
    translation: {
        title: 'Track an order',
        content: '<p>Body</p>',
        locale: 'en-US',
        visibility_status: 'PUBLIC',
        updated_datetime: '2025-12-20T00:00:00.000Z',
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

const payload = {
    type: 'skill' as const,
    id: 2002,
    shopName: 'demo-store',
    shopType: 'shopify',
}

describe('SkillConfirmationPreview', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the fetched title plus the approve and reject buttons', () => {
        setHelpCenter(true)
        setArticle(baseArticleApi)

        render(
            <SkillConfirmationPreview
                payload={payload}
                onApprove={jest.fn()}
                onReject={jest.fn()}
                approveLabel="Publish"
            />,
        )

        expect(screen.getByText('Track an order')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Publish' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Reject' }),
        ).toBeInTheDocument()
    })

    it('fires onApprove and onReject when the buttons are clicked', () => {
        setHelpCenter(true)
        setArticle(baseArticleApi)
        const onApprove = jest.fn()
        const onReject = jest.fn()

        render(
            <SkillConfirmationPreview
                payload={payload}
                onApprove={onApprove}
                onReject={onReject}
                approveLabel="Publish"
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        expect(onApprove).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
        expect(onReject).toHaveBeenCalledTimes(1)
    })

    it('navigates to the skill route when Preview is clicked', () => {
        setHelpCenter(true)
        setArticle(baseArticleApi)

        render(
            <SkillConfirmationPreview
                payload={payload}
                onApprove={jest.fn()}
                onReject={jest.fn()}
                approveLabel="Publish"
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/demo-store/skills/2002',
        )
    })

    it('falls back to the id title and keeps both buttons while loading', () => {
        setHelpCenter(false) // help-center unresolved => loading
        setArticle(undefined)

        render(
            <SkillConfirmationPreview
                payload={payload}
                onApprove={jest.fn()}
                onReject={jest.fn()}
                approveLabel="Publish"
            />,
        )

        expect(screen.getByText('Skill #2002')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Publish' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Reject' }),
        ).toBeInTheDocument()
    })

    it('falls back to the id title and keeps both buttons on fetch error', () => {
        setHelpCenter(true)
        setArticle(undefined, { isError: true })

        render(
            <SkillConfirmationPreview
                payload={payload}
                onApprove={jest.fn()}
                onReject={jest.fn()}
                approveLabel="Publish"
            />,
        )

        expect(screen.getByText('Skill #2002')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Publish' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Reject' }),
        ).toBeInTheDocument()
    })
})
