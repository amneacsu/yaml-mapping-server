const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLEnumType,
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
      type: GraphQLString,
    },
  },
});

const WorkflowDefinitionStep = new GraphQLObjectType({
  name: 'WorkflowDefinitionStep',
  fields: {
    name: {
      type: GraphQLString,
    },
    type: {
      type: StepType,
    },
    resource: {
      type: WorkflowDefinitionPrimitive,
      resolve: (obj) => obj.primitive,
    },
  },
});

const WorkflowDefinitionEdge = new GraphQLObjectType({
  name: 'WorkflowDefinitionEdge',
  fields: {
    from: {
      name: 'WorkflowDefinitionStep',
      type: WorkflowDefinitionStep,
    },
    to: {
      name: 'WorkflowDefinitionStep',
      type: WorkflowDefinitionStep,
    },
    variable: {
      name: 'WorkflowDefinitionEdgeVariable',
      type: GraphQLString,
      resolve: (obj) => obj.Variable,
    },
  },
});

const WorkflowDefinition = new GraphQLObjectType({
  name: 'Definition',
  fields: {
    name: {
      type: GraphQLString,
      // resolve: (obj) => obj.name, // <---- resolve is optional when keys are the same
    },
    steps: {
      type: new GraphQLList(WorkflowDefinitionStep),
    },
    edges: {
      type: new GraphQLList(WorkflowDefinitionEdge),
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
