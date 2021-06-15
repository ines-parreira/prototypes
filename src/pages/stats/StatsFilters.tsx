import React, {ComponentProps, useMemo, useState} from 'react'
import {fromJS, List, Map} from 'immutable'
import _debounce from 'lodash/debounce'
import moment from 'moment-timezone'
import {connect, ConnectedProps} from 'react-redux'
import _upperFirst from 'lodash/upperFirst'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {DropdownItem, Button} from 'reactstrap'
import {CancelToken} from 'axios'

import {makeGetPlainJS} from '../../utils'
import {views as statViewsConfig} from '../../config/stats'
import {CHANNELS} from '../../config/ticket'
import useCancellableRequest from '../../hooks/useCancellableRequest'
import useDelayedAsyncFn from '../../hooks/useDelayedAsyncFn'
import {OrderDirection} from '../../models/api/types'
import {Integration, IntegrationType} from '../../models/integration/types'
import {fetchTags} from '../../models/tag/resources'
import {
    FetchTagsOptions,
    Tag,
    TagSortableProperties,
} from '../../models/tag/types'
import {getLabelledAgents} from '../../state/agents/selectors'
import {tagsFetched} from '../../state/entities/tags/actions'
import {getIntegrations} from '../../state/integrations/selectors'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import {mergeStatsFilters} from '../../state/stats/actions'
import {getViewFilters} from '../../state/stats/selectors'
import {getLabelledTeams} from '../../state/teams/selectors'
import {RootState} from '../../state/types'

import InfiniteScroll from '../common/components/InfiniteScroll/InfiniteScroll'
import PageHeader from '../common/components/PageHeader'
import PopoverModal from '../common/components/PopoverModal'
import TagDropdownMenu from '../common/components/TagDropdownMenu/TagDropdownMenu'

import gmail from '../../../img/integrations/gmail.png'
import outlook from '../../../img/integrations/outlook.svg'
import aircall from '../../../img/integrations/aircall.png'
import shopify from '../../../img/integrations/shopify.png'
import smooch from '../../../img/integrations/smooch.png'
import zendesk from '../../../img/integrations/zendesk.png'

import PeriodPicker from './common/PeriodPicker'
import SelectFilter from './common/SelectFilter'
import css from './StatsFilters.less'

const TagDropdownMenuWrapper = (
    props: ComponentProps<typeof TagDropdownMenu>
) => <TagDropdownMenu {...props} />

const orderingOptions = {
    orderBy: TagSortableProperties.Name,
    orderDir: OrderDirection.Asc,
}

type OwnProps = RouteComponentProps<{view: string}>

type Props = OwnProps & ConnectedProps<typeof connector>

