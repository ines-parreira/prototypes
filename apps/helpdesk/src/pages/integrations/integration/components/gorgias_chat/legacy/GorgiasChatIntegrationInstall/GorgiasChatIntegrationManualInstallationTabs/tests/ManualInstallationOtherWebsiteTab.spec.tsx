import React from 'react'

import { render } from '@repo/testing'

import { ManualInstallationOtherWebsiteTab } from '../ManualInstallationOtherWebsiteTab'

describe('ManualInstallationOtherWebsiteTab', () => {
    it('should render the component', () => {
        const { container } = render(
            <ManualInstallationOtherWebsiteTab
                code="code_snippet_here"
                alertMessage={'custom message here'}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
