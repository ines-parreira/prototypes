import React from 'react'
import {render} from '@testing-library/react'
import noop from 'lodash/noop'

import ArchiveConfirmationModal from '../ArchiveConfirmationModal'

describe('<ArchiveConfirmationModal/>', () => {
    it('should render', () => {
        const {baseElement} = render(
            <ArchiveConfirmationModal
                ticketFieldLabel="Foo"
                isOpen
                onConfirm={noop}
                onClose={noop}
            />
        )
        expect(baseElement).toMatchSnapshot()
    })
})
