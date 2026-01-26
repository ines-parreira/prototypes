import React from 'react'

import { render, screen } from '@testing-library/react'

import { AiAgentToneOfVoice } from './AiAgentToneOfVoice'

jest.mock('./components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({ children, shopName, title }: any) => (
        <div data-testid="ai-agent-layout">
            <div data-testid="shop-name">{shopName}</div>
            <div data-testid="title">{title}</div>
            <div data-testid="children">{children}</div>
        </div>
    ),
}))

describe('AiAgentToneOfVoice', () => {
    it('should render children content', () => {
        render(<AiAgentToneOfVoice shopName="test-shop" />)

        expect(screen.getByTestId('children')).toHaveTextContent(
            'AiAgentToneOfVoice',
        )
    })
})
