import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, waitFor } from '@testing-library/react'

import { IconTooltip } from '../IconTooltip'

jest.mock('@gorgias/toolkit', () => ({
    ...jest.requireActual('@gorgias/toolkit'),
    uniqueId: () => '42',
}))

describe('<IconTooltip />', () => {
    it('should render an Icon', () => {
        const { container } = render(
            <IconTooltip>Content when hovering</IconTooltip>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a custom icon', () => {
        const { getByText } = render(
            <IconTooltip icon="cross">Content when hovering</IconTooltip>,
        )

        expect(getByText('cross')).toBeInTheDocument()
    })

    it('should render a tooltip when hovering over the icon', async () => {
        const content = 'Content when hovering'
        const { getByText } = render(<IconTooltip>{content}</IconTooltip>)

        fireEvent.mouseOver(getByText('info'))
        await waitFor(() => expect(getByText(content)).toBeInTheDocument())
    })
})
