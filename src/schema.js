const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLEnumType,
  GraphQLNonNull,
} = require('graphql');

const workflowYaml = require('./workflowYaml');
const { convert } = require('./convertor');

const StepType = new GraphQLEnumType({
  name: 'StepType',
  values: {
    Task: { value: 'Task' },
    Choice: { value: 'Choice' },
    Workflow: { value: 'Workflow' },
    Succeed: { value: 'Succeed' },
    Fail: { value: 'Fail' },
  },
});

const WorkflowDefinitionPrimitive = new GraphQLObjectType({
  name: 'WorkflowDefinitionPrimitive',
  fields: {
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
  },
});

const WorkflowDefinitionStep = new GraphQLObjectType({
  name: 'WorkflowDefinitionStep',
  fields: () => ({
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    type: {
      type: GraphQLNonNull(StepType),
    },
    resource: {
      type: WorkflowDefinitionPrimitive,
      resolve: (obj) => obj.primitive,
    },
    next: {
      type: WorkflowDefinitionStep,
      resolve: (obj) => {
        return obj.next;
      },
    },
  }),
});

const WorkflowDefinitionEdge = new GraphQLObjectType({
  name: 'WorkflowDefinitionEdge',
  fields: {
    from: {
      name: 'WorkflowDefinitionStep',
      type: GraphQLNonNull(WorkflowDefinitionStep),
    },
    to: {
      name: 'WorkflowDefinitionStep',
      type: GraphQLNonNull(WorkflowDefinitionStep),
    },
    variable: {
      name: 'WorkflowDefinitionEdgeVariable',
      type: GraphQLString,
      resolve: (obj) => obj.Variable,
    },
  },
});

const WorkflowDefinition = new GraphQLObjectType({
  name: 'WorkflowDefinition',
  fields: {
    name: {
      type: GraphQLNonNull(GraphQLString),
      // resolve: (obj) => obj.name, // <---- resolve is optional when keys are the same
    },
    steps: {
      type: GraphQLNonNull(new GraphQLList(GraphQLNonNull(WorkflowDefinitionStep))),
    },
    edges: {
      type: GraphQLNonNull(new GraphQLList(GraphQLNonNull(WorkflowDefinitionEdge))),
    },
  },
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      definition: {
        type: WorkflowDefinition,
        resolve: () => convert(workflowYaml),
      },
    },
  }),
});
