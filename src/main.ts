import { GraphQLClient, gql } from "graphql-request";
import axios from "axios";

/**
 * This script creates the following entities:
 * Component Templates: Microservice, Library, Infrastructure
 * Components:
 *      - Microservices: Order Service, Shopping Cart Service, Payment Service
 *      - Libraries: Express, TypeORM, Winston
 *      - Infrastructures: Kubernetes
 * Relation Templates: Microservice -> Microservice (service calls), Microservice -> Infrastructure (hosted on), Microservice -> Library (includes)
 * Relations:
 *     - Shopping Cart Service -> Order Service (service calls)
 *     - Order Service -> Payment Service (service calls)
 *     - Shopping Cart Service -> Express (includes)
 *     - Shopping Cart Service -> TypeORM (includes)
 *     - Order Service -> Express (includes)
 *     - Order Service -> Winston (includes)
 *     - Shopping Cart Service -> Kubernetes (hosted on)
 *     - Order Service -> Kubernetes (hosted on)
 */

const ignoreRelations = false;

const createMicroserviceComponentTemplateMutation = gql`
  mutation CreateComponentTemplate(
    $componentTemplateDescription: String!
    $componentTemplateName: String!
    $componentVersionTemplateDescription: String!
    $componentVersionTemplateName: String!
    $shapeType: ShapeType!
  ) {
    createComponentTemplate(
      input: {
        description: $componentTemplateDescription
        name: $componentTemplateName
        componentVersionTemplate: {
          description: $componentVersionTemplateDescription
          name: $componentVersionTemplateName
        }
        shapeType: $shapeType
        stroke: {}
      }
    ) {
      componentTemplate {
        id
      }
    }
  }
`;
const createProjectMutation = gql`
  mutation CreateProject(
    $projectDescription: String!
    $projectName: String!
    $repositoryURL: URL!
  ) {
    createProject(
      input: {
        description: $projectDescription
        name: $projectName
        repositoryURL: $repositoryURL
      }
    ) {
      project {
        id
      }
    }
  }
`;
const createComponentMutation = gql`
  mutation CreateComponent(
    $componentName: String!
    $componentDescription: String!
    $templateId: ID!
    $componentVersion: String!
    $componentVersionDescription: String!
    $componentVersionName: String!
  ) {
    createComponent(
      input: {
        name: $componentName
        description: $componentDescription
        template: $templateId
        versions: [
          {
            version: $componentVersion
            description: $componentVersionDescription
            name: $componentVersionName
            templatedFields: []
          }
        ]
        templatedFields: []
      }
    ) {
      component {
        versions {
          nodes {
            id
          }
        }
        id
      }
    }
  }
`;
const createRelationTemplateMutation = gql`
  mutation CreateRelationTemplate(
    $name: String!
    $description: String!
    $fromId: [ID!]!
    $toId: [ID!]!
  ) {
    createRelationTemplate(
      input: {
        relationConditions: [
          {
            from: $fromId
            to: $toId
            interfaceSpecificationDerivationConditions: []
          }
        ]
        description: $description
        name: $name
        markerType: ARROW
      }
    ) {
      relationTemplate {
        id
      }
    }
  }
`;
const createInterfaceSpecificationTemplateMutation = gql`
  mutation CreateInterfaceSpecificationTemplate(
    $name: String!
    $description: String!
    $componentTemplates: [ID!]!
  ) {
    createInterfaceSpecificationTemplate(
      input: {
        name: $name
        description: $description
        canBeVisibleOnComponents: $componentTemplates
        canBeInvisibleOnComponents: $componentTemplates
        interfaceTemplate: { name: $name, description: $description }
        interfacePartTemplate: { name: $name, description: $description }
        interfaceSpecificationVersionTemplate: {
          name: $name
          description: $description
        }
        interfaceDefinitionTemplate: { name: $name, description: $description }
        shapeType: CIRCLE
        stroke: {}
      }
    ) {
      interfaceSpecificationTemplate {
        id
      }
    }
  }
`;
const createRelationMutation = gql`
  mutation CreateRelation($startId: ID!, $endId: ID!, $templateId: ID!) {
    createRelation(
      input: {
        start: $startId
        end: $endId
        template: $templateId
        templatedFields: []
      }
    ) {
      relation {
        id
      }
    }
  }
`;
const addComponentVersionToProjectMutation = gql`
  mutation AddComponentVersionToProject(
    $projectId: ID!
    $componentVersionId: ID!
  ) {
    addComponentVersionToProject(
      input: { project: $projectId, componentVersion: $componentVersionId }
    ) {
      project {
        id
      }
    }
  }
`;
const createIssueTemplateMutation = gql`
  mutation CreateIssueTemplate(
    $name: String!
    $description: String!
    $issueTypes: [IssueTypeInput!]!
    $issueStates: [IssueStateInput!]!
    $issuePriorities: [IssuePriorityInput!]!
    $relationTypes: [IssueRelationTypeInput!]!
    $assignmentTypes: [AssignmentTypeInput!]!
  ) {
    createIssueTemplate(
      input: {
        name: $name
        description: $description
        issueTypes: $issueTypes
        issueStates: $issueStates
        issuePriorities: $issuePriorities
        relationTypes: $relationTypes
        assignmentTypes: $assignmentTypes
      }
    ) {
      issueTemplate {
        id
        issueTypes {
          nodes {
            id
          }
        }
        issueStates {
          nodes {
            id
          }
        }
        issuePriorities {
          nodes {
            id
          }
        }
        relationTypes {
          nodes {
            id
          }
        }
        assignmentTypes {
          nodes {
            id
          }
        }
      }
    }
  }
`;
const createIssueMutation = gql`
  mutation createIssue(
    $state: ID!
    $template: ID!
    $title: String!
    $body: String!
    $type: ID!
    $trackable: ID!
  ) {
    createIssue(
      input: {
        state: $state
        template: $template
        title: $title
        body: $body
        type: $type
        templatedFields: []
        trackables: [$trackable]
      }
    ) {
      issue {
        id
      }
    }
  }
`;
const getComponentsQuery = gql`
  query getComponents {
    components {
      nodes {
        id
      }
    }
  }
`;
const createIssueRelationMutation = gql`
  mutation createIssueRelation(
    $issue: ID!
    $relatedIssue: ID!
    $issueRelationType: ID
  ) {
    createIssueRelation(
      input: {
        issue: $issue
        relatedIssue: $relatedIssue
        issueRelationType: $issueRelationType
      }
    ) {
      issueRelation {
        id
      }
    }
  }
`;
const createLabelMutation = gql`
  mutation createLabel(
    $trackables: [ID!]!
    $color: String!
    $name: String!
    $description: String!
  ) {
    createLabel(
      input: {
        trackables: $trackables
        color: $color
        name: $name
        description: $description
      }
    ) {
      label {
        id
      }
    }
  }
`;
const addLabelToIssueMutation = gql`
  mutation addLabelToIssue($issue: ID!, $label: ID!) {
    addLabelToIssue(input: { issue: $issue, label: $label }) {
      addedLabelEvent {
        id
      }
    }
  }
`;
const createAssignmentMutation = gql`
  mutation createAssignment($user: ID!, $issue: ID!, $assignmentType: ID) {
    createAssignment(
      input: { assignmentType: $assignmentType, user: $user, issue: $issue }
    ) {
      assignment {
        id
      }
    }
  }
`;
const createIssueCommentMutation = gql`
  mutation createIssueComment($body: String!, $issue: ID!, $answers: ID) {
    createIssueComment(
      input: { body: $body, issue: $issue, answers: $answers }
    ) {
      issueComment {
        id
      }
    }
  }
`;

