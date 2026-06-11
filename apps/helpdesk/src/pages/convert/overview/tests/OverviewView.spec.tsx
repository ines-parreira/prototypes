import { render } from '@repo/testing'

import { OverviewView } from '../OverviewView'

jest.mock('hooks/candu/useInjectStyleToCandu', () => ({
    useInjectStyleToCandu: jest.fn(),
}))

describe('OverviewView', () => {
    test('renders with title "Overview"', () => {
        render(<OverviewView />)

        expect(
            document.querySelector('[data-candu-id="convert-overview-view"]'),
        ).toBeInTheDocument()
    })
})
