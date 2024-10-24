import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import ActionEventsCollapsableVariables from '../ActionEventsCollapsableVariables'

describe('<ActionEventsCollapsableVariables />', () => {
    it('should render component', () => {
        renderWithRouter(
            <ActionEventsCollapsableVariables
                body={{
                    foo: 'bar',
                }}
                title="title"
            />
        )

        expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument()
    })
})