const createInterfaceSpecificationMutation = gql`
  mutation CreateInterfaceSpecification(
    $component: ID!
    $template: ID!
    $name: String!
    $description: String!
    $versions: [InterfaceSpecificationVersionInput!]!
  ) {
    createInterfaceSpecification(
      input: {
        component: $component
        template: $template
        name: $name
        description: $description
        versions: $versions
        templatedFields: []
      }
    ) {
      interfaceSpecification {
        id
        versions {
          nodes {
            id
          }
        }
      }
    }
  }
`;

const addInterfaceMutation = gql`
  mutation AddInterface($component: ID!, $interface: ID!) {
    addInterfaceSpecificationVersionToComponentVersion(
      input: {
        componentVersion: $component
        interfaceSpecificationVersion: $interface
        visible: true
        invisible: false
      }
    ) {
      componentVersion {
        id
      }
    }
  }
`;

async function createRelation(
  client: GraphQLClient,
  variables: {
    startId: string;
    endId: string;
    templateId: string;
  }
) {
  try {
    const response: any = await client.request(
      createRelationMutation,
      variables
    );
    console.log("Created new relation:", response.createRelation.relation.id);
    return response.createRelation.relation.id;
  } catch (error) {
    console.error("Error creating relation:", error);
    throw error;
  }
}
async function createComponentTemplate(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createMicroserviceComponentTemplateMutation,
      variables
    );
    console.log(
      "Created component template with ID:",
      response.createComponentTemplate.componentTemplate.id
    );
    return response.createComponentTemplate.componentTemplate.id;
  } catch (error) {
    console.error("Error creating component template:", error);
  }
}

async function createInterfaceSpecificationTemplate(
  client: GraphQLClient,
  variables: any
) {
  try {
    const response: any = await client.request(
      createInterfaceSpecificationTemplateMutation,
      variables
    );
    console.log(
      "Created interface specification template with ID:",
      response.createInterfaceSpecificationTemplate
        .interfaceSpecificationTemplate.id
    );
    return response.createInterfaceSpecificationTemplate
      .interfaceSpecificationTemplate.id;
  } catch (error) {
    console.error("Error creating interface specification template:", error);
  }
}
async function createProject(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createProjectMutation,
      variables
    );
    console.log("Created new project:", response.createProject.project.id);
    return response.createProject.project.id;
  } catch (error) {
    console.error("Error creating project:", error);
  }
}
async function createComponent(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createComponentMutation,
      variables
    );
    console.log(
      "Created new component version:",
      response.createComponent.component.versions.nodes[0].id
    );
    return [
      response.createComponent.component.versions.nodes[0].id,
      response.createComponent.component.id,
    ];
  } catch (error) {
    console.error("Error creating component version:", error);
  }
}
async function createRelationTemplate(
  client: GraphQLClient,
  variables: {
    name: string;
    description: string;
    fromId: [string];
    toId: [string];
  }
) {
  const createRelationTemplateResponse = await client.request<{
    createRelationTemplate: {
      relationTemplate: {
        id: string;
      };
    };
  }>(createRelationTemplateMutation, variables);

  console.log(
    "Created new relation template:",
    createRelationTemplateResponse.createRelationTemplate.relationTemplate.id
  );
  return createRelationTemplateResponse.createRelationTemplate.relationTemplate
    .id;
}
async function addComponentVersionToProject(
  client: GraphQLClient,
  variables: any
) {
  try {
    const response: any = await client.request(
      addComponentVersionToProjectMutation,
      variables
    );
    console.log(
      "Added component version to project:",
      response.addComponentVersionToProject.project.id
    );
    return response.addComponentVersionToProject.project.id;
  } catch (error) {
    console.error("Error adding component version:", error);
  }
}

async function createIssueTemplate(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createIssueTemplateMutation,
      variables
    );
    console.log(
      "Created issue template with ID:",
      response.createIssueTemplate.issueTemplate.id
    );
    return response.createIssueTemplate.issueTemplate;
  } catch (error) {
    console.error("Error creating issue template:", error);
  }
}

async function createIssue(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(createIssueMutation, variables);
    console.log("Created issue with ID:", response.createIssue.issue.id);
    return response.createIssue.issue.id;
  } catch (error) {
    console.error("Error creating issue:", error);
  }
}

async function getComponents(client: GraphQLClient) {
  try {
    const response: any = await client.request(getComponentsQuery);
    return response.components.nodes.map((node: any) => node.id);
  } catch (error) {
    console.error("Error getting components:", error);
    throw error;
  }
}

