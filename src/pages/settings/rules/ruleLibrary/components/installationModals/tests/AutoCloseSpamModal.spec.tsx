import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import {emptyManagedRule} from 'fixtures/rule'
import {AutoCloseSpamModal} from '../AutoCloseSpamModal'

describe('<AutoCloseSpamModal/>', () => {
    const minProps: ComponentProps<typeof AutoCloseSpamModal> = {
        rule: emptyManagedRule,
        recipeSlug: 'non-support-related-emails',
        triggeredCount: 10,
        viewCreationCheckbox: () => <>view creation checkbox</>,
        handleInstallationError: _noop,
        handleDefaultSettings: _noop,
    }
    it('should render the autoclose spam body when automation add-on is subscribed', () => {
        const {container} = render(<AutoCloseSpamModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the autoclose spam body when automation add-on is not subscribed', () => {
        const {container} = render(<AutoCloseSpamModal {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
