import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { noop } from 'lodash'

import { migrationProviders } from '../../fixtures/migration-providers'
import ProviderInfo from './ProviderInfo'

const provider = migrationProviders[0]

describe('<ProviderInfo />', () => {
    it('should match snapshot', () => {
        const { container } = render(
            <ProviderInfo provider={provider} onClick={noop} />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle click', () => {
        const clickHandler = jest.fn()
        render(<ProviderInfo provider={provider} onClick={clickHandler} />)
        fireEvent.click(screen.getByText(provider.title || ''))
        expect(clickHandler).toBeCalled()
    })
})
