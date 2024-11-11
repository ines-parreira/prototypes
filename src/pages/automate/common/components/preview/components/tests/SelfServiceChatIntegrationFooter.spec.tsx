import {render, screen} from '@testing-library/react'
import React from 'react'

import SelfServiceChatIntegrationFooter from '../SelfServiceChatIntegrationFooter'

describe('<SelfServiceChatIntegrationFooter />', () => {
    it('should render component', () => {
        render(
            <SelfServiceChatIntegrationFooter
                sspTexts={{
                    foo: 'bar',
                }}
                color="blue"
            />
        )

        expect(screen.getByRole('button')).toHaveStyle('background-color: blue')
    })
})
