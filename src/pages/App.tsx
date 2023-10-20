import classnames from 'classnames'
import React, {ComponentType, ReactNode, memo} from 'react'
import {Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import 'assets/css/main.less'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import FullPage from 'pages/common/components/FullPage'
import PhoneIntegrationBar from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationBar'
import Spotlight from 'pages/common/components/Spotlight/Spotlight'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {closePanels, openPanel} from 'state/layout/actions'
import {getCurrentOpenedPanel} from 'state/layout/selectors'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'

import css from './App.less'

type Props = {
    infobarOnMobile?: boolean
    isEditingWidgets?: boolean
    containerPadding?: boolean
    noContainerWidthLimit?: boolean
    children?: ReactNode
    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar?: ComponentType<any>
    infobar?: ComponentType<any>
    content?: ComponentType<any>
}

const App = ({
    infobarOnMobile,
    isEditingWidgets,
    noContainerWidthLimit,
    containerPadding,
    content: Content,
    navbar: Navbar,
    infobar: Infobar,
    children,
}: Props) => {
    const dispatch = useAppDispatch()

    const openedPanel = useAppSelector(getCurrentOpenedPanel)
    const hasPhoneIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Phone)
    )

    const Wrapper = containerPadding ? FullPage : Container
    const wrapperProps = containerPadding
        ? {noContainerWidthLimit}
        : {fluid: true, className: classnames(css['main-content'])}
    const content = !!Content ? <Content /> : children

    const hasOpenedPanel = !!openedPanel

    return (
        <div id="app-root" className={css.app}>
            <Spotlight>{Navbar && <Navbar />}</Spotlight>

            <div
                className={classnames(
                    'd-flex flex-grow-1 flex-column',
                    css.container
                )}
            >
                <div
                    className="d-flex flex-grow-1"
                    style={{
                        overflow: 'hidden',
                    }}
                >
                    <div className={classnames('app-content', css.content)}>
                        <div className="mobile-nav">
                            <IconButton
                                className="mr-3"
                                fillStyle="ghost"
                                intent="secondary"
                                onClick={() => dispatch(openPanel('navbar'))}
                            >
                                menu
                            </IconButton>
                            {infobarOnMobile && (
                                <Button
                                    className="ml-3"
                                    fillStyle="ghost"
                                    intent="secondary"
                                    onClick={() =>
                                        dispatch(openPanel('infobar'))
                                    }
                                >
                                    More info
                                </Button>
                            )}
                        </div>

                        <Wrapper {...wrapperProps}>
                            <ErrorBoundary>{content || null}</ErrorBoundary>
                        </Wrapper>
                    </div>

                    {!!Infobar && (
                        <Infobar isEditingWidgets={!!isEditingWidgets} />
                    )}
                </div>
                {hasPhoneIntegration && <PhoneIntegrationBar />}
            </div>

            <div
                className={classnames(css.backdrop, {
                    [css.hidden]: !hasOpenedPanel,
                })}
                onClick={() => dispatch(closePanels())}
            />
        </div>
    )
}

export default memo(App, _isEqual)
