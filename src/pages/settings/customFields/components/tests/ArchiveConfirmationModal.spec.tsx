import {render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import noop from 'lodash/noop'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {OBJECT_TYPES} from 'custom-fields/constants'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'

describe('<ArchiveConfirmationModal/>', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
    })
    it.each(Object.values(OBJECT_TYPES))('should render', (objectType) => {
        const {baseElement, queryByText} = render(
            <ArchiveConfirmationModal
                customFieldLabel="Foo"
                isOpen
                onConfirm={noop}
                onClose={noop}
                objectType={objectType}
            />
        )
        screen.debug()
        expect(baseElement).toMatchSnapshot()
        expect(queryByText(/Saved Filters/i)).not.toBeInTheDocument()
    })
    it('should render with changed text and the text should have "saved filters"', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: true,
        })
        const {getByText} = render(
            <ArchiveConfirmationModal
                customFieldLabel="Bar"
                isOpen
                onConfirm={noop}
                onClose={noop}
                objectType={OBJECT_TYPES.TICKET}
            />
        )

        expect(getByText(/Saved Filters/i)).toBeInTheDocument()
    })
})
