import React from 'react'
import {render} from '@testing-library/react'

import SupportPerformanceWeeklyTicketLoad from '../SupportPerformanceWeeklyTicketLoad'

describe('<SupportPerformanceWeeklyTicketLoad />', () => {
    it('should render the page', () => {
        const {container} = render(<SupportPerformanceWeeklyTicketLoad />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
