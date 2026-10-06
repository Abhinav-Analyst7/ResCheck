import os

class ResumeTailor:
    """
    Module for generating AI-driven resume bullet point tailoring suggestions 
    based on missing skills identified during job description matching.
    """
    def __init__(self, api_key=None, provider="gemini"):
        self.provider = provider.lower()
        # Auto-detect API key from environment variables if not passed directly
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

    def build_prompt(self, resume_text, jd_text, missing_skills):
        """
        Constructs an LLM prompt designed to reframe real resume bullet points.
        """
        top_skills = missing_skills[:10] if missing_skills else []
        skills_str = ", ".join(top_skills) if top_skills else "General technical alignment"

        prompt = f"""You are an expert technical resume writer and career coach.

Target Job Description Context:
-------------------------------
{jd_text[:1500]}

Candidate Resume Excerpt:
------------------------
{resume_text[:2000]}

Missing Skills / Gap Keywords Identified:
-----------------------------------------
{skills_str}

INSTRUCTIONS:
1. Identify 3 to 5 bullet points from the resume where the missing skills ({skills_str}) can naturally and truthfully be integrated.
2. Rewrite each selected bullet point using the formula:
   [Action Verb] + [Task / Context incorporating Target Skill] + [Measurable Outcome / Business Result].
3. STRICT CONSTRAINT: Do NOT fabricate fake work experience, company names, or exaggerated metrics. Reframe real project experience using the target keywords.
4. Output formatted recommendations with:
   - Original Bullet Point
   - Tailored High-Impact Bullet Point
   - Skill Integrated & Impact Explanation
"""
        return prompt.strip()

    def generate_tailored_suggestions(self, resume_text, jd_text, missing_skills):
        """
        Calls the LLM API if an API key is available, or returns structured fallback suggestions.
        """
        prompt = self.build_prompt(resume_text, jd_text, missing_skills)

        if not self.api_key:
            return {
                "status": "template_mode",
                "message": "No API key detected (GEMINI_API_KEY or OPENAI_API_KEY). Returning structured prompt template.",
                "prompt": prompt,
                "suggestions": self._fallback_template(missing_skills)
            }

        try:
            if self.provider == "gemini":
                from google import genai
                client = genai.Client(api_key=self.api_key)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return {
                    "status": "success",
                    "provider": "Gemini (gemini-2.5-flash)",
                    "tailored_content": response.text
                }
            elif self.provider == "openai":
                import openai
                client = openai.OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a professional resume tailoring assistant."},
                        {"role": "user", "content": prompt}
                    ]
                )
                return {
                    "status": "success",
                    "provider": "OpenAI (gpt-4o-mini)",
                    "tailored_content": response.choices[0].message.content
                }
            else:
                return {"status": "error", "message": f"Unsupported provider: {self.provider}"}
        except Exception as e:
            return {
                "status": "error",
                "message": f"API call failed: {str(e)}",
                "prompt": prompt,
                "suggestions": self._fallback_template(missing_skills)
            }

    def _fallback_template(self, missing_skills):
        """Provides a structured offline preview when running without API keys."""
        top_skills = missing_skills[:5] if missing_skills else ["Python", "Machine Learning"]
        return [
            {
                "target_skill": skill,
                "formula": "Action Verb + Context with Skill + Result",
                "example_template": f"Utilized {skill} to optimize data workflows, driving a 20% improvement in performance."
            }
            for skill in top_skills
        ]