import datetime, time
from datetime import timedelta
import random
import json

now = datetime.datetime.now()
start_of_time = now - timedelta(365) # one year ago from now


def main():
    sites = ["Facebook", "Twitter", "LinkedIn", "Pinterest", "Tumblr",
             "Spotify", "LastFM", "SocialNetwork1", "SocialNetwork2",
             "SocialNetwork3", "Professional1", "Professional2",
             "Professional3", "Professional4", "Entertainment1",
             "Entertainment2", "Entertainment3", "Entertainment4",
             "Entertainment5"]


    data = {site: generate_times() for site in sites}
    data = add_categories(data)

    '''
    for site in data:
        print "%s: %d" % (site, len(data[site]["open"]))
    '''

    data = add_variance(data)

    '''
    print "\n\nafter variance"

    for site in data:
        print "%s: %d" % (site, len(data[site]["open"]))
    '''

    # print_stuff(data)

    with open('usage_data.json', 'w') as outfile:
        json.dump(data, outfile)

def add_variance(data):
    '''Makes some apps less frequently used.
    Removes some intermittent and last few sessions.
    This should result in shorter duration, with a longer "last used" date'''
    #keys = data.keys()
    # for i in xrange(0, len(keys), 3):

    # for every site
    for site in data:
        app_data = data[site]
        # remove every nth element
        n = random.randint(3, 20)
        new_open = []
        new_close = []
        old_open = app_data["open"]
        old_close = app_data["close"]
        for j in xrange(len(old_open)):
            if j % n != 0:
                new_open.append(old_open[j])
                new_close.append(old_close[j])

        # remove last k elements to simulate apps you no longer use
        k = random.randint(1, 100)
        for _ in xrange(k):
            new_open.pop()
            new_close.pop()

        app_data["open"] = new_open
        app_data["close"] = new_close

    return data






def print_stuff(data):
    # prints the number of visits for Facebook
    print len(data["Facebook"]["open"])
    print len(data["Facebook"]["close"])

    # prints the duration of each visit to Facebook in H:M:S
    for start, end in zip(data["Facebook"]["open"], data["Facebook"]["close"]):
        print str(timedelta(seconds=end - start))

def add_categories(data):
    categories = ['Social Networks', 'Professional', 'Entertainment']

    data['Facebook']['category'] = categories[0]
    data['Twitter']['category'] = categories[0]
    data['LinkedIn']['category'] = categories[1]
    data['Pinterest']['category'] = categories[2]
    data['Tumblr']['category'] = categories[2]
    data['Spotify']['category'] = categories[2]
    data['LastFM']['category'] = categories[2]
    data['SocialNetwork1']['category'] = categories[0]
    data['SocialNetwork2']['category'] = categories[0]
    data['SocialNetwork3']['category'] = categories[0]
    data['Professional1']['category'] = categories[1]
    data['Professional2']['category'] = categories[1]
    data['Professional3']['category'] = categories[1]
    data['Professional4']['category'] = categories[1]
    data['Entertainment1']['category'] = categories[2]
    data['Entertainment2']['category'] = categories[2]
    data['Entertainment3']['category'] = categories[2]
    data['Entertainment4']['category'] = categories[2]
    data['Entertainment5']['category'] = categories[2]

    return data


def generate_times():
    t = start_of_time
    open_times = []
    close_times = []
    # from the beginning of data collection to now, randomly decides:
    #   a) length of visit
    #   b) time to next visit
    # and records open/close times in arrays, returning as a dict
    while t < now:
        open_times.append(time.mktime(t.timetuple()))
        t += random_timedelta(10, 3600 * 2) # assume 10 seconds to 2 hours spent on site
        close_times.append(time.mktime(t.timetuple()))
        t += random_timedelta(10, 3600 * 9) # assume next access is between 10 seconds and 9 hours later

    return {"open": open_times, "close": close_times}

def random_timedelta(lower, upper):
    '''Returns a timedelta in seconds between lower and upper'''
    return timedelta(0, random.randint(lower, upper))

if __name__ == "__main__":
    main()
