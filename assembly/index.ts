
import { JSON } from "json-as"
import { dgraph } from "@hypermode/modus-sdk-as"
import { Resource } from "./learner"
import { buildResourceMutationJson } from "./helper"
import { embedText } from "./embeddings"
import {
  deleteNodePredicates,
  ListOf,
  getEntityById,
  getAllNodes
} from "./dgraph-utils"

export {generateCourse} from "./course-generator"
export {generateQuiz} from "./quiz-generator"


const DGRAPH_CONNECTION = "dgraph-grpc"



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
 * Get a resource by its id
 */
export function getResource(id: string): Resource | null {
  const body = `
    Resource.resourceId
    Resource.title
    Resource.description
    Resource.topic
    Resource.url
    Resource.tags
    `
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
    "Resource.tags",
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
      Resource.tags
    }
  }`)
  const response = dgraph.execute(DGRAPH_CONNECTION, new dgraph.Request(query))
  const data = JSON.parse<ListOf<Resource>>(response.Json)
  return data.list
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




