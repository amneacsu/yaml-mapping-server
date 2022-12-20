module.exports = `
Workflow:
  Name: FakeComplexWorkflow
  Steps:
    ChooseFlow:
      Type: Choice
      Choices:
        - Variable: $.Input.callNestedWorkflow
          StringEquals: "true"
          Next: IngestWorkflow
        - Variable: $.Input.callNestedWorkflow
          StringEquals: "false"
          Next: EnsureAccess
      Default: Failed
    EnsureAccess:
      Type: Task
      Resource: FakeEnsureAccess
      Parameters:
        fileUrl: $.Input.fileUrl
    PrintEnsureOutput:
      Type: Task
      Resource: PrintMessage
      Parameters:
        message: $.EnsureAccess.fileId
    ProbeFile:
      Type: Task
      Resource: FakeProbeFile
      Parameters:
        fileId: $.EnsureAccess.fileId
      Next: Done
    IngestWorkflow:
      Type: Workflow
      Resource: FakeIngestWorkflow
      Parameters:
        fileUrl: $.Input.fileUrl
    PrintIngestOutput:
      Type: Task
      Resource: PrintMessage
      Parameters:
        message: $.IngestWorkflow.ProbeFile.status
      Next: Done
    Done:
      Type: Succeed
    Failed:
      Type: Fail
`;
