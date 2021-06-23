import React from 'react'
import {render} from '@testing-library/react'

import {BackendActionPreview} from '../BackendActionPreview'
import {httpAction, shopifyAction} from '../../../../../../../../fixtures/macro'

describe('<BackActionPreview />', () => {
    it('should render http actions', () => {
        const {container} = render(
            <BackendActionPreview actions={[httpAction]} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render shopify actions', () => {
        const {container} = render(
            <BackendActionPreview actions={[shopifyAction]} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render both shopify actions and http actions', () => {
        const {container} = render(
            <BackendActionPreview actions={[shopifyAction, httpAction]} />
        )
        expect(container).toMatchSnapshot()
    })
})
