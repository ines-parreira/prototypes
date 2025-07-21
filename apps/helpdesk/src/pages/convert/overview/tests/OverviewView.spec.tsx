import { render } from '@testing-library/react'

import { OverviewView } from '../OverviewView'

jest.mock('hooks/candu/useInjectStyleToCandu', () => jest.fn())

describe('OverviewView', () => {
    test('renders with title "Overview"', () => {
        render(<OverviewView />)

        expect(
            document.querySelector('[data-candu-id="convert-overview-view"]'),
        ).toBeInTheDocument()
    })
})
