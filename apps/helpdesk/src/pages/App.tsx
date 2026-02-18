import type { ComponentType, ReactNode } from 'react'
import { memo } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import cn from 'classnames'
import _isEqual from 'lodash/isEqual'
import { Container } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { GlobalNavigation } from 'common/navigation'
import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import { CollapsibleNavBarWrapper } from 'core/navigation/components/CollapsibleNavBarWrapper'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { AppContextProvider } from 'pages/AppContext'
import { CollapsibleColumn } from 'pages/CollapsibleColumn'
import IconButton from 'pages/common/components/button/IconButton'
import FullPage from 'pages/common/components/FullPage'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { closePanels, openPanel } from 'state/layout/actions'
import { getCurrentOpenedPanel } from 'state/layout/selectors'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'

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
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const dispatch = useAppDispatch()

    const openedPanel = useAppSelector(getCurrentOpenedPanel)

    const { onChangeTab } = useTicketInfobarNavigation()

    const Wrapper = containerPadding ? FullPage : Container
    const wrapperProps = containerPadding
        ? { noContainerWidthLimit }
        : { fluid: true, className: cn(css['main-content']) }
    const content = !!Content ? <Content /> : children

    const hasOpenedPanel = !!openedPanel

    const handleClosePanels = () => {
        dispatch(closePanels())
        onChangeTab(TicketInfobarTab.Customer)
        dispatch(changeTicketMessage({ message: undefined }))
    }

    const { isCollapsibleColumnOpen } = useCollapsibleColumn()

    return (
        <div
            id="app-root"
            className={cn(css.app, { [css.legacy]: !hasWayfindingMS1Flag })}
        >
            {!hasWayfindingMS1Flag && (
                <>
                    {showGlobalNav && <GlobalNavigation />}

                    {Navbar ? (
                        <>
                            {showGlobalNav ? (
                                <CollapsibleNavBarWrapper>
                                    <Navbar />
                                </CollapsibleNavBarWrapper>
                            ) : (
                                <Navbar />
                            )}
                        </>
                    ) : null}
                </>
            )}

            <div
                className={cn('d-flex flex-grow-1 flex-column', css.container, {
                    [css.withCollapsibleColumn]: isCollapsibleColumnOpen,
                })}
            >
                <div
                    className={cn('d-flex flex-grow-1', css.contentInfobar)}
                    style={{
                        overflow: 'hidden',
                    }}
                >
                    <div className={cn('app-content', css.content)}>
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
            </div>

            <CollapsibleColumn />

            <div
                className={cn(css.backdrop, {
                    [css.hidden]: !hasOpenedPanel,
                })}
                onClick={handleClosePanels}
            />
        </div>
    )
}

const AppWrapper = (props: Props) => {
    return (
        <AppContextProvider>
            <App {...props} />
        </AppContextProvider>
    )
}

export default memo(AppWrapper, _isEqual)
