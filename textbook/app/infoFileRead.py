import csv

class infoFileRead():
    def fileRead(self):
        filename = '/Users/isa14/Downloads/2021utilityfolder/supportInfo.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;
            bagdeInfoList = []; #will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    #print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['characteristic'] = row[0];
                    dict['value'] = row[1];
                    dict['supporttype'] = row[2];
                    dict['index'] = row[3];
                    dict['platform'] = row[5];
                    dict['prompt'] = row[6];
                    dict['sentopener1'] = row[7];
                    dict['sentopener2'] = row[8];

                    #print(dict);

                    bagdeInfoList.append(dict);
                    line_count += 1;

        #print(bagdeInfoList)
        #print(len(bagdeInfoList));

        return bagdeInfoList;

    def whiteboardfileRead(self):
        filename = '/Users/isa14/Downloads/2021utilityfolder/wb-period3.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;
            whiteboardInfoList = []; #will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    #print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['whiteboard_id'] = row[1];
                    dict['name'] = row[3];
                    dict['groupID'] = row[4];
                    dict['url'] = row[5];
                    #print(dict);

                    whiteboardInfoList.append(dict);
                    line_count += 1;

        #print(whiteboardInfoList)
        #print(len(whiteboardInfoList));

        return whiteboardInfoList;

    def khanAcademyfileRead(self):
        filename = '/Users/isa14/Downloads/khanacademy.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;
            khanacademyInfoList = []; #will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    #print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['platform'] = row[0];
                    dict['id'] = row[1];
                    dict['url'] = row[2];

                    #print(dict);

                    khanacademyInfoList.append(dict);
                    line_count += 1;

        #print(whiteboardInfoList)
        #print(len(whiteboardInfoList));

        return khanacademyInfoList;

    def usernamefileRead(self):
        filename = '/Users/isa14/Downloads/2021utilityfolder/period3.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;

            userlist = [] #will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    # print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['username'] = row[0];
                    dict['password'] = row[1];
                    dict['class'] = row[2];
                    dict['condition'] = row[3];
                    dict['WBgroup'] = row[4];
                    dict['DGgroup'] = row[5];


                    userlist.append(dict);
                    line_count += 1;

            # print(whiteboardInfoList)
            # print(len(whiteboardInfoList));

            return userlist;

    def characteristicfileRead(self):
        filename = '/Users/isa14/Downloads/2021utilityfolder/period3.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;

            userlist = []  # will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    # print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['username'] = row[0];
                    dict['password'] = row[1];
                    dict['class'] = row[2];
                    dict['condition'] = row[3];
                    dict['WBgroup'] = row[4];
                    dict['DGgroup'] = row[5];

                    userlist.append(dict);
                    line_count += 1;

            # print(whiteboardInfoList)
            # print(len(whiteboardInfoList));

            return userlist;

    def studentCharacfileRead(self):
        filename = '/Users/isa14/Downloads/2021utilityfolder/m-period3-db.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;
            charac = [];  # will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    # print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['name'] = row[0];
                    dict['msc'] = row[5];
                    dict['hsc'] = row[6];
                    dict['fam'] = row[8];
                    dict['con'] = row[7];

                    # print(dict);

                    charac.append(dict);
                    line_count += 1;

        # print(whiteboardInfoList)
        # print(len(whiteboardInfoList));

        return charac;






if __name__ == "__main__":
    infoFileRead.fileRead(None)