async function createIssueRelation(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createIssueRelationMutation,
      variables
    );
    console.log(
      "Created issue relation with ID:",
      response.createIssueRelation.issueRelation.id
    );
    return response.createIssueRelation.issueRelation.id;
  } catch (error) {
    console.error("Error creating issue relation:", error);
  }
}

async function createLabel(
  client: GraphQLClient,
  name: string,
  description: string,
  color: string,
  trackables: string[]
) {
  try {
    const response: any = await client.request(createLabelMutation, {
      name,
      description,
      color,
      trackables,
    });
    console.log("Created label with ID:", response.createLabel.label.id);
    return response.createLabel.label.id;
  } catch (error) {
    console.error("Error creating label:", error);
  }
}

async function addLabelToIssue(
  client: GraphQLClient,
  label: string,
  issue: string
) {
  try {
    const response: any = await client.request(addLabelToIssueMutation, {
      label,
      issue,
    });
    console.log("Added label to issue:", issue);
  } catch (error) {
    console.error("Error adding label to issue:", error);
  }
}

async function createAssignment(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createAssignmentMutation,
      variables
    );
    console.log(
      "Created assignment with ID:",
      response.createAssignment.assignment.id
    );
    return response.createAssignment.assignment.id;
  } catch (error) {
    console.error("Error creating assignment:", error);
  }
}

async function createIssueComment(client: GraphQLClient, variables: any) {
  try {
    const response: any = await client.request(
      createIssueCommentMutation,
      variables
    );
    console.log(
      "Created issue comment with ID:",
      response.createIssueComment.issueComment.id
    );
    return response.createIssueComment.issueComment.id;
  } catch (error) {
    console.error("Error creating issue comment:", error);
  }
}

async function createInterfaceSpecification(
  client: GraphQLClient,
  component: string,
  template: string,
  name: string,
  description: string,
  versions: [string, string[]][]
) {
  try {
    const response: any = await client.request(
      createInterfaceSpecificationMutation,
      {
        component,
        template,
        name,
        description,
        versions: versions.map(([version, parts]) => ({
          version,
          description: "",
          name: `${name}-${version}`,
          templatedFields: [],
          parts: parts.map((part) => ({
            name: part,
            description: "",
            templatedFields: [],
          })),
        })),
      }
    );
    return response.createInterfaceSpecification.interfaceSpecification;
  } catch (error) {
    console.error("Error creating interface specification:", error);
  }
}

async function addInterface(
  client: GraphQLClient,
  componentVersion: string,
  interfaceSpecificationVersion: string
) {
  try {
    await client.request(addInterfaceMutation, {
      component: componentVersion,
      interface: interfaceSpecificationVersion,
    });
    console.log("Added interface to component version:", componentVersion);
  } catch (error) {
    console.error("Error adding interface to component:", error);
  }
}

async function main() {
  const endpoint = "http://localhost:8080/graphql";
  const token = process.argv[2];

  const testUsers = await Promise.all(
    [
      "SapphireDragon27",
      "LuckyDuckling91",
      "WhisperingShadow",
      "ElectricJaguar",
      "RainbowDreamer42",
    ].map((username) => createUserAndGetID(username, token))
  );

  const client = new GraphQLClient(endpoint, {
    headers: {
      authorization: `${token}`,
    },
  });

  const componentTemplateIDs = await createComponentTemplates(client);
  const interfaceTemplateIDs = await createInterfaceTemplates(
    client,
    componentTemplateIDs
  );
  const relationTemplateIDs = await createRelationTemplates(
    componentTemplateIDs,
    client
  );
  const issueTemplate = await createDefaultIssueTemplate(client);

  const projectCount = 1;
  const issueCount = 10;

  for (let i = 0; i < projectCount; i++) {
    const microserviceIDs = await createMicroserviceComponents(
      componentTemplateIDs.microserviceComponentTemplateID,
      interfaceTemplateIDs.restInterfaceTemplateId,
      client
    );
    const libraryIDs = await createLibraryComponents(
      componentTemplateIDs.libraryTemplateID,
      client
    );
    const infrastructureIDs = await createInfrastructureComponents(
      componentTemplateIDs.infrastructureTemplateID,
      client
    );
    if (!ignoreRelations) {
      const service2ServiceRelationIDs = await createService2ServiceRelations(
        microserviceIDs,
        relationTemplateIDs,
        client
      );
      const service2LibraryRelationIDs = await createService2LibraryRelations(
        microserviceIDs,
        libraryIDs,
        relationTemplateIDs,
        client
      );
      const service2InfrastructureRelationIDs =
        await createService2InfrastructureRelations(
          microserviceIDs,
          infrastructureIDs,
          relationTemplateIDs,
          client
        );
    }

    const testProjectInput = {
      projectDescription: "Test project",
      projectName: "test-project",
      repositoryURL: "https://github.com/test-account/test-project",
    };
    const projectID = await createProject(client, testProjectInput);
    await addComponentsToProject(
      projectID,
      microserviceIDs,
      infrastructureIDs,
      libraryIDs,
      client
    );
  }
  const components = await getComponents(client);
  const issues = [];
  const labels = await createDefaultLabels(client, components);
  for (const componentId of components) {
    for (let i = 0; i < issueCount; i++) {
      const issueId = await createRandomIssue(
        client,
        componentId,
        issueTemplate,
        labels,
        testUsers
      );
      issues.push(issueId);
    }
  }
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[random(0, issues.length - 1)];
    const relatedIssue = issues[random(0, issues.length - 1)];
    await createRandomIssueRelation(client, issue, relatedIssue, issueTemplate);
  }
}

main().catch((error) => console.error("Error:", error));

