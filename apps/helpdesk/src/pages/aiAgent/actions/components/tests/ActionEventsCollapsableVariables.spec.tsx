import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { CollapsableVariables as ActionEventsCollapsableVariables } from '../ActionEventsCollapsableVariables'

describe('<ActionEventsCollapsableVariables />', () => {
    it('should render component', () => {
        render(
            <ActionEventsCollapsableVariables
                body={{
                    foo: 'bar',
                }}
                title="title"
            />,
        )
        expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument()
    })
})
