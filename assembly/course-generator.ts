
import { Learner } from "./learner";
import { models } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  UserMessage
} from "@hypermode/modus-sdk-as/models/openai/chat"

const QUERY_MODEL = "llama"
const COURSE_SCHEMA = `{
    "title": "engaging and relevant course title",
    "estimatedDuration": "estimated completion time in minutes",
    "description": "comprehensive course description in about 60 words",
    "difficulty": "beginner/intermediate/advanced",
    "content": "detailed content on the topic with clear explanations. Content length should be about 250 - 300 words or about 3 to 4 paragraphs",
    "examples": "A few relevant and important examples on the topic",
    "illustrations": "Diagrams or illusstrations regadrding the topic for visual understanding ( if necessary )",
    "exercises": "A few activities the learner could do to improve his skill on the topic"
  }`

export function generateCoursePrompt(learner: Learner): string {
    return `As an expert educational content creator, please generate a comprehensive learning course tailored to the following learner profile:
  
  Learner Profile:
  - Interests: ${learner.interests.join(', ')}
  - Goals: ${learner.goals.join(', ')}
  - Preferred Learning Style: ${learner.preferredLearningStyle}
  - Existing Knowledge Level: ${learner.existingKnowledgeLevel}
  
  Please create a structured course that follows this specific format:
  {
    "title": "engaging and relevant course title",
    "estimatedDuration": "estimated completion time in minutes",
    "description": "comprehensive course description in about 60 words",
    "difficulty": "beginner/intermediate/advanced",
    "content": "detailed content on the topic with clear explanations. Content length should be about 250 - 300 words or about 3 to 4 paragraphs",
    "examples": "A few relevant and important examples on the topic",
    "illustrations": "Diagrams or illusstrations regadrding the topic for visual understanding ( if necessary )",
    "exercises": "A few activities the learner could do to improve his skill on the topic"
  }
  
  Important guidelines:
  1. Format the content with clear paragraph breaks and bullet points where appropriate
  2. Use concise, engaging language that directly addresses the learner's goals
  3. Ensure examples are practical and relatable to real-world scenarios
  4. Keep exercises actionable and aligned with the learner's skill level
  5. Maintain consistent formatting throughout the response

  VERY iMPORTANT: Generate the output in the JSON format only in the above mentioned format.
  `
  
  }



export function generateCourse(learner:Learner): String {
    const model = models.getModel<OpenAIChatModel>(QUERY_MODEL)
    const input = model.createInput([new UserMessage(generateCoursePrompt(learner))])
    input.responseFormat = {
      type: "json_object",
      jsonSchema: COURSE_SCHEMA
  }
  
    input.temperature = 0.7
    
    const output = model.invoke(input)

    const course = output.choices[0].message.content.trim()
    return course
        
}