import { render, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'

import '@testing-library/jest-dom/extend-expect'

import { StaticRouter } from 'react-router-dom'

import { GUIDANCE } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

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
        mockFlags({})

        render(
            <StaticRouter location="/app/">
                <GuidanceBreadcrumbs {...defaultProps} />
            </StaticRouter>,
        )

        const rootBreadcrumb = screen.getByText(GUIDANCE)
        expect(rootBreadcrumb).toBeInTheDocument()
        expect(rootBreadcrumb.closest('a')).toHaveAttribute('to', '/guidance')

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    })
})