async function addComponentsToProject(
  projectID: any,
  microserviceIDs: {
    orderServiceIDV1: any;
    shoppingCartServiceIDV1: any;
    paymentServiceIDV1: any;
  },
  infrastructureIDs: { k8ID: any },
  libraryIDs: { expressLibID: any; typeORMLibID: any; winstonLibID: any },
  client: GraphQLClient
) {
  const addOrderServiceVersionToProjectInput = {
    projectId: projectID,
    componentVersionId: microserviceIDs.orderServiceIDV1,
  };
  const addShoppingCartServiceVersionToProjectInput = {
    projectId: projectID,
    componentVersionId: microserviceIDs.shoppingCartServiceIDV1,
  };
  const addPaymentServiceVersionToProjectInput = {
    projectId: projectID,
    componentVersionId: microserviceIDs.paymentServiceIDV1,
  };
  const addK8VersionToProjectInput = {
    projectId: projectID,
    componentVersionId: infrastructureIDs.k8ID,
  };
  const addExpressVersionToProjectInput = {
    projectId: projectID,
    componentVersionId: libraryIDs.expressLibID,
  };
  const addTypeORMVersionToProjectInput = {
    projectId: projectID,
    componentVersionId: libraryIDs.typeORMLibID,
  };
  const addWinstonVersionToProjectInput = {
    projectId: projectID,
    componentVersionId: libraryIDs.winstonLibID,
  };
  await addComponentVersionToProject(
    client,
    addOrderServiceVersionToProjectInput
  );
  await addComponentVersionToProject(
    client,
    addShoppingCartServiceVersionToProjectInput
  );
  await addComponentVersionToProject(
    client,
    addPaymentServiceVersionToProjectInput
  );
  await addComponentVersionToProject(client, addK8VersionToProjectInput);
  await addComponentVersionToProject(client, addExpressVersionToProjectInput);
  await addComponentVersionToProject(client, addTypeORMVersionToProjectInput);
  await addComponentVersionToProject(client, addWinstonVersionToProjectInput);
}

