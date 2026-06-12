import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { noop } from '@gorgias/toolkit'
import { emptyManagedRule } from 'fixtures/rule'
import { ManagedRulesSlugs } from 'state/rules/types'

import { AutoReplyReturnModal } from '../AutoReplyReturnModal'

describe('<AutoReplyReturnModal/>', () => {
    const minProps: ComponentProps<typeof AutoReplyReturnModal> = {
        rule: emptyManagedRule,
        recipeSlug: ManagedRulesSlugs.AutoReplyReturn,
        triggeredCount: 10,
        viewCreationCheckbox: () => <>view creation checkbox</>,
        handleInstallationError: noop,
        handleDefaultSettings: noop,
    }
    it('should render the instalation modal when AI Agent is subscribed', () => {
        const { container } = render(<AutoReplyReturnModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the instalation modal when AI Agent is not subscribed', () => {
        const { container } = render(<AutoReplyReturnModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
