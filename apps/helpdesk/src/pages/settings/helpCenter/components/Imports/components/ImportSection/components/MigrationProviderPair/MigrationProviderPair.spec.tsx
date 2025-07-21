import React from 'react'

import { render } from '@testing-library/react'

import { migrationProviders } from '../../fixtures/migration-providers'
import MigrationProviderPair from './MigrationProviderPair'

const firstProvider = migrationProviders[0]
const secondProvider = migrationProviders[2]

describe('<MigrationProviderPair />', () => {
    it('should match snapshot', () => {
        const { container } = render(
            <MigrationProviderPair
                left={{
                    alt: firstProvider.title || '',
                    src: firstProvider.logo_url || '',
                }}
                right={{
                    alt: secondProvider.title || '',
                    src: secondProvider.logo_url || '',
                }}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
