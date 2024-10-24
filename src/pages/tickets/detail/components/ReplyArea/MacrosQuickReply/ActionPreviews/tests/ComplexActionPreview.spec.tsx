import {render} from '@testing-library/react'
import React from 'react'

import {
    httpAction,
    shopifyAction,
    addInternalNoteAction,
} from '../../../../../../../../fixtures/macro'
import {ComplexActionPreview} from '../ComplexActionPreview'

describe('<ComplexActionPreview />', () => {
    it('should render http actions', () => {
        const {container} = render(
            <ComplexActionPreview actions={[httpAction]} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render shopify actions', () => {
        const {container} = render(
            <ComplexActionPreview actions={[shopifyAction]} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render both shopify actions and http actions', () => {
        const {container} = render(
            <ComplexActionPreview actions={[shopifyAction, httpAction]} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render both internal note action', () => {
        const {container} = render(
            <ComplexActionPreview actions={[addInternalNoteAction]} />
        )
        expect(container).toMatchSnapshot()
    })
})