export const StatsFiltersContainer = ({
    agents,
    channels,
    config,
    filters,
    integrations,
    mergeStatsFilters,
    notify,
    teams,
    tags,
    tagsFetched,
}: Props) => {
    const [tagIds, setTagIds] = useState<string[]>([])
    const [tagSearch, setTagSearch] = useState('')
    const [pagination, setPagination] = useState({
        page: 0,
        nbPages: 1,
    })

    const [
        cancellableFetchTags,
    ] = useCancellableRequest(
        (cancelToken: CancelToken) => async (options: FetchTagsOptions) =>
            await fetchTags(options, cancelToken)
    )

    const [, handleFetchTags] = useDelayedAsyncFn<[string?], void>(
        async (search = '') => {
            try {
                let previousIds = tagIds
                let nextPage = pagination.page + 1
                if (search !== tagSearch) {
                    setTagSearch(search)
                    previousIds = []
                    nextPage = 1
                }
                const res = await cancellableFetchTags({
                    ...orderingOptions,
                    page: nextPage,
                    search,
                })
                if (!res) {
                    return
                }

                tagsFetched(res.data)
                setTagIds([
                    ...previousIds,
                    ...res.data.map((tag: Tag) => tag.id.toString()),
                ])
                setPagination({page: res.meta.page, nbPages: res.meta.nb_pages})
            } catch (error) {
                void notify({
                    message: 'Failed to fetch tags',
                    status: NotificationStatus.Error,
                })
            }
        },
        [orderingOptions, pagination],
        200
    )

    const handleFilterChange = (filterName: string) => {
        return (values: any) => {
            mergeStatsFilters(fromJS({[filterName]: values}))
        }
    }

    const onSearchTags = _debounce(handleFetchTags, 300)

    const renderFilterInput = (filter: Map<string, any>) => {
        const filterType: string = filter.get('type')
        const filterValue = filters!.get(filterType)

        switch (filterType) {
            case 'score': {
                const minValue: number = filter.get('minValue')
                const maxValue: number = filter.get('maxValue')
                const reverse: boolean = filter.get('reverse')
                const variant: string = filter.get('variant')

                const scores = Array.from(
                    {length: maxValue - minValue + 1},
                    (value, index) => {
                        const scoreValue = reverse
                            ? maxValue - index
                            : index + minValue
                        switch (variant) {
                            case 'star':
                                return {
                                    value: scoreValue.toString(),
                                    label:
                                        Array(minValue + scoreValue - 1)
                                            .fill('★')
                                            .join('') +
                                        Array(maxValue - scoreValue)
                                            .fill('☆')
                                            .join(''),
                                }
                            default:
                                return {value: '', label: ''}
                        }
                    }
                )
                return (
                    <SelectFilter
                        key={filterType}
                        plural="scores"
                        singular="score"
                        onChange={handleFilterChange('score')}
                        value={(filters!.get('score', fromJS([])) as List<
                            any
                        >).toJS()}
                    >
                        {scores.map((score) => (
                            <SelectFilter.Item
                                key={score.value}
                                label={score.label}
                                value={score.value}
                            />
                        ))}
                    </SelectFilter>
                )
            }
            case 'channels': {
                const options: List<any> = filter.get('options')
                const data = options
                    ? channels.filter((channel) =>
                          options.includes(channel.value)
                      )
                    : channels
                return (
                    <SelectFilter
                        key={filterType}
                        plural="channels"
                        singular="channel"
                        onChange={handleFilterChange('channels')}
                        value={(filters!.get('channels', fromJS([])) as List<
                            any
                        >).toJS()}
                    >
                        {data.map((channel) => (
                            <SelectFilter.Item
                                key={channel.value}
                                label={channel.label}
                                value={channel.value}
                            />
                        ))}
                    </SelectFilter>
                )
            }
            case 'tags':
                return (
                    <SelectFilter
                        key="tags"
                        plural="tags"
                        singular="tag"
                        onChange={handleFilterChange('tags')}
                        value={(filters!.get('tags', fromJS([])) as List<
                            any
                        >).toJS()}
                        onSearch={onSearchTags}
                        dropdownMenu={TagDropdownMenuWrapper}
                    >
                        <InfiniteScroll
                            className={css.infiniteScroll}
                            onLoad={handleFetchTags}
                            shouldLoadMore={
                                pagination.page < pagination.nbPages
                            }
                        >
                            {tagIds.map((tagId) => {
                                const tag = tags[tagId.toString()]

                                return (
                                    tag && (
                                        <SelectFilter.Item
                                            key={tag.id}
                                            label={tag.name}
                                            value={tag.id}
                                        />
                                    )
                                )
                            })}
                        </InfiniteScroll>
                    </SelectFilter>
                )
            case 'agents':
                return (
                    <SelectFilter
                        key={filterType}
                        plural="agents"
                        singular="agent"
                        onChange={handleFilterChange('agents')}
                        value={(filters!.get('agents', fromJS([])) as List<
                            any
                        >).toJS()}
                    >
                        <DropdownItem header className={css.dropdownHeader}>
                            Teams
                        </DropdownItem>
                        {teams.map((team) => (
                            <SelectFilter.Group
                                key={`team-${team.id}`}
                                items={team.members}
                                label={team.label}
                                value={team.id}
                            />
                        ))}
                        <DropdownItem divider className={css.dropdownDivider} />
                        <DropdownItem header className={css.dropdownHeader}>
                            Users
                        </DropdownItem>
                        {agents.map((agent) => (
                            <SelectFilter.Item
                                key={`agent-${agent.id}`}
                                label={agent.label}
                                value={agent.id}
                            />
                        ))}
                    </SelectFilter>
                )
            case 'integrations': {
                const options: Map<any, any> = filter.get('options', fromJS({}))
                const allowedTypes: List<any> = options.get('allowedTypes')
                const data = allowedTypes
                    ? integrations.filter((integration) =>
                          allowedTypes.includes(integration.type)
                      )
                    : integrations
                const logos: Partial<{[key in IntegrationType]: string}> = {
                    aircall,
                    gmail,
                    outlook,
                    shopify,
                    smooch,
                    smooch_inside: smooch,
                    zendesk,
                }

                return (
                    <SelectFilter
                        key={filterType}
                        plural="integrations"
                        singular="integration"
                        isMultiple={options.get('isMultiple', true)}
                        isRequired={options.get('isRequired', false)}
                        onChange={handleFilterChange('integrations')}
                        value={(filters!.get(
                            'integrations',
                            fromJS([])
                        ) as List<any>).toJS()}
                    >
                        {data.map((integration) => {
                            const icon = [
                                IntegrationType.EmailIntegrationType,
                                IntegrationType.FacebookIntegrationType,
                                IntegrationType.HttpIntegrationType,
                                IntegrationType.PhoneIntegrationType,
                                IntegrationType.GorgiasChatIntegrationType,
                            ].includes(integration.type) ? (
                                integration.type ===
                                IntegrationType.GorgiasChatIntegrationType ? (
                                    'chat'
                                ) : (
                                    integration.type
                                )
                            ) : (
                                <img
                                    src={logos[integration.type]}
                                    alt={`logo-${integration.type}`}
                                    className={css.integrationIcon}
                                />
                            )
                            return (
                                <SelectFilter.Item
                                    key={integration.id}
                                    label={integration.name}
                                    value={integration.id}
                                    icon={icon}
                                />
                            )
                        })}
                    </SelectFilter>
                )
            }
            case 'period':
                return (
                    <PeriodPicker
                        key={filterType}
                        startDatetime={moment(
                            (filterValue as Map<any, any>).get('start_datetime')
                        )}
                        endDatetime={moment(
                            (filterValue as Map<any, any>).get('end_datetime')
                        )}
                        onChange={handleFilterChange('period')}
                    />
                )
            default:
                console.error(
                    `[stats] Cannot render input for this unknown filter type: ${filterType}`
                )
        }
    }

    const pageTitle = useMemo(
        () =>
            config.get('description') ? (
                <h1 className="align-items-center">
                    <span>{config.get('name')}</span>
                    <PopoverModal className="ml-3" placement="bottom-start">
                        <p className={css.learnMoreContent}>
                            {config.get('description')}
                        </p>
                        <Button
                            className={css.titleTooltipButton}
                            color="secondary"
                            type="button"
                            onClick={() => {
                                window
                                    .open(config.get('url'), '_blank')!
                                    .focus()
                            }}
                        >
                            Learn More{' '}
                            <i className="material-icons">arrow_forward</i>
                        </Button>
                    </PopoverModal>
                </h1>
            ) : (
                (config.get('name') as string)
            ),
        [config]
    )

    return (
        <PageHeader title={pageTitle} className="mb-0">
            <div className="d-flex flex-wrap float-right">
                {(config.get('filters') as List<
                    any
                >).map((filter: Map<any, any>) => renderFilterInput(filter))}
            </div>
        </PageHeader>
    )
}

function getChannels() {
    return CHANNELS.map((channel) => ({
        label: _upperFirst(channel.replace(/-/g, ' ')),
        value: channel,
    }))
}

const makeMapStateToProps = () => {
    const getIntegrationsToJS = makeGetPlainJS<Integration[]>(getIntegrations)
    const getAgentsToJS = makeGetPlainJS<{id: number; label: string}[]>(
        getLabelledAgents
    )
    const getTeamsToJS = makeGetPlainJS<
        {id: number; label: string; members: string[]}[]
    >(getLabelledTeams)

    return (state: RootState, props: OwnProps) => {
        const view = props.match.params.view
        const config: Map<any, any> = statViewsConfig.get(view)

        return {
            agents: getAgentsToJS(state),
            channels: getChannels(),
            config,
            filters: getViewFilters(props.match.params.view)(state),
            integrations: getIntegrationsToJS(state),
            tags: state.entities.tags,
            teams: getTeamsToJS(state),
        }
    }
}

const actions = {
    mergeStatsFilters,
    tagsFetched,
    notify,
}

const connector = connect(makeMapStateToProps, actions)

export default withRouter(connector(StatsFiltersContainer))
