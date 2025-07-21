import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import AiAgentScrapedDomainContentHeader from 'pages/aiAgent/AiAgentScrapedDomainContent/AiAgentScrapedDomainContentHeader'
import { HeaderType } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'

const mockStoreDomain = 'test-store.com'
const mockStoreUrl = 'https://test-store.com'
const mockLatestSync = '2024-03-22T10:00:00Z'
const mockTitle = 'Test Title'

const defaultProps = {
    storeDomain: mockStoreDomain,
    storeUrl: mockStoreUrl,
    latestSync: mockLatestSync,
    isFetchLoading: false,
    syncTriggered: false,
    handleOnSync: jest.fn(),
    handleOnCancel: jest.fn(),
    handleTriggerSync: jest.fn(),
    syncStoreDomainStatus: null,
    title: mockTitle,
    pageType: HeaderType.Domain,
}

const setup = (propsOverride = {}) => {
    return render(
        <AiAgentScrapedDomainContentHeader
            {...defaultProps}
            {...propsOverride}
        />,
    )
}

describe('AiAgentScrapedDomainContentHeader', () => {
    it('renders the title correctly', () => {
        setup()
        expect(screen.getByText(mockTitle)).toBeInTheDocument()
    })

    it('renders the store domain with correct link', () => {
        setup()
        const domainLink = screen.getByText(mockStoreDomain)
        expect(domainLink).toBeInTheDocument()
        expect(domainLink.closest('a')).toHaveAttribute('href', mockStoreUrl)
        expect(domainLink.closest('a')).toHaveAttribute('target', '_blank')
        expect(domainLink.closest('a')).toHaveAttribute(
            'rel',
            'noopener noreferrer',
        )
    })

    describe('getTitleIcon', () => {
        it('renders language icon for Domain type', () => {
            setup({ pageType: HeaderType.Domain })
            const icon = screen.getByText('language')
            expect(icon).toBeInTheDocument()
        })

        it('renders attach_file icon for ExternalDocument type', () => {
            setup({ pageType: HeaderType.ExternalDocument })
            const icon = screen.getByText('attach_file')
            expect(icon).toBeInTheDocument()
        })

        it('renders link icon for URL type', () => {
            setup({ pageType: HeaderType.URL })
            const icon = screen.getByText('link')
            expect(icon).toBeInTheDocument()
        })

        it('renders language icon as default for unknown type', () => {
            setup({ pageType: 'unknown' as HeaderType })
            const icon = screen.getByText('language')
            expect(icon).toBeInTheDocument()
        })
    })

    it('renders sync date when latestSync is provided', () => {
        setup()
        expect(screen.getByText(/Last synced/)).toBeInTheDocument()
    })

    it('does not render sync date when latestSync is not provided', () => {
        setup({ latestSync: undefined })
        expect(screen.queryByText(/Last synced/)).not.toBeInTheDocument()
    })

    it('calls handleTriggerSync when sync button is clicked', () => {
        setup()
        const syncButton = screen.getByText('Sync')
        fireEvent.click(syncButton)
        expect(defaultProps.handleTriggerSync).toHaveBeenCalled()
    })

    it('renders sync confirmation modal when syncTriggered is true', () => {
        setup({ syncTriggered: true })
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render sync confirmation modal when syncTriggered is false', () => {
        setup({ syncTriggered: false })
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the sync button when pageType is Domain', () => {
        setup({ pageType: HeaderType.Domain })
        expect(screen.getByText('Sync')).toBeInTheDocument()
    })

    it('renders the sync button when pageType is URL', () => {
        setup({ pageType: HeaderType.URL })
        expect(screen.getByText('Sync')).toBeInTheDocument()
    })

    it('does not render the sync button when pageType is ExternalDocument', () => {
        setup({ pageType: HeaderType.ExternalDocument })
        expect(screen.queryByText('Sync')).not.toBeInTheDocument()
    })
})
