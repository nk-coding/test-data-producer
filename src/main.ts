import { GraphQLClient, gql } from 'graphql-request';
import axios from 'axios';

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


const createMicroserviceComponentTemplateMutation = gql`
  mutation CreateComponentTemplate(
        $componentTemplateDescription: String!,
        $componentTemplateName: String!,
        $componentVersionTemplateDescription: String!,
        $componentVersionTemplateName: String!
    ) {
        createComponentTemplate(input: {
            description: $componentTemplateDescription,
            name: $componentTemplateName,
            componentVersionTemplate: {
                description: $componentVersionTemplateDescription,
                name: $componentVersionTemplateName,
            }
        }) {
        componentTemplate {
            id
        }
    }
  }
`;
const createProjectMutation = gql`
    mutation CreateProject(
        $projectDescription: String!,
        $projectName: String!,
        $repositoryURL: URL!
    ) {
        createProject(input: {
            description: $projectDescription,
            name: $projectName,
            repositoryURL: $repositoryURL
        }) { 
        project {
            id
        }
        }
    }
`;
const createComponentMutation = gql`
  mutation CreateComponent(
    $componentName: String!,
    $componentDescription: String!,
    $templateId: ID!,
    $componentVersion: String!,
    $componentVersionDescription: String!,
    $componentVersionName: String!
  ) {
    createComponent(input: {
      name: $componentName,
      description: $componentDescription,
      template: $templateId,
      versions: [{
        version: $componentVersion,
        description: $componentVersionDescription,
        name: $componentVersionName,
        templatedFields: []
      }],
      templatedFields: []
    }) {
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
  mutation CreateRelationTemplate($name: String!, $description: String!, $fromId: [ID!]!, $toId: [ID!]!) {
    createRelationTemplate(input: {
      relationConditions: [
        {
          from: $fromId,
          to: $toId,
          interfaceSpecificationDerivationConditions: []
        }
      ],
      description: $description,
      name: $name
    }) {
      relationTemplate {
        id
      }
    }
  }
`;
const createRelationMutation = gql`
  mutation CreateRelation($startId: ID!, $endId: ID!, $templateId: ID!) {
    createRelation(input: {
      start: $startId,
      end: $endId,
      template: $templateId,
      templatedFields: []
    }) {
      relation {
        id
      }
    }
  }
`;
const addComponentVersionToProjectMutation = gql`
    mutation AddComponentVersionToProject($projectId: ID!, $componentVersionId: ID!) {
        addComponentVersionToProject(input: { project: $projectId, componentVersion: $componentVersionId }) {
            project {
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
        const response: any = await client.request(createRelationMutation, variables);
        console.log("Created new relation:", response.createRelation.relation.id);
        return response.createRelation.relation.id;
    } catch (error) {
        console.error("Error creating relation:", error);
        throw error;
    }
}
async function createComponentTemplate(client: GraphQLClient, variables: any) {
    try {
        const response: any = await client.request(createMicroserviceComponentTemplateMutation, variables);
        console.log("Created component template with ID:", response.createComponentTemplate.componentTemplate.id);
        return response.createComponentTemplate.componentTemplate.id;
    } catch (error) {
        console.error("Error creating component template:", error);
    }
}
async function createProject(client: GraphQLClient, variables: any) {
    try {
        const response: any = await client.request(createProjectMutation, variables);
        console.log('Created new project:', response.createProject.project.id);
        return response.createProject.project.id;
    } catch (error) {
        console.error("Error creating project:", error);
    }
}
async function createComponent(client: GraphQLClient, variables: any) {
    try {
        const response: any = await client.request(createComponentMutation, variables);
        console.log('Created new component version:', response.createComponent.component.versions.nodes[0].id);
        return response.createComponent.component.versions.nodes[0].id;
    } catch (error) {
        console.error("Error creating component version:", error);
    }
}
async function createRelationTemplate(client: GraphQLClient, variables: {
    name: string;
    description: string;
    fromId: [string];
    toId: [string];
}) {
    const createRelationTemplateResponse = await client.request<{
        createRelationTemplate: {
            relationTemplate: {
                id: string;
            };
        };
    }>(createRelationTemplateMutation, variables);

    console.log("Created new relation template:", createRelationTemplateResponse.createRelationTemplate.relationTemplate.id);
    return createRelationTemplateResponse.createRelationTemplate.relationTemplate.id;
}
async function addComponentVersionToProject(client: GraphQLClient, variables: any) {
    try {
        const response: any = await client.request(addComponentVersionToProjectMutation, variables);
        console.log('Added component version to project:', response.addComponentVersionToProject.project.id);
        return response.addComponentVersionToProject.project.id;
    } catch (error) {
        console.error("Error adding component version:", error);
    }
}

async function main() {
    const endpoint = 'http://localhost:8080/graphql';
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODA1MTIxODAsImF1ZCI6ImJhY2tlbmQiLCJpc3MiOiJkZXYtbG9naW4tc2VydmljZSIsInN1YiI6IjU1YjYzOGJjLWI5NTAtNGY4Ni04MDY0LTk0NTU3NDUyMjI0ZiJ9.37LTrmgizjOwdvmRBm8jTxiEw2gdbB6eQJ-TDfEjjj0`; /* await getDeveloperToken(); */ // hardcoded for now
    // console.log('Developer token:', token);

    const client = new GraphQLClient(endpoint, {
        headers: {
            authorization: `${token}`,
        },
    });

    const componentTemplateIDs = await createComponentTemplates(client);
    const microserviceIDs = await createMicroserviceComponents(componentTemplateIDs.microserviceComponentTemplateID, client);
    const libraryIDs = await createLibraryComponents(componentTemplateIDs.libraryTemplateID, client);
    const infrastructureIDs = await createInfrastructureComponents(componentTemplateIDs.infrastructureTemplateID, client);
    const relationTemplateIDs = await createRelationTemplates(componentTemplateIDs, client);
    const service2ServiceRelationIDs = await createService2ServiceRelations(microserviceIDs, relationTemplateIDs, client);
    const service2LibraryRelationIDs = await createService2LibraryRelations(microserviceIDs, libraryIDs, relationTemplateIDs, client);
    const service2InfrastructureRelationIDs = await createService2InfrastructureRelations(microserviceIDs, infrastructureIDs, relationTemplateIDs, client);

    const testProjectInput = {
        projectDescription: "Test project",
        projectName: "test-project",
        repositoryURL: "https://github.com/test-account/test-project",
    };
    const projectID = await createProject(client, testProjectInput);
    await addComponentsToProject(projectID, microserviceIDs, infrastructureIDs, libraryIDs, client);

}

