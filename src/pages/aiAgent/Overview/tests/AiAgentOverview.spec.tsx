import {render} from '@testing-library/react'
import React from 'react'

import {AiAgentOverview} from '../AiAgentOverview'

const renderComponent = () => {
    return render(<AiAgentOverview />)
}

describe('AiAgentOverview', () => {
    it('should render', () => {
        const {queryByText} = renderComponent()

        expect(queryByText(/Welcome,.*/)).toBeTruthy()
        expect(queryByText('AI Agent Performance')).toBeTruthy()
        expect(queryByText('Complete AI Agent Setup')).toBeTruthy()
        expect(queryByText('Resources')).toBeTruthy()
    })
})
