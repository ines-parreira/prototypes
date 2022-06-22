import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import IntentsFeedback from '../IntentsFeedback'
import {message} from '../../../../../../../models/ticket/tests/mocks'
import {TicketMessageIntent} from '../../../../../../../models/ticket/types'

window.GORGIAS_CONSTANTS = {
    INTENTS: {
        'foo/intent': 'foo intent description',
        'bar/intent': 'bar intent description',
        'baz/intent': 'baz intent description',
        'other/intent': 'other intent description',
    },
}

const intents: TicketMessageIntent[] = [
    {
        name: 'foo/intent',
        is_user_feedback: true,
        rejected: false,
    },
]

const minProps: ComponentProps<typeof IntentsFeedback> = {
    message: {
        ...message,
        intents,
    },
    allIntents: window.GORGIAS_CONSTANTS.INTENTS,
}

describe('<IntentsFeedback />', () => {
    it('should render active intents', () => {
        const {container} = render(<IntentsFeedback {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
