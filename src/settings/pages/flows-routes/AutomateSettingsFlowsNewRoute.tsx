import { AGENT_ROLE } from 'config/user'
import WorkflowEditorViewContainer from 'pages/automate/workflows/editor/WorkflowEditorViewContainer'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

export const AutomateSettingsFlowsNewRoute = withUserRoleRequired(
    WorkflowEditorViewContainer,
    AGENT_ROLE,
)
