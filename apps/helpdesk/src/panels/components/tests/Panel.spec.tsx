import React from 'react'

import { render } from '@testing-library/react'

import Panel from '../Panel'

describe('Panel', () => {
    it('should render a panel and its contents', () => {
        const { getByText } = render(
            <Panel>
                <p>Hello world</p>
            </Panel>,
        )

        expect(getByText('Hello world')).toBeInTheDocument()
    })
})
