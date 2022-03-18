import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {emptyManagedRule} from 'fixtures/rule'
import {AutoCloseSpamModal} from '../AutoCloseSpamModal'

describe('<AutoCloseSpamModal/>', () => {
    const minProps: ComponentProps<typeof AutoCloseSpamModal> = {
        rule: emptyManagedRule,
        triggeredCount: 10,
        isBehindPaywall: false,
        renderTags: () => <></>,
    }
    it('should render the autoclose spam body when automation add-on is subscribed', () => {
        const {container} = render(<AutoCloseSpamModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the autoclose spam body when automation add-on is not subscribed', () => {
        const {container} = render(
            <AutoCloseSpamModal {...minProps} isBehindPaywall={true} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
