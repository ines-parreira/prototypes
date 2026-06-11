import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SelfServiceChatIntegrationFooter } from '../SelfServiceChatIntegrationFooter'

describe('<SelfServiceChatIntegrationFooter />', () => {
    it('should render component', () => {
        render(
            <SelfServiceChatIntegrationFooter
                sspTexts={{
                    foo: 'bar',
                }}
                color="blue"
            />,
        )

        expect(screen.getByRole('button')).toHaveStyle('background-color: blue')
    })
})
