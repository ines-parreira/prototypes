import {render, screen} from '@testing-library/react'
import React from 'react'

import {useIsAICopyAssistantEnabled} from 'pages/convert/common/hooks/useIsAICopyAssistantEnabled'

import {AICopyAssistant} from '../AICopyAssistant'

jest.mock('pages/convert/common/hooks/useIsAICopyAssistantEnabled')

describe('AICopyAssistant', () => {
    it('should render AICopyAssistant when the flag is enabled', () => {
        ;(useIsAICopyAssistantEnabled as jest.Mock).mockReturnValue(true)

        render(<AICopyAssistant />)

        expect(screen.getByText('Assistant placeholder')).toBeInTheDocument()
    })

    it('should not render AICopyAssistant when the flag is disabled', () => {
        ;(useIsAICopyAssistantEnabled as jest.Mock).mockReturnValue(false)

        render(<AICopyAssistant />)

        expect(
            screen.queryByText('Assistant placeholder')
        ).not.toBeInTheDocument()
    })
})
