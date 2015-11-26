import React from 'react'
import { IndexRoute, Route } from 'react-router'

import App from './containers/App'
import Dashboard from './containers/Dashboard'
import RuleContainer from './containers/RuleContainer'

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Dashboard}/>
        <Route path="dashboard" component={Dashboard}/>
        <Route path="rules" component={RuleContainer}/>
    </Route>
)


