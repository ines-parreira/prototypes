import { render } from '@testing-library/react'

import { ConnectedChannelsChatView } from './ConnectedChannelsChatView'

describe('ConnectedChannelsChatView', () => {
    it('should render without throwing', () => {
        expect(() => render(<ConnectedChannelsChatView />)).not.toThrow()
    })

    it('should render nothing', () => {
        const { container } = render(<ConnectedChannelsChatView />)

        expect(container).toBeEmptyDOMElement()
    })
})
