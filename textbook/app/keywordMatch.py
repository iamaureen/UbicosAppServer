import string

#three ways these keywords are chosen/matched:
#1. common known phrases
#2. sentence openers
#3. previous data

#the following dict contains keywords from #1 and #2
#the keywords are the badgenames (so check with the excel sheet and be consistent, else error)
keywords_dict = \
    {'brainstorm': ['let\'s discuss', 'one way we could start', 'we can approach', 'one approach',
                    'another approach', 'from the video', 'initial idea', 'one idea', 'another idea', 'one way', 'another way', 'one way we could start this problem'],
     'question': ['how', 'what', 'where', 'why', 'can you', 'can',
                  'did', 'do you', 'do we', 'does','what are your thoughts'],
     'critique': ['what evidence', 'answer misses', 'missing', 'doesn\'t seem your answer'],
     'elaborate': ['an example', 'explanation', 'perspective', 'because', 'because of', 'for example'],
     'share': ['clarification', 'clarify', 'share my thoughts', 'we may consider'],
     'challenge': ['what if', 'on the contrary', 'an alternative way', 'instead','what do you think', 'do you agree','do you disagree'],
     'feedback': ['another thing to consider', 'I\'d like to suggest', 'suggestion', 'feedback', 'next time',
                  'sugesting', 'disagree with your approach'],
     'addon': ['add on', 'in addition', 'furthermore', 'moreover', 'an alternative approach', 'sharing an example'],
     'summarize': ['in summary', 'to summarize', 'summarizing', 'combine our approach', 'combine our opinion', 'in your opinion', 'based on the discussion',
                   'based on our discussion', 'based on this discussion'],
     'answer': ['to answer your question', 'I understand what you said', 'I noticed you mentioned', 'you said'],
     'reflect': ['I agree', 'I disagree', 'your answer made me wonder', 'wondering', 'if I understood correctly', 'you mean'],
     'assess': ['is this the same as', 'have you consider', 'have I consider', 'are you saying'],
     'participate': ['I think' , 'my answer is', 'why do we do'], # post length greater than 10,
     'appreciate': ["thank you", "thanks", "good job", "great job", "great work",'that helped when you .. '],
     'encourage': ['brilliant work', 'great job', 'I liked how']
     }

week1_relevance = [];

import re
#sentence_opener dict
class keywordMatch():
    def matchingMethod(self, message, selected_badge):

        #TODO: pre-process messages
        # remove punctuation
        # print(message.translate(str.maketrans('', '', string.punctuation)));

        if(selected_badge == 'question'):
            # todo use the rule-based classifier that I have
            # split messages based on sentence; and see if the
            # keywords are used in the beginning of the sentence
            print('question');
        if(selected_badge == 'participate'):
            #check for the length
            print()

        # for each keywords in the selected list, check if the keyword is present in the user message
        for elem in keywords_dict[selected_badge]:
            if elem in message.lower():
                print("for debug purpose")
                print('elem :: ', elem)
                print('message :: ', message)
                print("matched");
                return True;

        return False;




if __name__ == "__main__":
    #keywordMatch.matchingMethod(None, "Good job", "appreciate");
    keywordMatch.matchingMethod(None, "Yes because you have to have a formula?", "elaborate");