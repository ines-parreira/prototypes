import { fireEvent, render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

import CreateKnowledgeSection from '../CreateKnowledgeSection'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            guidanceTemplates: '/mock/guidance-templates',
        },
    }),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)
const useKnowledgeSourceSideBarMocked = useKnowledgeSourceSideBar as jest.Mock

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: jest.fn(),
}))
const mockUseAbilityChecker = jest.mocked(
    jest.requireMock('pages/settings/helpCenter/hooks/useHelpCenterApi')
        .useAbilityChecker,
)

const shopName = 'MyShop'
const helpCenterId = 123

const mockIsPassingRulesCheck = jest.fn()

describe('CreateKnowledgeSection', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            openPreview: jest.fn(),
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })
        mockUseAbilityChecker.mockReturnValue({
            isPassingRulesCheck: mockIsPassingRulesCheck.mockReturnValue(true),
        })
    })

    it('should render the component and toggles dropdown', () => {
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        expect(
            screen.getByText(
                /Create new knowledge to be used in similar requests/i,
            ),
        ).toBeInTheDocument()

        expect(screen.queryByText('Create Guidance')).not.toBeInTheDocument()

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
        expect(
            screen.getByText('Create Help Center article'),
        ).toBeInTheDocument()
    })

    it('should contain correct links in dropdown items', () => {
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance').closest('a')
        const articleLink = screen
            .getByText('Create Help Center article')
            .closest('a')

        expect(guidanceLink).toHaveAttribute('href', '/mock/guidance-templates')
        expect(guidanceLink).toHaveAttribute('target', '_blank')
        expect(articleLink).toHaveAttribute(
            'href',
            '/app/settings/help-center/123/articles',
        )
        expect(articleLink).toHaveAttribute('rel', 'noreferrer')
    })

    it('should open dropdown and closes it after clicking guidance link', () => {
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance')
        expect(guidanceLink).toBeInTheDocument()

        fireEvent.click(guidanceLink)

        expect(screen.queryByText('Create Guidance')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Create Help Center article'),
        ).not.toBeInTheDocument()
    })

    it('should call openCreate on create guidance click when enableKnowledgeManagementFromTicketView is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance')
        if (guidanceLink) {
            fireEvent.click(guidanceLink)
        }

        expect(guidanceLink.closest('a')).not.toHaveAttribute(
            'href',
            '/mock/guidance-templates',
        )

        expect(
            useKnowledgeSourceSideBarMocked().openCreate,
        ).toHaveBeenCalledWith(AiAgentKnowledgeResourceTypeEnum.GUIDANCE)
    })

    it('should call openCreate on create article click when enableKnowledgeManagementFromTicketView is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        const articleLink = screen.getByText('Create Help Center article')
        if (articleLink) {
            fireEvent.click(articleLink)
        }

        expect(articleLink.closest('a')).not.toHaveAttribute(
            'href',
            '/app/settings/help-center/123/articles',
        )

        expect(
            useKnowledgeSourceSideBarMocked().openCreate,
        ).toHaveBeenCalledWith(AiAgentKnowledgeResourceTypeEnum.ARTICLE)
    })

    it('should not display article link when the user does not have sufficient permissions', () => {
        mockUseFlag.mockReturnValue(true)
        mockIsPassingRulesCheck.mockReturnValue(false)

        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
        expect(
            screen.queryByText('Create Help Center article'),
        ).not.toBeInTheDocument()
    })
})
