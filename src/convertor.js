const { parse } = require('yaml');

const isJobStep = (step) => {
  return ['Task', 'Workflow'].includes(step.Type);
};

const isChoiceStep = (step) => {
  return step.Type === 'Choice';
};

// const isEndStep = (step: Step): step is EndStep => {
//   return [DefinitionNodeType.Succeed, DefinitionNodeType.Fail].includes(step.Type);
// };

const parseWorkflowYaml = (text) => {
  return parse(text);
};

const getPrimitive = (data) => {
  return isJobStep(data)
    ? {
      name: data.Resource,
    }
    : null;
};

const getGlobalInputs = (data) => {
  return Object.entries(data)
    .reduce((acc, [, entry]) => {
      switch (entry.Type) {
        case 'Choice':
          entry.Choices.forEach((choice) => {
            acc.push(choice.Variable);
          });
          break;
        case 'Task':
          Object.entries(entry.Parameters).forEach(([, param]) => {
            acc.push(param);
          });
          break;
        default:
          break;
      }

      return acc;
    }, [])
    .filter((param) => param.match(/^\$\.Input\./))
    .map((param) => param.replace(/^\$\.Input\./, ''))
    .filter((param, index, self) => {
      return self.indexOf(param) === index;
    });
};

const convert = (workflowYaml) => {
  const data = parseWorkflowYaml(workflowYaml);

  const steps = Object.entries(data.Workflow.Steps).map(([Name, step]) => {
    return { ...step, Name };
  });

  const nodes = steps
    .map((step, index, list) => {
      return {
        name: step.Name,
        type: step.Type,
        primitive: getPrimitive(step),
        parameters: Object
          .entries(isJobStep(step) ? step.Parameters : [])
          .map(([key, param]) => ({
            key,
            param,
            isGlobal: !!param.match(/^\$\.Input\./),
          })),
        choices: isChoiceStep(step) ? step.Choices : null,
        default: isChoiceStep(step) ? step.Default : null,
        // The next step after this one is under the key `Next` for all but end
        // steps, and is optional. If omitted, it defaults to the next step in
        // the declaration.
        next: isJobStep(step)
          ? step.Next ?? list[index + 1].Name
          : null,
      };
    });

  const getNodeByName = (name) => (step) => {
    return step.name === name;
  };

  const edges = steps.reduce((acc, step, index, list) => {
    switch (step.Type) {
      case 'Choice':
        return [
          ...acc,
          ...step.Choices.map((choice) => {
            return {
              ...choice,
              from: nodes.find(getNodeByName(step.Name)),
              to: nodes.find(getNodeByName(choice.Next)),
            };
          }),
        ];
      case 'Task':
      case 'Workflow':
        return [
          ...acc,
          {
            from: nodes.find(getNodeByName(step.Name)),
            to: nodes.find(getNodeByName(step.Next ?? list[index + 1].Name)),
          },
        ];
      default:
        return acc;
    }
  }, []);

  return {
    name: data.Workflow.Name,
    status: 'Enabled',
    globalInputs: getGlobalInputs(steps),
    steps: nodes,
    edges,
  };
};

module.exports = {
  convert,
};
