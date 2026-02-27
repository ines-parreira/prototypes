import { fireEvent, render, screen } from '@testing-library/react'

import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

import CreateKnowledgeSection from '../CreateKnowledgeSection'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'

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

const helpCenterId = 123

const mockIsPassingRulesCheck = jest.fn()

describe('CreateKnowledgeSection', () => {
    const defaultProps = {
        helpCenterId: helpCenterId,
        onKnowledgeResourceCreateClick: jest.fn(),
    }

    beforeEach(() => {
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
        render(<CreateKnowledgeSection {...defaultProps} />)

        expect(
            screen.getByText(
                /Create new knowledge to be used in similar requests/i,
            ),
        ).toBeInTheDocument()

        expect(screen.queryByText('Create Guidance')).not.toBeInTheDocument()

        const button = screen.getByRole('button', { name: /Create content/i })
        fireEvent.click(button)

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
        expect(
            screen.getByText('Create Help Center article'),
        ).toBeInTheDocument()
    })

    it('should open dropdown and closes it after clicking guidance link', () => {
        render(<CreateKnowledgeSection {...defaultProps} />)

        const button = screen.getByRole('button', { name: /Create content/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance')
        expect(guidanceLink).toBeInTheDocument()

        fireEvent.click(guidanceLink)

        expect(screen.queryByText('Create Guidance')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Create Help Center article'),
        ).not.toBeInTheDocument()
    })

    it('should call openCreate on create guidance click', () => {
        const mockOnKnowledgeResourceCreateClick = jest.fn()
        render(
            <CreateKnowledgeSection
                {...defaultProps}
                onKnowledgeResourceCreateClick={
                    mockOnKnowledgeResourceCreateClick
                }
            />,
        )

        const button = screen.getByRole('button', { name: /Create content/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance')
        if (guidanceLink) {
            fireEvent.click(guidanceLink)
        }

        expect(guidanceLink.closest('a')).not.toHaveAttribute('href')

        expect(
            useKnowledgeSourceSideBarMocked().openCreate,
        ).toHaveBeenCalledWith(AiAgentKnowledgeResourceTypeEnum.GUIDANCE)
        expect(mockOnKnowledgeResourceCreateClick).toHaveBeenCalledWith(
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            '123',
        )
    })

    it('should call openCreate on create article click', () => {
        const mockOnKnowledgeResourceCreateClick = jest.fn()
        render(
            <CreateKnowledgeSection
                {...defaultProps}
                onKnowledgeResourceCreateClick={
                    mockOnKnowledgeResourceCreateClick
                }
            />,
        )

        const button = screen.getByRole('button', { name: /Create content/i })
        fireEvent.click(button)

        const articleLink = screen.getByText('Create Help Center article')
        if (articleLink) {
            fireEvent.click(articleLink)
        }

        expect(articleLink.closest('a')).not.toHaveAttribute('href')

        expect(
            useKnowledgeSourceSideBarMocked().openCreate,
        ).toHaveBeenCalledWith(AiAgentKnowledgeResourceTypeEnum.ARTICLE)
        expect(mockOnKnowledgeResourceCreateClick).toHaveBeenCalledWith(
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            '123',
        )
    })

    it('should not display article link when the user does not have sufficient permissions', () => {
        mockIsPassingRulesCheck.mockReturnValue(false)

        render(<CreateKnowledgeSection {...defaultProps} />)

        const button = screen.getByRole('button', { name: /Create content/i })
        fireEvent.click(button)

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
        expect(
            screen.queryByText('Create Help Center article'),
        ).not.toBeInTheDocument()
    })

    describe('when helpCenterId is set', () => {
        it('should call onKnowledgeResourceCreateClick with stringified helpCenterId when helpCenterId is set', () => {
            const mockOnKnowledgeResourceCreateClick = jest.fn()
            render(
                <CreateKnowledgeSection
                    helpCenterId={456}
                    onKnowledgeResourceCreateClick={
                        mockOnKnowledgeResourceCreateClick
                    }
                />,
            )

            const button = screen.getByRole('button', {
                name: /Create content/i,
            })
            fireEvent.click(button)

            const guidanceLink = screen.getByText('Create Guidance')
            fireEvent.click(guidanceLink)

            expect(mockOnKnowledgeResourceCreateClick).toHaveBeenCalledWith(
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                '456',
            )
        })
    })
})
