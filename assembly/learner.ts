@json
export class Learner {

  @alias("Learner.id")
  id: string = ""

  @alias("Learner.name")
  name: string = ""

  @alias("Learner.email")
  email: string = ""

  @alias("Learner.interests")
  interests: string[] = []

  @alias("Learner.goals")
  goals: string[] = []

  @alias("Learner.preferredLearningStyle")
  preferredLearningStyle: string = ""

  @alias("Learner.existingKnowledgeLevel")
  existingKnowledgeLevel: string = ""

}


@json
export class Resource {

  @alias("Resource.resourceId")
  resourceId: string = ""

  @alias("Resource.title")
  title: string = ""

  @alias("Resource.topic")
  topic: string = ""

  @alias("Resource.description")
  description: string = ""

  @alias("Resource.url")
  url: string = ""

  @alias("Resource.tags")
  tags: string[] = []
}
