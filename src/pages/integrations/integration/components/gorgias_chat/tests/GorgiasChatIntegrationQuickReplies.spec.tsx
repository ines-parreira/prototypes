import React, {ComponentProps, FormEvent} from 'react'
import {mount, shallow} from 'enzyme'

import {fromJS, Map} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {entitiesInitialState} from 'fixtures/entities'
import {integrationsState} from 'fixtures/integrations'
import {billingState} from 'fixtures/billing'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import GorgiasChatIntegrationQuickReplies, {
    GorgiasChatIntegrationQuickRepliesComponent,
} from '../GorgiasChatIntegrationQuickReplies/GorgiasChatIntegrationQuickReplies'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    }
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
            const component = mount(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickReplies {...minProps} />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render quick replies from the integration', () => {
            const quickRepliesState = fromJS({
                enabled: true,
                replies: ['foo', 'bar'],
            })

            const component = mount(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickReplies
                        {...minProps}
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState
                        )}
                    />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_submit()', () => {
        it('should trim quick replies in the payload before calling updateOrCreateIntegration', () => {
            const updateOrCreateIntegrationSpy = jest.fn(() =>
                Promise.resolve()
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

            const component =
                shallow<GorgiasChatIntegrationQuickRepliesComponent>(
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState
                        )}
                        updateOrCreateIntegration={updateOrCreateIntegrationSpy}
                    />
                )

            const fakeEvent = {preventDefault: jest.fn()}
            void component.instance()._submit(fakeEvent as unknown as FormEvent)

            expect(updateOrCreateIntegrationSpy).toHaveBeenCalledWith(
                expectedPayload
            )
            expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        })
    })
})