async function createService2InfrastructureRelations(
  microserviceIDs: {
    orderServiceIDV1: any;
    shoppingCartServiceIDV1: any;
    paymentServiceIDV1: any;
  },
  infrastructureIDs: { k8ID: any },
  relationTemplateIDs: {
    service2serviceRelationTemplateID: string;
    service2librabryRelationTemplateID: string;
    service2infrastructureRelationTemplateID: string;
  },
  client: GraphQLClient
) {
  const shoppingCart2K8RelationInput = {
    startId: microserviceIDs.shoppingCartServiceIDV1,
    endId: infrastructureIDs.k8ID,
    templateId: relationTemplateIDs.service2infrastructureRelationTemplateID,
  };

  const order2K8RelationInput = {
    startId: microserviceIDs.orderServiceIDV1,
    endId: infrastructureIDs.k8ID,
    templateId: relationTemplateIDs.service2infrastructureRelationTemplateID,
  };

  const shoppingCart2K8RelationID = await createRelation(
    client,
    shoppingCart2K8RelationInput
  );
  const order2K8RelationID = await createRelation(
    client,
    order2K8RelationInput
  );

  return {
    shoppingCart2K8RelationID,
    order2K8RelationID,
  };
}
async function createService2LibraryRelations(
  microserviceIDs: {
    orderServiceIDV1: any;
    shoppingCartServiceIDV1: any;
    paymentServiceIDV1: any;
  },
  libraryIDs: { expressLibID: any; typeORMLibID: any; winstonLibID: any },
  relationTemplateIDs: {
    service2serviceRelationTemplateID: string;
    service2librabryRelationTemplateID: string;
    service2infrastructureRelationTemplateID: string;
  },
  client: GraphQLClient
) {
  const shoppingCart2expressRelationInput = {
    startId: microserviceIDs.shoppingCartServiceIDV1,
    endId: libraryIDs.expressLibID,
    templateId: relationTemplateIDs.service2librabryRelationTemplateID,
  };
  const order2expressRelationInput = {
    startId: microserviceIDs.orderServiceIDV1,
    endId: libraryIDs.expressLibID,
    templateId: relationTemplateIDs.service2librabryRelationTemplateID,
  };
  const shoppingCart2typeORMRelationInput = {
    startId: microserviceIDs.shoppingCartServiceIDV1,
    endId: libraryIDs.typeORMLibID,
    templateId: relationTemplateIDs.service2librabryRelationTemplateID,
  };
  const order2winstonRelationInput = {
    startId: microserviceIDs.orderServiceIDV1,
    endId: libraryIDs.winstonLibID,
    templateId: relationTemplateIDs.service2librabryRelationTemplateID,
  };

  const shoppingCart2expressRelationID = await createRelation(
    client,
    shoppingCart2expressRelationInput
  );
  const order2expressRelationID = await createRelation(
    client,
    order2expressRelationInput
  );
  const shoppingCart2typeORMRelationID = await createRelation(
    client,
    shoppingCart2typeORMRelationInput
  );
  const order2winstonRelationID = await createRelation(
    client,
    order2winstonRelationInput
  );

  return {
    shoppingCart2expressRelationID,
    order2expressRelationID,
    shoppingCart2typeORMRelationID,
    order2winstonRelationID,
  };
}
async function createService2ServiceRelations(
  microserviceIDs: {
    orderServiceIDV1: any;
    shoppingCartServiceIDV1: any;
    paymentServiceIDV1: any;
  },
  relationTemplateIDs: {
    service2serviceRelationTemplateID: string;
    service2librabryRelationTemplateID: string;
    service2infrastructureRelationTemplateID: string;
  },
  client: GraphQLClient
) {
  const shoppingCart2orderRelationInput = {
    startId: microserviceIDs.shoppingCartServiceIDV1,
    endId: microserviceIDs.orderServiceIDV1,
    templateId: relationTemplateIDs.service2serviceRelationTemplateID,
  };
  const order2paymentRelationInput = {
    startId: microserviceIDs.orderServiceIDV1,
    endId: microserviceIDs.paymentServiceIDV1,
    templateId: relationTemplateIDs.service2serviceRelationTemplateID,
  };

  const shoppingCart2orderRelationID = await createRelation(
    client,
    shoppingCart2orderRelationInput
  );
  const order2paymentRelationID = await createRelation(
    client,
    order2paymentRelationInput
  );
  return {
    shoppingCart2orderRelationID,
    order2paymentRelationID,
  };
}
async function createRelationTemplates(
  componentTemplateIDs: {
    microserviceComponentTemplateID: any;
    libraryTemplateID: any;
    infrastructureTemplateID: any;
  },
  client: GraphQLClient
) {
  const service2ServiceRelationTemplateVariables = {
    name: "service2service-relation-template",
    description: "Service2Service Relation",
    fromId: componentTemplateIDs.microserviceComponentTemplateID,
    toId: componentTemplateIDs.microserviceComponentTemplateID,
  };
  const microserviceIncludesLibraryRelationTemplateVariables = {
    name: "microservice-includes-library-relation-template",
    description: "Microservice includes Library Relation",
    fromId: componentTemplateIDs.microserviceComponentTemplateID,
    toId: componentTemplateIDs.libraryTemplateID,
  };
  const microserviceHostedOnInfrastructureRelationTemplateVariables = {
    name: "microservice-hosted-on-infrastructure-relation-template",
    description: "Microservice hosted on Infrastructure Relation",
    fromId: componentTemplateIDs.microserviceComponentTemplateID,
    toId: componentTemplateIDs.infrastructureTemplateID,
  };

  const service2serviceRelationTemplateID = await createRelationTemplate(
    client,
    service2ServiceRelationTemplateVariables
  );
  const service2librabryRelationTemplateID = await createRelationTemplate(
    client,
    microserviceIncludesLibraryRelationTemplateVariables
  );
  const service2infrastructureRelationTemplateID = await createRelationTemplate(
    client,
    microserviceHostedOnInfrastructureRelationTemplateVariables
  );

  return {
    service2serviceRelationTemplateID,
    service2librabryRelationTemplateID,
    service2infrastructureRelationTemplateID,
  };
}
async function createInfrastructureComponents(
  infrastructureTemplateID: string,
  client: GraphQLClient
) {
  const kubernetesComponentVariables = {
    componentName: "Kubernetes",
    componentDescription:
      "An open-source container-orchestration system for automating deployment, scaling, and management of containerized applications.",
    templateId: infrastructureTemplateID,
    componentVersion: "1.22.0",
    componentVersionDescription: "Kubernetes v1.22.0",
    componentVersionName: "kubernetes-v1.22.0",
  };

  const k8ID = await createComponent(client, kubernetesComponentVariables);
  return {
    k8ID: k8ID![0],
  };
}
async function createLibraryComponents(
  libraryTemplateID: string,
  client: GraphQLClient
) {
  const expressComponentVariables = {
    componentName: "Express",
    componentDescription:
      "Fast, unopinionated, minimalist web framework for Node.js",
    templateId: libraryTemplateID,
    componentVersion: "4.17.1",
    componentVersionDescription: "Express.js v4.17.1",
    componentVersionName: "express-v4.17.1",
  };

  const typeormComponentVariables = {
    componentName: "TypeORM",
    componentDescription:
      "ORM for TypeScript and JavaScript (ES7, ES6, ES5). Supports MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, WebSQL databases.",
    templateId: libraryTemplateID,
    componentVersion: "0.2.41",
    componentVersionDescription: "TypeORM v0.2.41",
    componentVersionName: "typeorm-v0.2.41",
  };

  const winstonComponentVariables = {
    componentName: "Winston",
    componentDescription: "A logger for just about everything.",
    templateId: libraryTemplateID,
    componentVersion: "3.3.3",
    componentVersionDescription: "Winston v3.3.3",
    componentVersionName: "winston-v3.3.3",
  };

  const expressLibID = await createComponent(client, expressComponentVariables);
  const typeORMLibID = await createComponent(client, typeormComponentVariables);
  const winstonLibID = await createComponent(client, winstonComponentVariables);

  return {
    expressLibID: expressLibID![0],
    typeORMLibID: typeORMLibID![0],
    winstonLibID: winstonLibID![0],
  };
}
async function createMicroserviceComponents(
  microserviceComponentTemplateID: string,
  restInterfaceTemplateID: string,
  client: GraphQLClient
) {
  const orderServiceInput = {
    componentName: "OrderService",
    componentDescription: "Service that manages the order",
    templateId: microserviceComponentTemplateID,
    componentVersion: "1.0",
    componentVersionDescription: "Order Service v1.0",
    componentVersionName: "order-service-v1.0",
  };
  const shoppingCartServiceInput = {
    componentName: "ShoppingCartService",
    componentDescription: "Service that manages the shopping cart",
    templateId: microserviceComponentTemplateID,
    componentVersion: "1.0",
    componentVersionDescription: "Shopping Cart Service v1.0",
    componentVersionName: "shopping-cart-service-v1.0",
  };
  const paymentServiceInput = {
    componentName: "PaymentService",
    componentDescription: "Service that manages the payment",
    templateId: microserviceComponentTemplateID,
    componentVersion: "1.0",
    componentVersionDescription: "Payment Service v1.0",
    componentVersionName: "payment-service-v1.0",
  };

  const orderServiceIDV1 = await createComponent(client, orderServiceInput);
  const shoppingCartServiceIDV1 = await createComponent(
    client,
    shoppingCartServiceInput
  );
  const paymentServiceIDV1 = await createComponent(client, paymentServiceInput);

  for (const componentIds of [
    orderServiceIDV1,
    shoppingCartServiceIDV1,
    paymentServiceIDV1,
  ]) {
    const parts = ["GET", "POST", "PUT", "DELETE"];
    const data = await createInterfaceSpecification(
      client,
      componentIds![1],
      restInterfaceTemplateID,
      "REST",
      "REST API",
      [
        ["1.0", parts],
        ["1.1", parts],
        ["2.0", parts],
      ]
    );
    for (const version of data.versions.nodes) {
      await addInterface(client, componentIds![0], version.id);
    }
  }

  return {
    orderServiceIDV1: orderServiceIDV1![0],
    shoppingCartServiceIDV1: shoppingCartServiceIDV1![0],
    paymentServiceIDV1: paymentServiceIDV1![0],
  };
}
async function createComponentTemplates(client: GraphQLClient) {
  const microserviceComponentTemplateInput = {
    componentTemplateDescription: "Microservice Template",
    componentTemplateName: "microservice-template",
    componentVersionTemplateDescription: "Microservice Version Template",
    componentVersionTemplateName: "microservice-version-template",
    shapeType: "RECT",
  };

  const libraryTemplateInput = {
    componentTemplateDescription: "Library Template",
    componentTemplateName: "library-template",
    componentVersionTemplateDescription: "Library Version Template",
    componentVersionTemplateName: "library-version-template",
    shapeType: "ELLIPSE",
  };

  const infrastructureTemplateInput = {
    componentTemplateDescription: "Infrastructure Template",
    componentTemplateName: "infrastructure-template",
    componentVersionTemplateDescription: "Infrastructure Version Template",
    componentVersionTemplateName: "infrastructure-version-template",
    shapeType: "HEXAGON",
  };

  const microserviceComponentTemplateID = await createComponentTemplate(
    client,
    microserviceComponentTemplateInput
  );
  const libraryTemplateID = await createComponentTemplate(
    client,
    libraryTemplateInput
  );
  const infrastructureTemplateID = await createComponentTemplate(
    client,
    infrastructureTemplateInput
  );

  return {
    microserviceComponentTemplateID,
    libraryTemplateID,
    infrastructureTemplateID,
  };
}

