import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { customerCustomization } from 'Widgets/modules/Yotpo/components/Customer'

const TitleWrapper = customerCustomization.TitleWrapper!
const BeforeContent = customerCustomization.BeforeContent!

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render icon, points and tier because data is correct', () => {
            const component = render(
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({ id: 1 }),
                        integrationId: null,
                    }}
                >
                    <TitleWrapper
                        source={fromJS({
                            loyalty_statistics: {
                                point_balance: 1,
                                vip_tier_name: 'Vip',
                            },
                        })}
                        isEditing={false}
                    ></TitleWrapper>
                </IntegrationContext.Provider>,
            )

            expect(component).toMatchSnapshot()
        })
        it('should render icon, points and not tier because data is missing', () => {
            const component = render(
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({ id: 1 }),
                        integrationId: null,
                    }}
                >
                    <TitleWrapper
                        source={fromJS({
                            loyalty_statistics: {
                                point_balance: 1,
                            },
                        })}
                        isEditing={false}
                    ></TitleWrapper>
                </IntegrationContext.Provider>,
            )

            expect(component).toMatchSnapshot()
        })
        it('should render empty state cause no data is available', () => {
            const component = render(
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({ id: 1 }),
                        integrationId: null,
                    }}
                >
                    <TitleWrapper
                        source={fromJS({})}
                        isEditing={false}
                    ></TitleWrapper>
                </IntegrationContext.Provider>,
            )

            expect(component).toMatchSnapshot()
        })
    })
})

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render empty state cause no data is available', () => {
            const component = render(
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({ id: 1 }),
                        integrationId: null,
                    }}
                >
                    <BeforeContent source={fromJS({ id: 1 })}></BeforeContent>
                </IntegrationContext.Provider>,
            )

            expect(component).toMatchSnapshot()
        })
        it('should render nothing cause data is available', () => {
            const component = render(
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({ id: 1 }),
                        integrationId: null,
                    }}
                >
                    <BeforeContent
                        source={fromJS({
                            id: 1,
                            loyalty_statistics: {
                                point_balance: 1,
                            },
                        })}
                    ></BeforeContent>
                </IntegrationContext.Provider>,
            )

            expect(component).toMatchSnapshot()
        })
    })
})
