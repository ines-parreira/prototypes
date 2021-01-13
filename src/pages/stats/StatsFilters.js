// @flow
import {fromJS, type List} from 'immutable'
import _capitalize from 'lodash/capitalize'
import _debounce from 'lodash/debounce'
import moment from 'moment'
import React from 'react'
import {connect} from 'react-redux'
import _upperFirst from 'lodash/upperFirst'
import {withRouter} from 'react-router'
import {DropdownItem} from 'reactstrap'

import {views as statViewsConfig} from '../../config/stats.tsx'
import {mergeStatsFilters} from '../../state/stats/actions.ts'
import {fieldEnumSearch} from '../../state/views/actions.ts'
import PageHeader from '../common/components/PageHeader.tsx'
import TagDropdownMenu from '../common/components/TagDropdownMenu/TagDropdownMenu'
import {getViewFilters} from '../../state/stats/selectors.ts'
import {getTags} from '../../state/tags/selectors.ts'
import {getIntegrations} from '../../state/integrations/selectors.ts'
import {CHANNELS} from '../../config/ticket.ts'
import {getAgents} from '../../state/agents/selectors.ts'
import {getDisplayName} from '../../state/customers/helpers.ts'
import {getTeams} from '../../state/teams/selectors.ts'

import Popover from '../common/components/Popover'
import withCancellableRequest from '../common/utils/withCancellableRequest'

import PeriodPicker from './common/PeriodPicker'
import SearchableSelectField from './common/SearchableSelectField'
import SelectFilter from './common/SelectFilter.tsx'

type Props = {
    params: Object,
    config: Object,
    channels: any[],
    agents: any[],
    tags: any[],
    integrations: any[],
    stats: Object,
    filters: Object,
    fetchStat: (any, any, any) => Promise<*>,
    fieldEnumSearchCancellable: (
        field: Map<*, *>,
        query: string
    ) => Promise<?List<*>>,
    mergeStatsFilters: typeof mergeStatsFilters,
    teams: {label: string, value: string, members: string[]}[],
}

type State = {
    tags: any[],
    integrations: any[],
}

export class StatsFilters extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            tags: props.tags,
            integrations: props.integrations,
        }
    }

    _handleFilterChange = (filterName: string) => {
        return (values: any) => {
            this.props.mergeStatsFilters(fromJS({[filterName]: values}))
        }
    }

    _onSearchTags = _debounce((search) => {
        const {fieldEnumSearchCancellable} = this.props
        const field = fromJS({
            filter: {type: 'tag'},
        })

        fieldEnumSearchCancellable(field, search).then((data) => {
            if (!data) {
                return
            }
            this.setState({
                tags: data.toJS(),
            })
        })
    }, 300)

    _makeInputControl = (name: string) => {
        const {filters} = this.props

        return {
            value: filters.get(name, fromJS([])).toJS(),
            onChange: this._handleFilterChange(name),
        }
    }

    _renderFilterInput = (filterType: string) => {
        const {agents, config, filters, teams} = this.props
        const filterValue = filters.get(filterType)
        const filterConfig = config
            .get('filters')
            .find((filter) => filter.get('type') === filterType)

        switch (filterType) {
            case 'score': {
                const minValue = filterConfig.get('minValue')
                const maxValue = filterConfig.get('maxValue')
                const reverse = filterConfig.get('reverse')
                const variant = filterConfig.get('variant')
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="scores"
                        singular="score"
                        items={Array.from(
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
                        )}
                        input={this._makeInputControl('score')}
                    />
                )
            }
            case 'channels': {
                const options = filterConfig.get('options')
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="channels"
                        singular="channel"
                        items={
                            options
                                ? this.props.channels.filter((channel) =>
                                      options.includes(channel.value)
                                  )
                                : this.props.channels
                        }
                        input={this._makeInputControl('channels')}
                    />
                )
            }
            case 'tags':
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="tags"
                        singular="tag"
                        items={this.state.tags.map((tag) => ({
                            label: tag.name,
                            value: tag.id,
                        }))}
                        input={this._makeInputControl('tags')}
                        onSearch={this._onSearchTags}
                        dropdownMenu={(props) => <TagDropdownMenu {...props} />}
                    />
                )
            case 'agents':
                return (
                    <SelectFilter
                        key={filterType}
                        plural="agents"
                        singular="agent"
                        onChange={this._handleFilterChange('agents')}
                        value={filters.get('agents', fromJS([])).toJS()}
                    >
                        <DropdownItem header>Teams</DropdownItem>
                        {teams.map((team) => (
                            <SelectFilter.Group
                                key={`team-${team.value}`}
                                items={team.members}
                                label={team.label}
                                value={team.value}
                            />
                        ))}
                        <DropdownItem header>Users</DropdownItem>
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
                const options = filterConfig.get('options')
                const integrations = options
                    ? this.props.integrations.filter((integration) =>
                          options.includes(integration.type)
                      )
                    : this.props.integrations

                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="integrations"
                        singular="integration"
                        items={integrations.map((integration) => ({
                            label: integration.name,
                            value: integration.id,
                        }))}
                        input={this._makeInputControl('integrations')}
                        multiple={false}
                        required
                    />
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
                        onChange={this._handleFilterChange('period')}
                    />
                )
            default:
                console.error(
                    `[stats] Cannot render input for this unknown filter type: ${filterType}`
                )
        }
    }

    render() {
        const {config} = this.props
        const configFilterTypes = config
            .get('filters')
            .map((filter) => filter.get('type'))
        let pageTitle = config.get('name')

        if (config.get('description')) {
            pageTitle = (
                <h1 className="align-items-center">
                    <span>{pageTitle}</span>
                    <Popover>
                        <p>{config.get('description')}</p>
                        <a
                            href={config.get('url')}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {`Go to ${pageTitle.toLowerCase()} documentation`}
                        </a>
                        .
                    </Popover>
                </h1>
            )
        }

        return (
            <PageHeader title={pageTitle} className="mb-0">
                <div className="d-flex flex-wrap float-right">
                    {configFilterTypes.map((filterType) =>
                        this._renderFilterInput(filterType)
                    )}
                </div>
            </PageHeader>
        )
    }
}

const mapStateToProps = (state: Object, props: Props) => {
    const view = props.params.view
    const config = statViewsConfig.get(view)

    return {
        tags: getTags(state).toJS(),
        integrations: getIntegrations(state).toJS(),
        channels: (CHANNELS: any).map((channel) => ({
            label: _upperFirst(channel.replace('-', ' ')),
            value: channel,
        })),
        agents: getAgents(state)
            .map((agent) => ({
                label: getDisplayName(agent),
                value: agent.get('id'),
            }))
            .toJS(),
        filters: getViewFilters(props.params.view)(state),
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
}

export default withRouter(
    withCancellableRequest(
        'fieldEnumSearchCancellable',
        fieldEnumSearch
    )(connect(mapStateToProps, actions)(StatsFilters))
)
