from django.db import models
from django.conf import settings
import jsonfield

# Create your models here.

# the following model is contains students static survey responses, it is filled manually after the students complete the survey
class studentCharacteristicModel (models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    has_msc = models.BooleanField(default=False)
    has_hsc = models.BooleanField(default=False)
    has_fam = models.BooleanField(default=False)
    has_con = models.BooleanField(default=False)
    has_social = models.BooleanField(default=False)

# the following model contains students motivational changes based on the persona tool
class studentPersonalityChangeTable (models.Model):
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    char_msc = models.CharField(max_length=200)
    char_hsc = models.CharField(max_length=200)
    char_fam = models.CharField(max_length=200)
    char_con = models.CharField(max_length=200)
    char_name = models.CharField(max_length=100)
    event = models.CharField(max_length=50)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)


# the following model saves students participation history across the platforms
class participationHistory (models.Model):
    platform = models.CharField(max_length=20)
    activity_id = models.IntegerField()
    didParticipate = models.CharField(max_length=20)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)

class computationalModelLog(models.Model):
    likelihood = models.FloatField()
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity_id = models.IntegerField()
    platform = models.CharField(max_length=20)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.student.username)


# saves the image uploaded in the gallery
class imageModel(models.Model):

    gallery_id = models.IntegerField()
    group_id = models.IntegerField()
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='images')

    class Meta:
        unique_together = (('posted_by', 'id'),)

    #https://docs.djangoproject.com/en/2.0/topics/serialization/
    #https://stackoverflow.com/questions/28591176/serializing-django-model-and-including-further-information-for-foreignkeyfield
    def natural_key(self):
        #return (self.posted_by.username)
        return (self.id)

# saves comment from the digital gallery discussion
class imageComment(models.Model):
    content = models.CharField(max_length=400)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)
    imageId = models.ForeignKey(imageModel, on_delete=models.CASCADE)
    activityID = models.IntegerField(null=True)

    def natural_key(self):
        return (self.posted_by.username)

# saves comment from the individual commenting section
class individualMsgComment(models.Model):
    activityID = models.IntegerField(null=True)
    imageId = models.ForeignKey(imageModel, on_delete=models.CASCADE)
    content = models.CharField(max_length=400)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)


class khanAcademyAnswer(models.Model):
    ka_id = models.IntegerField()
    ka_image = models.ImageField(upload_to='ka_images')
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)
    response_type = models.CharField(max_length=20)
    response = models.CharField(max_length=2000)

    def natural_key(self):
        return (self.posted_by.username)

# saves KA messages
class KAPostModel(models.Model):
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title =  models.CharField(max_length=100)
    textareaID = models.CharField(max_length=20)
    content = models.CharField(max_length=400)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)

# saves messages from the chat activity; activity feed message
class Message(models.Model):
    content = models.CharField(max_length=400)
    activity_id = models.IntegerField(null=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)

# holds the badge Info, updated from an excel sheet
class badgeInfo(models.Model):
    charac = models.CharField(max_length=20)
    value =  models.CharField(max_length=20)
    supportType = models.CharField(max_length=20)
    index = models.IntegerField(null=True)
    platform = models.CharField(max_length=20)
    prompt = models.CharField(max_length=20)
    sentence_opener1 = models.CharField(max_length=1000);

# logs what badge user selected
class badgeOffered(models.Model):
    userid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    platform = models.CharField(max_length=10)
    activity_id = models.IntegerField(null=True)
    badgeTypeOffered = models.TextField(null=True)

    def natural_key(self):
        return (self.userid.username)


# logs what badge user received
class badgeReceived(models.Model):
    userid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    platform = models.CharField(max_length=10)
    activity_id = models.IntegerField(null=True)
    message = models.CharField(max_length=400)
    badgeReceived = models.CharField(max_length=400)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.userid.username)

# saves the different notes that is created
class brainstormNote(models.Model):
    brainstormID = models.IntegerField(null=True)
    ideaText = models.CharField(max_length=400)
    color = models.CharField(max_length=20)
    position_top = models.CharField(max_length=20)
    position_left = models.CharField(max_length=20)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def natural_key(self):
        return (self.posted_by.username)

# saves the students table data
class tableChartData(models.Model):
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    table_id = models.IntegerField(null=True)
    plot_type = models.CharField(max_length=20) #enumeration
    plot_data = jsonfield.JSONField() #https://stackoverflow.com/questions/37007109/django-1-9-jsonfield-in-models

# saves the students individual work data
class userQuesAnswerTable(models.Model):
    questionIDbyPage = models.IntegerField(null=True)
    answer = jsonfield.JSONField()
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

#whiteboard table info table
# 5 group of 3 students, one group of 4 students
class khanAcademyInfoTable(models.Model):
    platform = models.CharField(max_length=10)
    KA_id = models.IntegerField(null=True)
    url = models.CharField(max_length=300)

class whiteboardInfoTable(models.Model):
    whiteboard_activityID = models.IntegerField(null=True)
    userid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    whiteboard_link = models.CharField(max_length=300)

    def natural_key(self):
        return (self.posted_by.username)

#temp solution for pilot-1 -- start
class groupInfo(models.Model):
    activityID = models.IntegerField(null=True)
    group = models.IntegerField(null=True)
    users = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return '%s %s' % (self.activityID, self.group)
#temp solution for pilot-1 -- end

# logs user action
class userLogTable(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20)
    type = models.CharField(max_length=200)
    input = models.CharField(max_length=200)
    pagenumber = models.IntegerField(null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
