import React from 'react'
import {render} from '@testing-library/react'
import ConvertLibraryBanner from '../ConvertLibraryBanner'

describe('ConvertLibraryBanner', () => {
    const integrationId = 123

    it('renders correctly with buttons', () => {
        const {getByText} = render(
            <ConvertLibraryBanner integrationId={integrationId} />
        )

        expect(getByText('View campaign library')).toBeInTheDocument()
    })

    it('renders title and content', () => {
        const {getByText} = render(
            <ConvertLibraryBanner integrationId={integrationId} />
        )

        expect(
            getByText('Get started faster with campaign templates')
        ).toBeInTheDocument()
        expect(
            getByText(
                'Discover the campaign strategy used by best-in-class Convert customers, customize the campaign templates, and push them live to your store in a click!'
            )
        ).toBeInTheDocument()
    })
})
