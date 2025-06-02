import { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { BaseActionPreview } from '../BaseActionPreview'

describe('<BaseActionPreview />', () => {
    const text = 'foo'
    const minProps: ComponentProps<typeof BaseActionPreview> = {
        actionName: 'test action',
        children: <div>{text}</div>,
    }

    it('should render the component', () => {
        render(<BaseActionPreview {...minProps} />)

        expect(screen.getByText(text)).toBeInTheDocument()
    })
})
