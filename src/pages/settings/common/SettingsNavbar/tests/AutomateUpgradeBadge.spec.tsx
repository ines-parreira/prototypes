import { render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { AutomateUpgradeBadge } from '../AutomateUpgradeBadge'

jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')

describe('AutomateUpgradeBadge', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when hasAutomate is true and no integrations', () => {
        ;(useAppSelector as jest.Mock).mockReturnValue(true)
        ;(useStoreIntegrations as jest.Mock).mockReturnValue([])

        const { container } = render(<AutomateUpgradeBadge />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render badge when hasAutomate is false', () => {
        ;(useAppSelector as jest.Mock).mockReturnValue(false)
        ;(useStoreIntegrations as jest.Mock).mockReturnValue([])

        render(<AutomateUpgradeBadge />)
        expect(screen.getByText('UPGRADE')).toBeInTheDocument()
        expect(screen.getByText('auto_awesome')).toBeInTheDocument()
    })

    it('should render badge when has integrations', () => {
        ;(useAppSelector as jest.Mock).mockReturnValue(true)
        ;(useStoreIntegrations as jest.Mock).mockReturnValue([{ id: 1 }])

        render(<AutomateUpgradeBadge />)
        expect(screen.getByText('UPGRADE')).toBeInTheDocument()
        expect(screen.getByText('auto_awesome')).toBeInTheDocument()
    })
})