async function createInterfaceTemplates(
  client: GraphQLClient,
  componentTemplates: Awaited<ReturnType<typeof createComponentTemplates>>
) {
  const restInterfaceTemplateId = await createInterfaceSpecificationTemplate(
    client,
    {
      name: "REST",
      description: "REST Api endpoint",
      componentTemplates: [componentTemplates.microserviceComponentTemplateID],
    }
  );

  return {
    restInterfaceTemplateId,
  };
}

async function createDefaultIssueTemplate(client: GraphQLClient) {
  const issueTypes = [
    {
      name: "Bug",
      description: "A bug in the software",
      iconPath: bugIcon,
    },
    {
      name: "Feature Request",
      description: "A feature request for the software",
      iconPath: featureRequestIcon,
    },
    {
      name: "Unclassified",
      description: "An unclassified issue",
      iconPath: unclassifiedIcon,
    },
  ];
  const issueStates = [
    {
      name: "Open",
      description: "An open issue",
      isOpen: true,
    },
    {
      name: "Closed",
      description: "A closed issue",
      isOpen: false,
    },
    {
      name: "Not planned",
      description: "An issue that is not planned",
      isOpen: false,
    },
  ];
  const issuePriorities = [
    {
      name: "Low",
      description: "A low priority issue",
      value: 1,
    },
    {
      name: "Medium",
      description: "A medium priority issue",
      value: 2,
    },
    {
      name: "High",
      description: "A high priority issue",
      value: 3,
    },
  ];
  const relationTypes = [
    {
      name: "Depends on",
      description: "Issue depends on another issue",
    },
    {
      name: "Duplicates",
      description: "Issue duplicates another issue",
    },
  ];
  const assignmentTypes = [
    {
      name: "Reviewer",
      description: "Issue reviewer",
    },
    {
      name: "Assignee",
      description: "Issue assignee",
    },
    {
      name: "Tester",
      description: "Issue tester",
    },
  ];
  const result = await createIssueTemplate(client, {
    name: "Default Issue Template",
    description: "Default issue template",
    assignmentTypes,
    issueTypes,
    issueStates,
    issuePriorities,
    relationTypes,
  });
  const secondaryTemplate = await createIssueTemplate(client, {
    name: "Secondary Issue Template",
    description: "Secondary issue template",
    assignmentTypes,
    issueTypes,
    issueStates,
    issuePriorities,
    relationTypes,
  });
  const emptyTemplate = await createIssueTemplate(client, {
    name: "Empty Issue Template",
    description: "Empty issue template",
    assignmentTypes: [],
    issueTypes: [],
    issueStates: [],
    issuePriorities: [],
    relationTypes: [],
  });

  return {
    id: result.id,
    issueTypes: result.issueTypes.nodes.map((issueType: any) => issueType.id),
    issueStates: result.issueStates.nodes.map(
      (issueState: any) => issueState.id
    ),
    issuePriorities: result.issuePriorities.nodes.map(
      (issuePriority: any) => issuePriority.id
    ),
    relationTypes: result.relationTypes.nodes.map(
      (relationType: any) => relationType.id
    ),
    assignmentTypes: result.assignmentTypes.nodes.map(
      (assignmentType: any) => assignmentType.id
    ),
  };
}
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function createRandomIssue(
  client: GraphQLClient,
  component: string,
  issueTemplate: any,
  labels: string[],
  users: string[]
): Promise<string> {
  const issue = await createIssue(client, {
    title: `Test Issue ${random(1, 1000)}`,
    body: issueBody,
    trackable: component,
    template: issueTemplate.id,
    state:
      issueTemplate.issueStates[
        random(0, issueTemplate.issueStates.length - 1)
      ],
    type: issueTemplate.issueTypes[
      random(0, issueTemplate.issueTypes.length - 1)
    ],
  });
  for (const label of labels) {
    if (Math.random() > 0.6) {
      await addLabelToIssue(client, label, issue);
    }
  }
  for (const user of users) {
    if (Math.random() > 0.5) {
      await createAssignment(client, {
        user,
        issue,
        assignmentType:
          issueTemplate.assignmentTypes[
            random(0, issueTemplate.assignmentTypes.length - 1)
          ],
      });
    }
  }
  const existingComments: string[] = [];
  const commentCount = random(0, 10);
  for (let i = 0; i < commentCount; i++) {
    let answers = undefined;
    if (existingComments.length > 0 && Math.random() > 0.5) {
      answers = existingComments[random(0, existingComments.length - 1)];
    }
    const comment = await createIssueComment(client, {
      issue,
      body: loremIpsum,
      answers,
    });
    existingComments.push(comment);
  }
  return issue;
}
async function createRandomIssueRelation(
  client: GraphQLClient,
  issue: string,
  relatedIssue: string,
  issueTemplate: any
) {
  const relationType =
    issueTemplate.relationTypes[
      random(0, issueTemplate.relationTypes.length - 1)
    ];
  await createIssueRelation(client, {
    issue,
    relatedIssue,
    issueRelationType: relationType,
  });
}
async function createDefaultLabels(
  client: GraphQLClient,
  trackables: string[]
): Promise<string[]> {
  const labels = [
    {
      name: "bug",
      description: "A bug in the software",
      color: "#d73a4a",
    },
    {
      name: "documentation",
      description: "Documentation for the software",
      color: "#0075ca",
    },
    {
      name: "duplicate",
      description: "This issue or pull request already exists",
      color: "#cfd3d7",
    },
    {
      name: "enhancement",
      description: "A new feature or request",
      color: "#a2eeef",
    },
  ];
  const labelIDs: string[] = [];
  for (const label of labels) {
    const labelID = await createLabel(
      client,
      label.name,
      label.description,
      label.color,
      trackables
    );
    labelIDs.push(labelID);
  }
  return labelIDs;
}