main().catch((error) => console.error('Error:', error));

async function addComponentsToProject(projectID: any, microserviceIDs: { orderServiceIDV1: any; shoppingCartServiceIDV1: any; paymentServiceIDV1: any; }, infrastructureIDs: { k8ID: any; }, libraryIDs: { expressLibID: any; typeORMLibID: any; winstonLibID: any; }, client: GraphQLClient) {
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
    await addComponentVersionToProject(client, addOrderServiceVersionToProjectInput);
    await addComponentVersionToProject(client, addShoppingCartServiceVersionToProjectInput);
    await addComponentVersionToProject(client, addPaymentServiceVersionToProjectInput);
    await addComponentVersionToProject(client, addK8VersionToProjectInput);
    await addComponentVersionToProject(client, addExpressVersionToProjectInput);
    await addComponentVersionToProject(client, addTypeORMVersionToProjectInput);
    await addComponentVersionToProject(client, addWinstonVersionToProjectInput);
}

async function createService2InfrastructureRelations(microserviceIDs: { orderServiceIDV1: any; shoppingCartServiceIDV1: any; paymentServiceIDV1: any; }, infrastructureIDs: { k8ID: any; }, relationTemplateIDs: { service2serviceRelationTemplateID: string; service2librabryRelationTemplateID: string; service2infrastructureRelationTemplateID: string; }, client: GraphQLClient) {
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

    const shoppingCart2K8RelationID = await createRelation(client, shoppingCart2K8RelationInput);
    const order2K8RelationID = await createRelation(client, order2K8RelationInput);

    return {
        shoppingCart2K8RelationID,
        order2K8RelationID,
    };
}
async function createService2LibraryRelations(microserviceIDs: { orderServiceIDV1: any; shoppingCartServiceIDV1: any; paymentServiceIDV1: any; }, libraryIDs: { expressLibID: any; typeORMLibID: any; winstonLibID: any; }, relationTemplateIDs: { service2serviceRelationTemplateID: string; service2librabryRelationTemplateID: string; service2infrastructureRelationTemplateID: string; }, client: GraphQLClient) {
    const shoppingCart2expressRelationInput = {
        startId: microserviceIDs.shoppingCartServiceIDV1,
        endId: libraryIDs.expressLibID,
        templateId: relationTemplateIDs.service2librabryRelationTemplateID
    };
    const order2expressRelationInput = {
        startId: microserviceIDs.orderServiceIDV1,
        endId: libraryIDs.expressLibID,
        templateId: relationTemplateIDs.service2librabryRelationTemplateID
    };
    const shoppingCart2typeORMRelationInput = {
        startId: microserviceIDs.shoppingCartServiceIDV1,
        endId: libraryIDs.typeORMLibID,
        templateId: relationTemplateIDs.service2librabryRelationTemplateID
    };
    const order2winstonRelationInput = {
        startId: microserviceIDs.orderServiceIDV1,
        endId: libraryIDs.winstonLibID,
        templateId: relationTemplateIDs.service2librabryRelationTemplateID
    };

    const shoppingCart2expressRelationID = await createRelation(client, shoppingCart2expressRelationInput);
    const order2expressRelationID = await createRelation(client, order2expressRelationInput);
    const shoppingCart2typeORMRelationID = await createRelation(client, shoppingCart2typeORMRelationInput);
    const order2winstonRelationID = await createRelation(client, order2winstonRelationInput);

    return {
        shoppingCart2expressRelationID,
        order2expressRelationID,
        shoppingCart2typeORMRelationID,
        order2winstonRelationID
    };
}
async function createService2ServiceRelations(microserviceIDs: { orderServiceIDV1: any; shoppingCartServiceIDV1: any; paymentServiceIDV1: any; }, relationTemplateIDs: { service2serviceRelationTemplateID: string; service2librabryRelationTemplateID: string; service2infrastructureRelationTemplateID: string; }, client: GraphQLClient) {
    const shoppingCart2orderRelationInput = {
        startId: microserviceIDs.shoppingCartServiceIDV1,
        endId: microserviceIDs.orderServiceIDV1,
        templateId: relationTemplateIDs.service2serviceRelationTemplateID
    };
    const order2paymentRelationInput = {
        startId: microserviceIDs.orderServiceIDV1,
        endId: microserviceIDs.paymentServiceIDV1,
        templateId: relationTemplateIDs.service2serviceRelationTemplateID
    };

    const shoppingCart2orderRelationID = await createRelation(client, shoppingCart2orderRelationInput);
    const order2paymentRelationID = await createRelation(client, order2paymentRelationInput);
    return {
        shoppingCart2orderRelationID,
        order2paymentRelationID
    };
}
async function createRelationTemplates(componentTemplateIDs: { microserviceComponentTemplateID: any; libraryTemplateID: any; infrastructureTemplateID: any; }, client: GraphQLClient) {
    const service2ServiceRelationTemplateVariables = {
        name: "service2service-relation-template",
        description: "Service2Service Relation",
        fromId: componentTemplateIDs.microserviceComponentTemplateID,
        toId: componentTemplateIDs.microserviceComponentTemplateID
    };
    const microserviceIncludesLibraryRelationTemplateVariables = {
        name: "microservice-includes-library-relation-template",
        description: "Microservice includes Library Relation",
        fromId: componentTemplateIDs.microserviceComponentTemplateID,
        toId: componentTemplateIDs.libraryTemplateID
    };
    const microserviceHostedOnInfrastructureRelationTemplateVariables = {
        name: "microservice-hosted-on-infrastructure-relation-template",
        description: "Microservice hosted on Infrastructure Relation",
        fromId: componentTemplateIDs.microserviceComponentTemplateID,
        toId: componentTemplateIDs.infrastructureTemplateID
    };

    const service2serviceRelationTemplateID = await createRelationTemplate(client, service2ServiceRelationTemplateVariables);
    const service2librabryRelationTemplateID = await createRelationTemplate(client, microserviceIncludesLibraryRelationTemplateVariables);
    const service2infrastructureRelationTemplateID = await createRelationTemplate(client, microserviceHostedOnInfrastructureRelationTemplateVariables);

    return {
        service2serviceRelationTemplateID,
        service2librabryRelationTemplateID,
        service2infrastructureRelationTemplateID
    };
}
async function createInfrastructureComponents(infrastructureTemplateID: string, client: GraphQLClient) {
    const kubernetesComponentVariables = {
        componentName: "Kubernetes",
        componentDescription: "An open-source container-orchestration system for automating deployment, scaling, and management of containerized applications.",
        templateId: infrastructureTemplateID,
        componentVersion: "1.22.0",
        componentVersionDescription: "Kubernetes v1.22.0",
        componentVersionName: "kubernetes-v1.22.0"
    };

    const k8ID = await createComponent(client, kubernetesComponentVariables);
    return {
        k8ID
    };
}
async function createLibraryComponents(libraryTemplateID: string, client: GraphQLClient) {
    const expressComponentVariables = {
        componentName: "Express",
        componentDescription: "Fast, unopinionated, minimalist web framework for Node.js",
        templateId: libraryTemplateID,
        componentVersion: "4.17.1",
        componentVersionDescription: "Express.js v4.17.1",
        componentVersionName: "express-v4.17.1"
    };

    const typeormComponentVariables = {
        componentName: "TypeORM",
        componentDescription: "ORM for TypeScript and JavaScript (ES7, ES6, ES5). Supports MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, WebSQL databases.",
        templateId: libraryTemplateID,
        componentVersion: "0.2.41",
        componentVersionDescription: "TypeORM v0.2.41",
        componentVersionName: "typeorm-v0.2.41"
    };

    const winstonComponentVariables = {
        componentName: "Winston",
        componentDescription: "A logger for just about everything.",
        templateId: libraryTemplateID,
        componentVersion: "3.3.3",
        componentVersionDescription: "Winston v3.3.3",
        componentVersionName: "winston-v3.3.3"
    };

    const expressLibID = await createComponent(client, expressComponentVariables);
    const typeORMLibID = await createComponent(client, typeormComponentVariables);
    const winstonLibID = await createComponent(client, winstonComponentVariables);

    return {
        expressLibID,
        typeORMLibID,
        winstonLibID
    };
}
async function createMicroserviceComponents(microserviceComponentTemplateID: string, client: GraphQLClient) {
    const orderServiceInput = {
        componentName: "OrderService",
        componentDescription: "Service that manages the order",
        templateId: microserviceComponentTemplateID,
        componentVersion: "1.0",
        componentVersionDescription: "Order Service v1.0",
        componentVersionName: "order-service-v1.0"
    };
    const shoppingCartServiceInput = {
        componentName: "ShoppingCartService",
        componentDescription: "Service that manages the shopping cart",
        templateId: microserviceComponentTemplateID,
        componentVersion: "1.0",
        componentVersionDescription: "Shopping Cart Service v1.0",
        componentVersionName: "shopping-cart-service-v1.0"
    };
    const paymentServiceInput = {
        componentName: "PaymentService",
        componentDescription: "Service that manages the payment",
        templateId: microserviceComponentTemplateID,
        componentVersion: "1.0",
        componentVersionDescription: "Payment Service v1.0",
        componentVersionName: "payment-service-v1.0"
    };

    const orderServiceIDV1 = await createComponent(client, orderServiceInput);
    const shoppingCartServiceIDV1 = await createComponent(client, shoppingCartServiceInput);
    const paymentServiceIDV1 = await createComponent(client, paymentServiceInput);

    return {
        orderServiceIDV1,
        shoppingCartServiceIDV1,
        paymentServiceIDV1
    };
}
async function createComponentTemplates(client: GraphQLClient) {
    const microserviceComponentTemplateInput = {
        componentTemplateDescription: "Microservice Template",
        componentTemplateName: "microservice-template",
        componentVersionTemplateDescription: "Microservice Version Template",
        componentVersionTemplateName: "microservice-version-template",
    };

    const libraryTemplateInput = {
        componentTemplateDescription: "Library Template",
        componentTemplateName: "library-template",
        componentVersionTemplateDescription: "Library Version Template",
        componentVersionTemplateName: "library-version-template",
    };

    const infrastructureTemplateInput = {
        componentTemplateDescription: "Infrastructure Template",
        componentTemplateName: "infrastructure-template",
        componentVersionTemplateDescription: "Infrastructure Version Template",
        componentVersionTemplateName: "infrastructure-version-template",
    };

    const microserviceComponentTemplateID = await createComponentTemplate(client, microserviceComponentTemplateInput);
    const libraryTemplateID = await createComponentTemplate(client, libraryTemplateInput);
    const infrastructureTemplateID = await createComponentTemplate(client, infrastructureTemplateInput);

    return {
        microserviceComponentTemplateID,
        libraryTemplateID,
        infrastructureTemplateID,
    };
}
async function createUserAndGetID() {
    const newUserEndpoint = 'http://localhost:3000/newUser';
    try {
        const newUserResponse = await axios.post(newUserEndpoint,
            {
                username: "sample-user8",
                displayName: "sample-user8",
                email: "",
                isAdmin: true,
            },
            {}
        );

        console.log(newUserResponse);

        return newUserResponse.data;

    } catch (error) {
        console.error(error);
    }
}
async function getDeveloperToken() {
    const tokenEndpoint = 'http://localhost:3000/token';
    try {
        const userID = await createUserAndGetID();

        const tokenResponse = await axios.get(`${tokenEndpoint}?username=&id=${encodeURIComponent(userID)}`);
        if (tokenResponse.status !== 200) {
            throw new Error(`Error fetching token: ${tokenResponse.statusText}`);
        }
        console.log(tokenResponse);
        return tokenResponse.data;
    } catch (error) {
        console.error(error);
    }
}
