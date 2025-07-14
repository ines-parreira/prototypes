// Helper function to render component with required props
import React from 'react'

import { render } from '@testing-library/react'

import { ZendeskIntegrationMeta } from 'models/integration/types'
import ImportStatusAlert from 'pages/settings/importZendesk/zendesk/ImportStatusAlert'
import {
    failedImport,
    pendingImport,
    rateLimitedImport,
    successImport,
} from 'pages/settings/importZendesk/zendesk/tests/fixtures'

const renderComponent = (integrationMeta: ZendeskIntegrationMeta) => {
    return render(<ImportStatusAlert integrationMeta={integrationMeta} />)
}

describe('ImportStatusAlert', () => {
    it('displays a loading spinner when the importStatus is Pending', () => {
        const { getByText } = renderComponent(pendingImport.meta)
        expect(getByText('Importing your Zendesk data')).toBeDefined()
        expect(getByText('refresh')).toHaveClass('md-spin')
    })

    it('displays a loading spinner when the importStatus is RateLimitExceededBackoff', () => {
        const { getByText } = renderComponent(rateLimitedImport.meta)
        expect(getByText('Importing your Zendesk data')).toBeDefined()
        expect(getByText('refresh')).toHaveClass('md-spin')
    })

    it('displays success message with active synchronization when continuous import is enabled', () => {
        const { getByText } = renderComponent({
            ...successImport.meta,
            continuous_import_enabled: true,
        })
        expect(
            getByText(
                'Initial import successful, continuous synchronization active.',
            ),
        ).toBeDefined()
    })

    it('displays success message with paused synchronization when continuous import is disabled', () => {
        const { getByText } = renderComponent({
            ...successImport.meta,
            continuous_import_enabled: false,
        })
        expect(
            getByText(
                'Initial import successful, continuous synchronization paused.',
            ),
        ).toBeDefined()
    })

    it('displays error message when importStatus is any error state', () => {
        const { getByText } = renderComponent({
            ...failedImport.meta,
            continuous_import_enabled: false,
            error: 'Something went wrong.',
        })

        expect(getByText('Something went wrong.')).toBeDefined()
    })

    it('displays default error message when no error is provided', () => {
        const { getByText } = renderComponent({
            ...failedImport.meta,
            continuous_import_enabled: false,
            error: '',
        })

        expect(
            getByText('Import failed. Please contact our support.'),
        ).toBeDefined()
    })
})
