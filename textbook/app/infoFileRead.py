import csv

class infoFileRead():
    def fileRead(self):
        filename = '/Users/isa14/Downloads/supportInfo.csv';

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
                    dict['prompt'] = row[4];
                    dict['sentopener'] = row[5];

                    #print(dict);

                    bagdeInfoList.append(dict);
                    line_count += 1;

        #print(bagdeInfoList)
        #print(len(bagdeInfoList));

        return bagdeInfoList;

    def whiteboardfileRead(self):
        filename = '/Users/isa14/Downloads/whiteboard.csv';

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
                    dict['platform'] = row[0];
                    dict['title'] = row[1];
                    dict['whiteboard_id'] = row[2];
                    dict['user'] = row[3];
                    dict['url'] = row[4];
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




if __name__ == "__main__":
    infoFileRead.fileRead(None)