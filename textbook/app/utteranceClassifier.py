

#three ways these keywords are chosen/matched:
#1. common known phrases
#2. sentence openers
#3. previous data

#the following dict contains keywords from #1 and #2
#the keywords are the badgenames (so check with the excel sheet and be consistent, else error)
keywords_dict = \
    {'brainstorm': ['this reminds me', 'let\'s discuss', 'one way we could start', 'we can approach', 'one approach','i think',
                    'another approach', 'from the video', 'initial idea', 'one idea', 'another idea', 'one way', 'another way', 'one way we could start this problem','what strategy'],
     'question': ['how', 'what', 'where', 'why', 'can you', 'can', 'can someone', 'would you'
                  'did', 'do you', 'do we', 'does','what are your thoughts','which', 'is this'],
     'critique': ['your answer is wrong', 'what evidence', 'answer misses', 'missing', 'doesn\'t seem your answer', 'unless', 'convinced'],
     'elaborate': ['since','this reminds me', 'in my opinion', 'an example', 'explanation', 'perspective', 'because', 'because of', 'for example'],
     'share': ['I feel the same way', 'this reminds me', 'in my opinion', 'clarification', 'clarify', 'share my thoughts', 'we may consider','i think',
               'can someone'],
     'challenge': ['your answer is wrong','what if', 'on the contrary', 'an alternative way', 'instead','what do you think', 'do you agree','do you disagree','is this'],
     'feedback': ['Maybe', 'either', 'another thing to consider', 'I\'d like to suggest', 'suggestion', 'feedback', 'next time',
                  'sugesting', 'disagree with your approach', 'should', 'can', 'supposed to'],
     'addon': ['this reminds me', 'add on', 'in addition', 'furthermore', 'moreover', 'an alternative approach', 'sharing an example'],
     'summarize': ['in summary', 'to summarize', 'summarizing', 'combine our approach', 'combine our opinion', 'in your opinion', 'based on the discussion',
                   'based on our discussion', 'based on this discussion'],
     'answer': ['this reminds me', 'to answer your question', 'I understand what you said', 'I noticed you mentioned', 'you said', 'because'],
     'reflect': ['I feel the same way', 'have to agree', 'have to disagree', 'in my opinion', 'I agree', 'I disagree', 'i kind of agree',
                 'your answer made me wonder', 'wondering', 'if I understood correctly', 'you mean'],
     'assess': ['is this the same as', 'have you consider', 'have I consider', 'are you saying', 'is this'],
     'participate': ['I think' , 'my answer is', 'why do we do'], # post length greater than 10,
     'appreciate': ["thank you", "thanks", "good job", "great job", "great work",'that helped when you .. ',
                    'like it', 'love it', 'cool work', 'really good', 'like how you'],
     'encourage': ['brilliant work', 'great job', 'I liked how','it is fine','i like', 'like it','like how you']
     }

week1_relevance = [];

import re
import string
from dialog_tag import DialogTag
import random

model = DialogTag('distilbert-base-uncased')

class utteranceClassifier():
    def classifierMethod(self, message):

        rewardType = ''
        postTag = model.predict_tag(message)


        if postTag == 'Wh-Question' or postTag == 'Open-Question' or postTag == 'Rhetorical-Questions' or postTag == 'Yes-no-Question':
            rewardType = 'Question'
        elif postTag == 'Action-directive':
            rewardType = 'Feedback'
        elif postTag == 'Appreciation':
            rewardType = 'Appreciate'
        elif postTag == 'Conventional-closing':
            rewardType = 'Social'
        elif postTag == 'Agree/Accept':
            rewardType = 'Transactive'

        print('utteranceclassifier.py line 60 :: ', message, rewardType)

        #TODO: add the praise

        praise_messages_part1_list = ['Very Good!', 'Well Done!', 'Way to go!', 'Wonderful!', 'Great Effort!', 'Nice One!'];
        praise_messages_part1 = random.choice(praise_messages_part1_list);

        # the keywords are the badgenames (so check with the excel sheet and be consistent, else error)
        praise_message_part2_dict = \
            {'brainstorm': 'This will help you to understand better.',
             'question': 'Asking questions helps you to understand better.',
             'critique': 'This will help you to understand better.',
             'elaborate': 'This will benefit your help-giving skills.',
             'share': 'Sharing thoughts helps you to put them into words.',
             'challenge': 'This will benefit your help-giving skills.',
             'feedback': 'Your feedback to others is highly appreciated!',
             'addon': 'Adding to an existing conversation is useful.',
             'summarize': 'Summarizing is a great skill.',
             'transactive': 'Responding to others is a great way of learning.',
             'reflect': 'Reflecting on others work is good.',
             'assess': 'Evaluating others work is a skill!',
             'participate': 'Participation is a great collaborative technique!',
             'appreciate': 'Appreciating others encourages collaboration.',
             'encourage': 'Encouraging others helps in a collaboration.',
             'social': 'You are doing a great job!'
             }

        # praised text generated randomly
        if rewardType:
            praiseText = praise_messages_part1 +' '+praise_message_part2_dict[rewardType.lower()];
        else:
            praiseText = "empty"
        return rewardType, praiseText; #returns to broadcaseImageComment


if __name__ == "__main__":
    #keywordMatch.matchingMethod(None, "Good job", "appreciate");
    utteranceClassifier.matchingMethod(None, "Yes because you have to have a formula?");