async function createUserAndGetID(username: string, apiToken: string) {
  const newUserEndpoint = "http://localhost:3000/login/user";
  try {
    const newUserResponse = await axios.post(
      newUserEndpoint,
      {
        username,
        displayName: username,
        email: `${username}@example.com`,
        isAdmin: false,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        }
      }
    );
    return newUserResponse.data.id;
  } catch (error) {
    console.error(error);
  }
}

const bugIcon =
  "M 50 15.625 C 58.6294 15.625 65.625 22.6206 65.625 31.25 C 65.625 32.3199 65.5175 33.3648 65.3126 34.3742 C 65.7837 34.7252 66.2367 35.107 66.6666 35.513 L 77.6114 25.7893 L 81.7636 30.4607 L 70.2836 40.6668 C 71.1084 42.5697 71.5656 44.669 71.5656 46.875 C 71.5656 47.6383 71.5096 48.4002 71.3984 49.1547 L 84.934 51.6129 L 83.816 57.7621 L 70.191 55.2813 L 68.3254 64.6063 L 80.5257 79.2494 L 75.7243 83.2506 L 65.7441 71.2773 C 62.9055 75.4551 58.1234 78.125 52.8156 78.125 L 47.1844 78.125 C 41.8752 78.125 37.0921 75.4537 34.2537 71.2742 L 24.2757 83.2506 L 19.4743 79.2494 L 31.6722 64.6063 L 29.8066 55.2813 L 16.184 57.7621 L 15.066 51.6129 L 28.6015 49.1561 C 28.16 46.1813 28.594 43.2594 29.7194 40.6663 L 18.2364 30.4607 L 22.3886 25.7893 L 33.3272 35.5161 C 33.7582 35.1081 34.2134 34.7237 34.6913 34.3653 C 34.4821 33.3608 34.375 32.3179 34.375 31.25 C 34.375 22.6206 41.3706 15.625 50 15.625 Z M 64.5719 43.2094 L 64.3533 42.7331 C 64.3059 42.6369 64.2569 42.5417 64.2063 42.4474 L 64.3525 42.7314 C 64.273 42.5703 64.189 42.4119 64.1007 42.2562 L 64.2063 42.4474 C 64.1192 42.2852 64.0274 42.1258 63.9313 41.9695 L 64.1007 42.2562 C 64.0111 42.0981 63.9169 41.943 63.8185 41.7908 L 63.9313 41.9695 C 63.8472 41.8328 63.7597 41.6984 63.6689 41.5665 L 63.8185 41.7908 C 63.6999 41.6073 63.575 41.4282 63.4441 41.2538 L 63.6689 41.5665 C 63.5677 41.4195 63.4625 41.2756 63.3533 41.1348 L 63.4441 41.2538 C 63.3406 41.1159 63.2334 40.9809 63.1226 40.849 L 63.3533 41.1348 C 63.2472 40.9979 63.1373 40.8641 63.0239 40.7333 L 62.6891 40.3694 L 62.6891 40.3694 C 62.4039 40.0732 62.0993 39.7958 61.7775 39.5392 C 61.724 39.4957 61.6705 39.454 61.6166 39.4129 L 61.6167 39.4138 L 61.3041 39.1849 C 61.2357 39.1371 61.1667 39.0902 61.097 39.0442 L 60.7513 38.8268 C 60.6863 38.7878 60.6208 38.7497 60.5548 38.7123 L 60.7499 38.8263 C 60.5929 38.7322 60.4329 38.6426 60.2701 38.5577 L 60.5548 38.7123 C 60.3706 38.6079 60.1825 38.5096 59.9908 38.4176 L 60.2701 38.5577 C 60.0853 38.4612 59.8968 38.3708 59.705 38.2865 L 59.7036 38.2858 L 59.4443 38.1767 C 59.4277 38.17 59.4111 38.1633 59.3945 38.1568 L 59.1603 38.0675 L 59.1603 38.0675 L 58.8726 37.9676 C 58.8497 37.9601 58.8267 37.9526 58.8038 37.9453 C 58.6626 37.9001 58.522 37.8587 58.3802 37.8206 L 58.8038 37.9453 C 58.6003 37.8801 58.3939 37.8217 58.1847 37.7703 L 57.6142 37.649 C 57.5915 37.6449 57.5688 37.6409 57.5461 37.6369 L 57.6146 37.649 C 57.4203 37.614 57.2239 37.585 57.0256 37.5621 L 57.5461 37.6369 C 57.2006 37.5773 56.8487 37.5366 56.4914 37.5159 L 55.9406 37.5 L 44.0594 37.5 C 43.7266 37.5 43.3942 37.5177 43.0637 37.553 C 43.0644 37.5579 43.0653 37.5589 43.0662 37.5599 L 42.7041 37.5985 L 42.7041 37.5985 L 42.2208 37.6821 L 42.2208 37.6821 L 41.6173 37.8233 C 41.5677 37.8366 41.5184 37.8503 41.4692 37.8644 C 41.3176 37.9078 41.1667 37.9551 41.0177 38.006 L 41.4692 37.8644 C 41.0797 37.9759 40.7023 38.1111 40.3383 38.268 L 40.2982 38.2854 C 39.9383 38.4426 39.5917 38.6211 39.2595 38.819 C 39.2046 38.8517 39.1488 38.8857 39.0934 38.9203 L 39.2595 38.819 C 39.0964 38.9162 38.9367 39.0181 38.7807 39.1244 L 39.0934 38.9203 C 38.8677 39.0613 38.6489 39.2114 38.4374 39.37 L 38.4362 39.371 L 38.3298 39.452 C 38.2937 39.4799 38.2578 39.5081 38.2221 39.5365 L 38.0364 39.6884 L 38.0364 39.6884 L 37.8278 39.8689 C 37.7845 39.9075 37.7416 39.9464 37.6991 39.9857 L 37.6144 40.0651 L 37.6144 40.0651 L 37.4567 40.2181 C 37.4071 40.2674 37.358 40.3173 37.3095 40.3677 C 37.2567 40.4226 37.2048 40.4779 37.1536 40.5337 L 37.3095 40.3677 C 37.1804 40.5019 37.0553 40.6399 36.9345 40.7813 L 37.1536 40.5337 C 37.0168 40.6829 36.885 40.8364 36.7583 40.9938 L 36.9345 40.7813 C 36.8169 40.9189 36.7034 41.0599 36.5941 41.2039 L 36.7583 40.9938 C 36.4867 41.3313 36.2387 41.6872 36.0162 42.0586 C 35.9633 42.1468 35.9124 42.2349 35.863 42.3239 C 35.8119 42.4159 35.762 42.5092 35.7138 42.6033 L 35.863 42.3239 C 35.7853 42.4637 35.7111 42.6056 35.6405 42.7494 L 35.7138 42.6033 C 35.6292 42.7683 35.5494 42.9358 35.4746 43.1058 L 35.6405 42.7494 C 35.5502 42.9332 35.4659 43.1201 35.3877 43.3099 L 35.4746 43.1058 C 35.3924 43.2927 35.3161 43.4825 35.2461 43.6749 L 35.3877 43.3099 C 34.7718 44.8039 34.5355 46.4717 34.7741 48.1703 L 34.8665 48.7136 L 35.4472 51.6125 L 36.0597 54.6875 L 37.9915 64.3386 C 38.0442 64.6022 38.1077 64.8614 38.1814 65.1157 C 38.2209 65.252 38.2632 65.3863 38.3083 65.5191 L 38.1814 65.1157 C 38.2254 65.2674 38.273 65.4173 38.3241 65.5654 L 38.3083 65.5191 C 38.3642 65.6838 38.4244 65.8462 38.4889 66.0063 L 38.3241 65.5654 C 39.5533 69.1254 42.8239 71.6349 46.6292 71.8587 L 47.1844 71.875 L 52.8156 71.875 C 56.8837 71.875 60.4369 69.2611 61.7027 65.4866 C 61.7696 65.2871 61.8299 65.085 61.8837 64.8798 L 62.0085 64.3386 L 62.9993 59.375 L 63.0004 59.3719 L 65.1335 48.7136 C 65.2546 48.1082 65.3156 47.4924 65.3156 46.875 C 65.3156 45.7655 65.1228 44.701 64.769 43.7132 L 64.5719 43.2094 L 64.5719 43.2094 Z M 50 21.875 C 44.8223 21.875 40.625 26.0723 40.625 31.25 L 40.6377 31.6292 C 40.7562 31.6026 40.8754 31.5774 40.9951 31.5534 C 42.0041 31.3516 43.0305 31.25 44.0594 31.25 L 55.9406 31.25 C 57.1161 31.25 58.2613 31.3798 59.3626 31.6259 L 59.375 31.25 L 59.375 31.25 C 59.375 26.0723 55.1777 21.875 50 21.875 Z";
