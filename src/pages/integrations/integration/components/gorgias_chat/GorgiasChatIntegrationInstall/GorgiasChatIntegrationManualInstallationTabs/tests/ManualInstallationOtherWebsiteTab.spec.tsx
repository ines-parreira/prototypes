import React from 'react'

import { render } from '@testing-library/react'

import ManualInstallationOtherWebsiteTab from '../ManualInstallationOtherWebsiteTab'

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
