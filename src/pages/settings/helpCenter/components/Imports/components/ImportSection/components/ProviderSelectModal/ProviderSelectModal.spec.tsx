import {fireEvent, render, screen} from '@testing-library/react'
import {noop} from 'lodash'
import React from 'react'

import {migrationProviders} from '../../fixtures/migration-providers'
import ProviderSelectModal from './ProviderSelectModal'

const providerToSelect = migrationProviders[0]

describe('<ProviderSelectModal />', () => {
    it('should match snapshot', () => {
        const {baseElement} = render(
            <ProviderSelectModal
                providers={migrationProviders}
                isOpen
                onClose={noop}
                onProviderSelect={noop}
            />
        )

        expect(baseElement).toMatchSnapshot()
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
            />
        )

        fireEvent.click(screen.getByText(providerToSelect.title || ''))

        /**
         * After the provider is selcted the close handler should be called
         */
        expect(closeHandler).toBeCalled()

        expect(providerSelectHandler).toBeCalledWith(providerToSelect.type)
    })
})
