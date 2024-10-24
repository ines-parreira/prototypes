import {render} from '@testing-library/react'
import _noop from 'lodash/noop'
import React, {ComponentProps} from 'react'

import {emptyManagedRule} from 'fixtures/rule'
import {ManagedRulesSlugs} from 'state/rules/types'

import {AutoReplyReturnModal} from '../AutoReplyReturnModal'

describe('<AutoReplyReturnModal/>', () => {
    const minProps: ComponentProps<typeof AutoReplyReturnModal> = {
        rule: emptyManagedRule,
        recipeSlug: ManagedRulesSlugs.AutoReplyReturn,
        triggeredCount: 10,
        viewCreationCheckbox: () => <>view creation checkbox</>,
        handleInstallationError: _noop,
        handleDefaultSettings: _noop,
    }
    it('should render the instalation modal when Automate is subscribed', () => {
        const {container} = render(<AutoReplyReturnModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the instalation modal when Automate is not subscribed', () => {
        const {container} = render(<AutoReplyReturnModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
