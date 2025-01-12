import { JSON } from "json-as"
import { Learner, Resource } from "./learner"
import { injectNodeUid,GraphSchema } from "./dgraph-utils"

const learner_schema: GraphSchema = new GraphSchema()
const Resource_schema: GraphSchema = new GraphSchema()

learner_schema.node_types.set("Learner", {
  id_field: "Learner.id",
  relationships: [],
})

Resource_schema.node_types.set("Resource", {
  id_field: "Resource.resourceId",
  relationships: [] 
});



export function buildLearnerMutationJson(connection: string, learner:Learner): string {
  var payload = JSON.stringify(learner)

  payload = injectNodeUid(connection, payload, "Learner", learner_schema)

  return payload
}

export function buildResourceMutationJson(connection: string, res:Resource): string {
  var payload = JSON.stringify(res)

  payload = injectNodeUid(connection, payload, "Resource", Resource_schema)

  return payload
}