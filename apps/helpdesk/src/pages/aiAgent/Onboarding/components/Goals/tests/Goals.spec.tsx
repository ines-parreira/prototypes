import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

import Goals from '../Goals'

describe('<Goals />', () => {
    it('renders', () => {
        render(<Goals value={[AiAgentScopes.SALES]} onSelect={jest.fn()} />)

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()
        expect(
            screen.getByText('Boost Sales with a Personal Shopping Assistant'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Automate Support and Boost Sales'),
        ).toBeInTheDocument()
    })

    it('user can select a goal', () => {
        const onSelectMocked = jest.fn()
        render(
            <Goals value={[AiAgentScopes.SALES]} onSelect={onSelectMocked} />,
        )

        fireEvent.click(
            screen.getByText('Boost Sales with a Personal Shopping Assistant'),
        )

        expect(onSelectMocked).toHaveBeenCalledTimes(1)
    })
})
