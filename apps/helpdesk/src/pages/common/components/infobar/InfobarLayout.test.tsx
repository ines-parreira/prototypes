import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { InfobarLayout } from './InfobarLayout'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockSavedSizes = { current: { infobar: 340 } }
const mockPersistSizes = jest.fn()

const renderComponent = ({
    isOnNewLayout = false,
    hasUIVisionMS1 = false,
    isOpenedPanel = true,
}: {
    isOnNewLayout?: boolean
    hasUIVisionMS1?: boolean
    isOpenedPanel?: boolean
} = {}) => {
    const store = mockStore({
        layout: { panels: { infobar: isOpenedPanel } },
    })

    return render(
        <Provider store={store}>
            <InfobarLayout
                isOpenedPanel={isOpenedPanel}
                dispatch={store.dispatch}
                isOnNewLayout={isOnNewLayout}
                hasUIVisionMS1={hasUIVisionMS1}
                savedSizes={mockSavedSizes}
                persistSizes={mockPersistSizes}
            >
                <div>Test content</div>
            </InfobarLayout>
        </Provider>,
    )
}

describe('InfobarLayout', () => {
    it('should render children', () => {
        renderComponent()

        expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should apply infobarHelpdeskV2MS1 class when hasUIVisionMS1 is true', () => {
        const { container } = renderComponent({ hasUIVisionMS1: true })

        const infobarElement = container.querySelector('.infobar')
        expect(infobarElement).toHaveClass('infobarHelpdeskV2MS1')
    })

    it('should not apply infobarHelpdeskV2MS1 class when hasUIVisionMS1 is false', () => {
        const { container } = renderComponent({ hasUIVisionMS1: false })

        const infobarElement = container.querySelector('.infobar')
        expect(infobarElement).not.toHaveClass('infobarHelpdeskV2MS1')
    })

    it('should apply hidden-panel class when isOpenedPanel is false', () => {
        const { container } = renderComponent({ isOpenedPanel: false })

        const infobarElement = container.querySelector('.infobar')
        expect(infobarElement).toHaveClass('hidden-panel')
    })
})
