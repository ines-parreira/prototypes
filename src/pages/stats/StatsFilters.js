// @flow
// $FlowFixMe
import React, {useMemo, useState} from 'react'
import {fromJS, type Map} from 'immutable'
import _capitalize from 'lodash/capitalize'
import _debounce from 'lodash/debounce'
import moment from 'moment'
import {connect} from 'react-redux'
import _upperFirst from 'lodash/upperFirst'
import {withRouter} from 'react-router-dom'
import {DropdownItem, Button} from 'reactstrap'
import {CancelToken} from 'axios'

import {views as statViewsConfig} from '../../config/stats.tsx'
import {CHANNELS} from '../../config/ticket.ts'
import useCancellableRequest from '../../hooks/useCancellableRequest.ts'
import useDelayedAsyncFn from '../../hooks/useDelayedAsyncFn.ts'
import {ORDER_DIRECTION} from '../../models/api'
import {TAG_SORTABLE_PROPERTIES} from '../../models/tag/constants.ts'
import {fetchTags} from '../../models/tag/resources.ts'
import type {FetchTagsOptions, Tag} from '../../models/tag/types'
import {getAgents} from '../../state/agents/selectors.ts'
import {getDisplayName} from '../../state/customers/helpers.ts'
import {tagsFetched, type TagsState} from '../../state/entities/tags'
import {getIntegrations} from '../../state/integrations/selectors.ts'
import {notify} from '../../state/notifications/actions.ts'
import {NOTIFICATION_STATUS} from '../../state/notifications/constants.ts'
import {mergeStatsFilters} from '../../state/stats/actions.ts'
import {getViewFilters} from '../../state/stats/selectors.ts'
import {getTeams} from '../../state/teams/selectors.ts'

import InfiniteScroll from '../common/components/InfiniteScroll'
import PageHeader from '../common/components/PageHeader.tsx'
import PopoverModal from '../common/components/PopoverModal.tsx'
import TagDropdownMenu from '../common/components/TagDropdownMenu/TagDropdownMenu.tsx'

import PeriodPicker from './common/PeriodPicker.tsx'
import SelectFilter from './common/SelectFilter.tsx'
import css from './StatsFilters.less'

const TagDropdownMenuWrapper = (props) => <TagDropdownMenu {...props} />

const orderingOptions = {
    orderBy: TAG_SORTABLE_PROPERTIES.NAME,
    orderDir: ORDER_DIRECTION.ASC,
}

type Props = {
    match: Object,
    config: Object,
    channels: any[],
    agents: any[],
    tags: TagsState,
    integrations: any[],
    stats: Object,
    filters: Object,
    fetchStat: (any, any, any) => Promise<*>,
    mergeStatsFilters: typeof mergeStatsFilters,
    teams: {label: string, value: string, members: string[]}[],
    fetchTags: typeof fetchTags,
    tagsFetched: typeof tagsFetched,
    notify: Function,
}

const StatsFiltersContainer = ({
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
    const [tagIds, setTagIds] = useState([])
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

    const [, handleFetchTags] = useDelayedAsyncFn(
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
                    ...res.data.map((tag: Tag) => tag.id),
                ])
                setPagination({page: res.meta.page, nbPages: res.meta.nb_pages})
            } catch (error) {
                void notify({
                    message: 'Failed to fetch tags',
                    status: NOTIFICATION_STATUS.ERROR,
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
        const filterType = filter.get('type')
        const filterValue = filters.get(filterType)

        switch (filterType) {
            case 'score': {
                const minValue = filter.get('minValue')
                const maxValue = filter.get('maxValue')
                const reverse = filter.get('reverse')
                const variant = filter.get('variant')

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
                                return {}
                        }
                    }
                )
                return (
                    <SelectFilter
                        key={filterType}
                        plural="scores"
                        singular="score"
                        onChange={handleFilterChange('score')}
                        value={filters.get('score', fromJS([])).toJS()}
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
                const options = filter.get('options')
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
                        value={filters.get('channels', fromJS([])).toJS()}
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
                        value={filters.get('tags', fromJS([])).toJS()}
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
                        value={filters.get('agents', fromJS([])).toJS()}
                    >
                        <DropdownItem header className={css.dropdownHeader}>
                            Teams
                        </DropdownItem>
                        {teams.map((team) => (
                            <SelectFilter.Group
                                key={`team-${team.value}`}
                                items={team.members}
                                label={team.label}
                                value={team.value}
                            />
                        ))}
                        <DropdownItem divider className={css.dropdownDivider} />
                        <DropdownItem header className={css.dropdownHeader}>
                            Users
                        </DropdownItem>
                        {agents.map((agent) => (
                            <SelectFilter.Item
                                key={`agent-${agent.value}`}
                                label={agent.label}
                                value={agent.value}
                            />
                        ))}
                    </SelectFilter>
                )
            case 'integrations': {
                const options = filter.get('options', fromJS({}))
                const allowedTypes = options.get('allowedTypes')
                const data = allowedTypes
                    ? integrations.filter((integration) =>
                          allowedTypes.includes(integration.type)
                      )
                    : integrations

                return (
                    <SelectFilter
                        key={filterType}
                        plural="integrations"
                        singular="integration"
                        isMultiple={options.get('isMultiple', true)}
                        isRequired={options.get('isRequired', false)}
                        onChange={handleFilterChange('integrations')}
                        value={filters.get('integrations', fromJS([])).toJS()}
                    >
                        {data.map((integration) => (
                            <SelectFilter.Item
                                key={integration.id}
                                label={integration.name}
                                value={integration.id}
                            />
                        ))}
                    </SelectFilter>
                )
            }
            case 'period':
                return (
                    <PeriodPicker
                        key={filterType}
                        startDatetime={moment(
                            filterValue.get('start_datetime')
                        )}
                        endDatetime={moment(filterValue.get('end_datetime'))}
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
                                window.open(config.get('url'), '_blank').focus()
                            }}
                        >
                            Learn More{' '}
                            <i className="material-icons">arrow_forward</i>
                        </Button>
                    </PopoverModal>
                </h1>
            ) : (
                config.get('name')
            ),
        [config]
    )

    return (
        <PageHeader title={pageTitle} className="mb-0">
            <div className="d-flex flex-wrap float-right">
                {config
                    .get('filters')
                    .map((filter) => renderFilterInput(filter))}
            </div>
        </PageHeader>
    )
}

function getChannels() {
    return (CHANNELS: any).map((channel) => ({
        label: _upperFirst(channel.replaceAll('-', ' ')),
        value: channel,
    }))
}

const mapStateToProps = (state: Object, props: Props) => {
    const view = props.match.params.view
    const config = statViewsConfig.get(view)

    return {
        tags: state.entities.tags,
        integrations: getIntegrations(state).toJS(),
        channels: getChannels(),
        agents: getAgents(state)
            .map((agent) => ({
                label: getDisplayName(agent),
                value: agent.get('id'),
            }))
            .toJS(),
        filters: getViewFilters(props.match.params.view)(state),
        config,
        teams: getTeams(state)
            .map((team) => ({
                label: _capitalize(team.get('name')),
                value: team.get('id'),
                members: team
                    .get('members')
                    .map((user) => user.get('id'))
                    .toJS(),
            }))
            .toJS(),
    }
}

const actions = {
    mergeStatsFilters,
    tagsFetched,
    notify,
}

export default withRouter(
    connect(mapStateToProps, actions)(StatsFiltersContainer)
)