const featureRequestIcon =
  "m 40.625 81.25 h 18.75 v 6.25 h -18.75 z m 0 -9.375 h 18.75 v 6.25 H 40.625 Z M 50 12.5 c -15.496 0 -28.125 12.629 -28.125 28.125 c 0 15.496 12.629 28.125 28.125 28.125 c 15.496 0 28.125 -12.629 28.125 -28.125 c 0 -15.496 -12.629 -28.125 -28.125 -28.125 z m 0 6.25 c 12.1182 0 21.875 9.7568 21.875 21.875 c 0 12.1182 -9.7568 21.875 -21.875 21.875 c -12.1182 0 -21.875 -9.7568 -21.875 -21.875 c 0 -12.1182 9.7568 -21.875 21.875 -21.875 z";
const unclassifiedIcon =
  "m 46.875 62.5 h 6.25 v 6.25 h -6.25 z m 0 -31.25 h 6.25 v 25 H 46.875 Z M 50 15.625 C 31.0522 15.625 15.625 31.0522 15.625 50 C 15.625 68.9478 31.0522 84.375 50 84.375 C 68.9478 84.375 84.375 68.9478 84.375 50 C 84.375 31.0522 68.9478 15.625 50 15.625 Z m 0 6.25 c 15.57 0 28.125 12.555 28.125 28.125 c 0 15.57 -12.555 28.125 -28.125 28.125 c -15.57 0 -28.125 -12.555 -28.125 -28.125 c 0 -15.57 12.555 -28.125 28.125 -28.125 z";
const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Nullam euismod, nisl eget aliquam ultricies, massa nisl tristique
  nunc, vitae ultricies ante magna non nunc. Donec euismod, nisl eget
  aliquam ultricies, massa nisl tristique nunc, vitae ultricies ante
  magna non nunc. Donec euismod, nisl eget aliquam ultricies, massa
  nisl tristique nunc, vitae ultricies ante magna non nunc. Donec
  euismod, nisl eget aliquam ultricies, massa nisl tristique nunc,
  vitae ultricies ante magna non nunc. Donec euismod, nisl eget
  aliquam ultricies, massa nisl tristique nunc, vitae ultricies ante.`;
const issueBody = `# Niklas stupid issue

Hello and welcome to my stupid issue.
As I have no idea what to write here, I will just write some random stuff.
This issue does not really occur, but as ChatGPT started talking about Unicorns in NodeJS, I decided to better write this myself.

## To reproduce
- start any random program
- do nothing
- **profit**

## Random codeblock
\`\`\`javascript
const foo = "bar";
console.log(foo);
\`\`\`

### And a list for the win
1. foo
2. bar
3. baz

### And more text
${loremIpsum}
`;
