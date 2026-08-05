from pydantic import BaseModel, Field

class SocialInput(BaseModel):
    idea: str = Field(description="The SaaS idea to research")

class SocialResponse(BaseModel):
    reddit_threads: list[str] = Field(description="List of relevant thread URLs")
    user_quotes: list[str] = Field(description="Direct quotes from users expressing frustration or WTP")
