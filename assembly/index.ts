import { models } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  UserMessage
} from "@hypermode/modus-sdk-as/models/openai/chat"

import { JSON } from "json-as"
import { dgraph } from "@hypermode/modus-sdk-as"
import { Learner, Resource } from "./learner"
import { buildLearnerMutationJson,buildResourceMutationJson } from "./helper"
import { embedText } from "./embeddings"
import {
  deleteNodePredicates,
  ListOf,
  searchBySimilarity,
  getEntityById,
  addEmbeddingToJson,
  getAllNodes
} from "./dgraph-utils"

export {generateCourse} from "./course-generator"
export {generateQuiz} from "./quiz-generator"

const QUERY_MODEL = "llama"
const DGRAPH_CONNECTION = "dgraph-grpc"

export function generateText(prompt: string): string {
  const model = models.getModel<OpenAIChatModel>(QUERY_MODEL)


  const input = model.createInput([new UserMessage(prompt)])

  input.temperature = 0.7
  const output = model.invoke(input)

  return output.choices[0].message.content.trim()
}

export function sayHello(name: string | null = null): string {
  return `Hello, ${name || "World"}!`;
}

/**
 * add a learner
 */
export function upsertLearner(learner:Learner): Map<string, string> | null {
  var payload = buildLearnerMutationJson(DGRAPH_CONNECTION, learner)

  const mutations: dgraph.Mutation[] = [new dgraph.Mutation(payload)]
  const uids = dgraph.execute(DGRAPH_CONNECTION, new dgraph.Request(null, mutations)).Uids

  return uids
}

/**
 * add a resource
 */

export function upsertResource(res:Resource): Map<string, string> | null {
  var payload = buildResourceMutationJson(DGRAPH_CONNECTION, res)

  // const embedding = embedText([res.title])[0]
  // payload = addEmbeddingToJson(payload, "Resource.embedding", embedding)

  const mutations: dgraph.Mutation[] = [new dgraph.Mutation(payload)]
  const uids = dgraph.execute(DGRAPH_CONNECTION, new dgraph.Request(null, mutations)).Uids

  return uids
}

/**
 * Get a learner info by their id
 */
export function getLearner(id: string): Learner | null {
  const body = `
    Learner.id
    Learner.name
    Learner.email
    Learner.interests
    Learner.goals
    Learner.preferredLearningStyle
    Learner.existingKnowledgeLevel`
  return getEntityById<Learner>(DGRAPH_CONNECTION, "Learner.id", id, body)
}

/**
 * Delete a learner by their id
 */
export function deleteLearner(id: string): void {
  deleteNodePredicates(DGRAPH_CONNECTION, `eq(Learner.id, "${id}")`, [
    "Learner.id",
    "Learner.name",
    "Learner.email",
    "Learner.interests",
    "Learner.goals",
    "Learner.preferredLearningStyle",
    "Learner.existingKnowledgeLevel",
  ])
}

/**
 * Get a resource by its id
 */
export function getResource(id: string): Resource | null {
  const body = `
    Resource.resourceId
    Resource.title
    Resource.description
    Resource.topic
    Resource.url`
  return getEntityById<Resource>(DGRAPH_CONNECTION, "Resource.resourceId", id, body)
}

/**
 * Delete a resource by its id
 */
export function deleteResource(id: string): void {
  deleteNodePredicates(DGRAPH_CONNECTION, `eq(Resource.resourceId, "${id}")`, [
    "Resource.resourceId",
    "Resource.title",
    "Resource.description",
    "Resource.topic",
    "Resource.url",
  ])
}

/**
 * Get all resources for a given topic
 */
export function getResourcesByTopic(topic: string): Resource[] {
  const query = new dgraph.Query(`{
    list(func: eq(Resource.topic, "${topic}")) {
      Resource.resourceId
      Resource.title
      Resource.description
      Resource.topic
      Resource.url
    }
  }`)
  const response = dgraph.execute(DGRAPH_CONNECTION, new dgraph.Request(query))
  const data = JSON.parse<ListOf<Resource>>(response.Json)
  return data.list
}

/**
 * Search resources by similarity to a given text
 */
export function searchResources(search: string): Resource[] {
  const embedding = embedText([search])[0]
  const topK = 3
  const body = `
    Resource.resourceId
    Resource.title
    Resource.description
    Resource.topic
    Resource.url
  `
  return searchBySimilarity<Resource>(DGRAPH_CONNECTION, embedding, "Resource.embedding", body, topK)
}

export function getResourceByTag(tag: string): Resource[] {
  const query = new dgraph.Query(`{
    list(func: type(Resource)) @filter(has(Resource.tags) AND anyofterms(Resource.tags, "${tag}")) {
      Resource.resourceId
      Resource.title
      Resource.description
      Resource.topic
      Resource.url
      Resource.tags
    }
  }`);
  const response = dgraph.execute(DGRAPH_CONNECTION, new dgraph.Request(query));
  const data = JSON.parse<ListOf<Resource>>(response.Json);
  return data.list;
}

export function getAllContent(): Resource[] {
  const body = `
    Resource.resourceId
    Resource.title
    Resource.topic
    Resource.description
    Resource.url
    Resource.tags`
  return getAllNodes<Resource>(DGRAPH_CONNECTION, body);
}




