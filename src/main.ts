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
        $repositoryURL: String!
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

        return response.createProject.project.id;
    } catch (error) {
        console.error("Error creating project:", error);
    }
}
async function createComponent(client: GraphQLClient, variables: any) {
    try {
        const response: any = await client.request(createComponentMutation, variables);
        console.log('Created new component:', response.createComponent.component.id);
        return response.createComponent.component.id;
    } catch (error) {
        console.error("Error creating component:", error);
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


async function main() {
    const endpoint = 'http://localhost:8080/graphql';
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk4NTk4NDIsImF1ZCI6ImJhY2tlbmQiLCJpc3MiOiJkZXYtbG9naW4tc2VydmljZSIsInN1YiI6ImEzOGNlNTQ3LTdhYjgtNDRmZS1iYWU4LTc0MmU5NTE1YWFkZiJ9.JC_jDCxweYXUjrgeOEvVnchnn5UIQKei6ZAf3oopWxk`; /* await getDeveloperToken(); */ // hardcoded for now
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




    // const testProjectInput = {
    //     projectDescription: "Test project",
    //     projectName: "test-project",
    //     repositoryURL: "https://github.com/test-account/test-project",
    // };
    // const projectID = await createProject(client, testProjectInput);

}

main().catch((error) => console.error('Error:', error));

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
