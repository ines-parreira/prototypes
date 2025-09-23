import { render, screen } from '@testing-library/react'

import { Placeholder } from '../placeholder'
import { AIAgentLegacyBridgeProvider } from '../utils/LegacyBridge'

describe('Placeholder', () => {
    it('should render', () => {
        render(
            <AIAgentLegacyBridgeProvider placeholderStoreUpdateFn={vi.fn()}>
                <Placeholder />
            </AIAgentLegacyBridgeProvider>,
        )
        expect(screen.getByText('Placeholder')).toBeInTheDocument()
    })
})
