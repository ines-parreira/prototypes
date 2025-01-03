import {render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import '@testing-library/jest-dom/extend-expect'
import {StaticRouter} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {AI_AGENT, GUIDANCE} from 'pages/aiAgent/constants'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {GuidanceBreadcrumbs} from './GuidanceBreadcrumbs'

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

    describe.each([
        {flag: true, text: GUIDANCE, rootPath: '/guidance'},
        {flag: false, text: AI_AGENT, rootPath: '/main'},
    ])(
        'with feature flag conv-ai-standalone-menu = $flag',
        ({flag, text, rootPath}) => {
            test('renders the component', () => {
                mockFlags({
                    [FeatureFlagKey.ConvAiStandaloneMenu]: flag,
                })

                render(
                    <StaticRouter location="/app/">
                        <GuidanceBreadcrumbs {...defaultProps} />
                    </StaticRouter>
                )

                const rootBreadcrumb = screen.getByText(text)
                expect(rootBreadcrumb).toBeInTheDocument()
                expect(rootBreadcrumb.closest('a')).toHaveAttribute(
                    'to',
                    rootPath
                )

                expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
            })
        }
    )
})
