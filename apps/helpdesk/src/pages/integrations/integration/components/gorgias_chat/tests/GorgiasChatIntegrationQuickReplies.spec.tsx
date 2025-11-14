import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import { RootState, StoreDispatch } from 'state/types'
import { getLDClient } from 'utils/launchDarkly'
import { renderWithRouter } from 'utils/testing'

import GorgiasChatIntegrationQuickReplies, {
    GorgiasChatIntegrationQuickRepliesComponent,
} from '../GorgiasChatIntegrationQuickReplies/GorgiasChatIntegrationQuickReplies'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

jest.mock('../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock('utils/launchDarkly')

const allFlagsMock = getLDClient().allFlags as jest.MockedFunction<
    ReturnType<typeof getLDClient>['allFlags']
>
allFlagsMock.mockReturnValue({
    [FeatureFlagKey.ChatMultiLanguages]: true,
})

describe('<GorgiasChatIntegrationQuickReplies/>', () => {
    const integration: Map<any, any> = fromJS({
        id: 7,
        name: 'my chat integration',
        meta: {},
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    })

    const minProps: ComponentProps<
        typeof GorgiasChatIntegrationQuickRepliesComponent
    > = {
        integration: integration,
        currentUser: fromJS({}),
        updateOrCreateIntegration: jest.fn(),
    }

    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    beforeEach(() => {
        store = mockStore({
            entities: entitiesInitialState,
            integrations: fromJS(integrationsState),
            billing: fromJS(billingState),
        } as unknown as RootState)
    })

    describe('render()', () => {
        it('should render defaults because there is no quick replies in the integration', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickReplies {...minProps} />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render quick replies from the integration', () => {
            const quickRepliesState = fromJS({
                enabled: true,
                replies: ['foo', 'bar'],
            })

            const { container } = renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickReplies
                        {...minProps}
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState,
                        )}
                    />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('_submit()', () => {
        it('should trim quick replies in the payload before calling updateOrCreateIntegration', () => {
            const updateOrCreateIntegrationSpy = jest.fn(() =>
                Promise.resolve(),
            )
            const expectedPayload: Map<any, any> = fromJS({
                id: 7,
                meta: {
                    quick_replies: {
                        enabled: true,
                        replies: ['foo', 'bar'],
                    },
                },
            })

            const quickRepliesState: Map<any, any> = fromJS({
                enabled: true,
                replies: [' foo ', 'bar  '],
            })

            renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState,
                        )}
                        updateOrCreateIntegration={updateOrCreateIntegrationSpy}
                    />
                </Provider>,
            )

            screen.getByRole('button', { name: 'Save Changes' }).click()

            expect(updateOrCreateIntegrationSpy).toHaveBeenCalledWith(
                expectedPayload,
            )
        })
    })
})
