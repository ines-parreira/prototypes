import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { noop } from 'lodash'

import { migrationProviders } from '../../fixtures/migration-providers'
import ProviderSelectModal from './ProviderSelectModal'

const providerToSelect = migrationProviders[0]

describe('<ProviderSelectModal />', () => {
    it('should render providers list', () => {
        render(
            <ProviderSelectModal
                providers={migrationProviders}
                isOpen
                onClose={noop}
                onProviderSelect={noop}
            />,
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(
            screen.getByText('Select your current product'),
        ).toBeInTheDocument()
        expect(screen.getByText('HelpDocs')).toBeInTheDocument()
        expect(screen.getByText('Zendesk')).toBeInTheDocument()
        expect(screen.getByText('Intercom')).toBeInTheDocument()
        expect(screen.getByText('Re:amaze')).toBeInTheDocument()
    })

    it('should handle provider select', () => {
        const closeHandler = jest.fn()
        const providerSelectHandler = jest.fn()
        render(
            <ProviderSelectModal
                providers={migrationProviders}
                isOpen
                onClose={closeHandler}
                onProviderSelect={providerSelectHandler}
            />,
        )

        fireEvent.click(screen.getByText(providerToSelect.title || ''))

        /**
         * After the provider is selcted the close handler should be called
         */
        expect(closeHandler).toBeCalled()

        expect(providerSelectHandler).toBeCalledWith(providerToSelect.type)
    })
})
