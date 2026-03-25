import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { GUIDANCE } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { GuidanceBreadcrumbs } from './GuidanceBreadcrumbs'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')

const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

describe('GuidanceBreadcrumbs', () => {
    const defaultProps = {
        shopName: 'Test Shop',
        title: 'Test Title',
    }

    beforeEach(() => {
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                guidance: '/guidance',
                main: '/main',
            },
        })
    })

    test('renders the component', () => {
        mockFeatureFlags({})

        render(
            <MemoryRouter>
                <GuidanceBreadcrumbs {...defaultProps} />
            </MemoryRouter>,
        )

        const rootBreadcrumb = screen.getByText(GUIDANCE)
        expect(rootBreadcrumb).toBeInTheDocument()
        expect(rootBreadcrumb.closest('a')).toHaveAttribute('href', '/guidance')

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    })
})
