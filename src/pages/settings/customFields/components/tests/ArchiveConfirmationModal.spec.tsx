import React from 'react'

import { render } from '@testing-library/react'
import noop from 'lodash/noop'

import { OBJECT_TYPES } from 'custom-fields/constants'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'

describe('<ArchiveConfirmationModal/>', () => {
    it.each(Object.values(OBJECT_TYPES))('should render', (objectType) => {
        const { baseElement } = render(
            <ArchiveConfirmationModal
                customFieldLabel="Foo"
                isOpen
                onConfirm={noop}
                onClose={noop}
                objectType={objectType}
            />,
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render with changed text and the text should have "saved filters"', () => {
        const { getByText } = render(
            <ArchiveConfirmationModal
                customFieldLabel="Bar"
                isOpen
                onConfirm={noop}
                onClose={noop}
                objectType={OBJECT_TYPES.TICKET}
            />,
        )

        expect(getByText(/Saved Filters/i)).toBeInTheDocument()
    })
})
