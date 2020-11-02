import csv
import numpy as np

#HSC low=0, high=1
#St sync=0, asycn=1
#Fam nonpref=0, pref=1
#Pt public=0, private=1
#MSC low=0, high=1
#Platform

def F1_submodel(HSC, St):
    return -0.5 + 1.5 * HSC - 0.5 * St

def F2_submodel(Fam, Pt):
    return 1.5 * Fam + 0.5 * Fam * Pt

def F3_submodel(MSC, Platform):

    if Platform == "MB":
        platform_ka = 0
        platform_ta =0
        return -1 + 1.5 * MSC + platform_ka + 1.5 * platform_ta - 0.5 * MSC * platform_ka - 1.5 * MSC * platform_ta
    elif Platform == "KA":
        platform_ka = 1
        platform_ta =0
        return -1 + 1.5 * MSC + platform_ka + 1.5 * platform_ta - 0.5 * MSC * platform_ka - 1.5 * MSC * platform_ta
    elif Platform == "TA":
        platform_ka = 0
        platform_ta = 1
        return -1 + 1.5 * MSC + platform_ka + 1.5 * platform_ta - 0.5 * MSC * platform_ka - 1.5 * MSC * platform_ta


#returns MSC, HSC,
def process_charac(charac):
    #todo: convert True False to 0 or 1

    if charac[0]['has_msc']:
        MSC = 1
    else: MSC = 0
    if charac[0]['has_hsc']:
        HSC = 1
    else: HSC = 0
    if charac[0]['has_fam']:
        Fam = 1
    else: Fam = 0

    # print(MSC)
    # print(HSC)
    # print(Fam)
    return MSC, HSC, Fam

# returns St, Pt, Platform
def process_platform(platform):

    if platform == "MB":
        return 0, 1, platform;
    if platform == "KA":
        return 1, 0, platform;
    if platform == "TA":
        return 0, 1, platform;


class binaryLogisticModel():


    def model(self, charac, platform):

        MSC, HSC, Fam = process_charac(charac)
        St, Pt, Platform = process_platform (platform)
        F1_submodel_output = F1_submodel(HSC, St)
        print('F1_submodel_output :: ', F1_submodel_output)
        F2_submodel_output = F2_submodel(Fam, Pt)
        print('F2_submodel_output :: ', F2_submodel_output)
        F3_submodel_output = F3_submodel(MSC, Platform)
        print('F3_submodel_output :: ', F3_submodel_output)

        model_output = -1.860 + 0.644 * F1_submodel_output - 0.453 * F2_submodel_output + 0.178 * F3_submodel_output

        #turn this into probability/likelihood
        likelihood = 1 / (1 + np.exp(-model_output));
        print('from the binary logistic model class, likelihood score', likelihood);

        return likelihood


if __name__ == "__main__":
    charac = [{'has_msc': True, 'has_hsc': True, 'has_fam': True}]
    #process_charac(charac);
    binaryLogisticModel.model(None, charac, 'MB')