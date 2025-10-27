import { render, screen } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { AutomateUpgradeBadge } from '../AutomateUpgradeBadge'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')

describe('AutomateUpgradeBadge', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    it('should not render when hasAutomate is true and no integrations', () => {
        ;(useStoreIntegrations as jest.Mock).mockReturnValue([])

        const { container } = render(<AutomateUpgradeBadge />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render badge when hasAutomate is false', () => {
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        ;(useStoreIntegrations as jest.Mock).mockReturnValue([])

        render(<AutomateUpgradeBadge />)
        expect(screen.getByText('UPGRADE')).toBeInTheDocument()
        expect(screen.getByText('auto_awesome')).toBeInTheDocument()
    })

    it('should render badge when has integrations', () => {
        ;(useStoreIntegrations as jest.Mock).mockReturnValue([{ id: 1 }])

        render(<AutomateUpgradeBadge />)
        expect(screen.getByText('UPGRADE')).toBeInTheDocument()
        expect(screen.getByText('auto_awesome')).toBeInTheDocument()
    })
})
