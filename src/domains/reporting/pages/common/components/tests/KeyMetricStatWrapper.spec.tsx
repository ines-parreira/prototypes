import React from 'react'

import { render } from '@testing-library/react'

import KeyMetricStatWrapper from 'domains/reporting/pages/common/components/KeyMetricStatWrapper'

describe('KeyMetricStatWrapper', () => {
    it('should render the key metric wrapper', () => {
        const { container } = render(
            <KeyMetricStatWrapper>
                <div>foo</div>
            </KeyMetricStatWrapper>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
