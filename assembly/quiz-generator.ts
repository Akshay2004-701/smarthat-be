import { models } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  UserMessage
} from "@hypermode/modus-sdk-as/models/openai/chat"

const QUERY_MODEL = "llama"
const QUIZ_SCHEMA = `{
    "title": "quiz title that matches the course content",
    "numberOfQuestions": 5,
    "questions": [
        {
            "question": "clear and specific question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": "correct option number (1-4)",
            "explanation": "brief explanation of why this answer is correct"
        }
    ],
    "passingScore": "minimum score needed to pass (percentage)",
    "timeLimit": "suggested time limit in minutes"
}`

export function generateQuizPrompt(courseContent: string): string {
    return `As an expert educational assessment creator, please generate a comprehensive quiz based on the following course content:

Course Content:
${courseContent}

Please create a structured quiz that follows this specific format:
{
    "title": "quiz title that matches the course content",
    "numberOfQuestions": 5,
    "questions": [
        {
            "question": "clear and specific question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": "correct option number (1-4)",
            "explanation": "brief explanation of why this answer is correct"
        }
    ],
    "passingScore": "minimum score needed to pass (percentage)",
    "timeLimit": "suggested time limit in minutes"
}

Important guidelines:
1. Questions should test understanding, not just memorization
2. Include a mix of difficulty levels
3. Ensure all options are plausible
4. Provide clear, educational explanations for correct answers
5. Questions should directly relate to the course content

VERY iMPORTANT: Generate the output in the JSON format only in the above mentioned format.
`
}

export function generateQuiz(courseContent: string): string {
    const model = models.getModel<OpenAIChatModel>(QUERY_MODEL)
    const input = model.createInput([new UserMessage(generateQuizPrompt(courseContent))])
    input.responseFormat = {
        type: "json_object",
        jsonSchema: QUIZ_SCHEMA
    }
    
    input.temperature = 0.7
    const output = model.invoke(input)

    const quiz = output.choices[0].message.content.trim()
    return quiz
}
